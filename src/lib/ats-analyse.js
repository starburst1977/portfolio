// ATS reading check: what a text-based parser gets out of a CV PDF.
// Runs entirely in the browser (and in Node for tests). The PDF never leaves the machine.
// pdf.js is passed in, so the same code works with the browser and the Node build.
//
// What it looks at:
// - text layer: is there real text, or only images (a scan, a "print as image" export)?
// - reading order: does the stored text jump back up within a column? Parsers that read a
//   PDF in stored order then attach lines to the wrong section (e.g. achievements under
//   the next job).
// - contact details, section headings, problem characters, length, document title.

const EMAIL = /[\w.+-]+@[\w-]+(\.[\w-]+)+/;
const PHONE = /(\+|\b0)[\d][\d\s()/.-]{6,}\d/;
const SECTIONS = {
  experience: /\b(experience|work history|employment|career|berufserfahrung|berufliche erfahrung|werdegang|praxis|erfahrung)\b/i,
  education: /\b(education|qualifications?|academic|ausbildung|bildung|studium|schule)\b/i,
  skills: /\b(skills|competencies|expertise|tools|kenntnisse|fähigkeiten|kompetenzen|fertigkeiten)\b/i,
};
const LIGATURE = /[ﬀ-ﬆ]/g;
const PRIVATE_USE = /[-]/g;
const REPLACEMENT = /�/g;

const snippet = (s, n = 60) => {
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
};

/**
 * @param {object} pdfjs  the pdf.js module (getDocument)
 * @param {Uint8Array} data  the PDF file
 */
export async function analysePdf(pdfjs, data) {
  let doc;
  try {
    doc = await pdfjs.getDocument({ data, verbosity: 0, isEvalSupported: false }).promise;
  } catch (err) {
    if (err?.name === 'PasswordException') return { error: 'password' };
    return { error: 'unreadable' };
  }

  const pages = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    const { width, height } = page.getViewport({ scale: 1 });
    const tc = await page.getTextContent();
    const items = tc.items
      .filter((i) => typeof i.str === 'string')
      .map((i) => ({
        str: i.str,
        eol: !!i.hasEOL,
        x: i.transform[4],
        y: i.transform[5],
        w: i.width,
        size: Math.hypot(i.transform[2], i.transform[3]) || Math.abs(i.transform[3]) || 10,
      }));
    pages.push({ n, width, height, items });
  }
  let title = '';
  try { title = ((await doc.getMetadata())?.info?.Title ?? '').trim(); } catch { /* none */ }
  await doc.destroy?.();

  // ---- stored-order text, as a stored-order parser reads it ----
  const text = pages.map((p) => p.items.map((i) => i.str + (i.eol ? '\n' : '')).join('')).join('\n\n');
  const visible = text.replace(/\s/g, '');
  const words = (text.match(/[\p{L}\p{N}][\p{L}\p{N}'’.-]*/gu) ?? []).length;
  const thinPages = pages.filter((p) => p.items.map((i) => i.str).join('').replace(/\s/g, '').length < 80).map((p) => p.n);

  // ---- reading order: upward jumps within a column ----
  // Walk the stored items. A jump is when the next non-empty item sits clearly above the
  // previous one (more than two lines up) while overlapping it horizontally, i.e. in the
  // same column. Moving from the bottom of one column to the top of the next one is normal
  // and has no horizontal overlap, so it doesn't count.
  // Small swaps (a date stored just before its own two-line heading) are harmless and
  // ignored; a jump of more than four lines is real, more than eight is severe.
  const jumps = [];
  const meaningful = (s) => /[\p{L}\p{N}]{2,}/u.test(s); // skip lone bullets and punctuation
  for (const p of pages) {
    const it = p.items.filter((i) => i.str.trim() && meaningful(i.str));
    for (let k = 1; k < it.length; k++) {
      const b = it[k];
      // The last item stored before b in the same column (horizontal overlap). Comparing
      // against that, not just the previous item, also catches text that returns to a
      // column above where that column left off, as in two-column layouts.
      let a = null;
      for (let m = k - 1; m >= 0; m--) {
        const c = it[m];
        const overlap = Math.min(c.x + c.w, b.x + b.w) - Math.max(c.x, b.x);
        if (overlap > 0 || Math.abs(c.x - b.x) < p.width * 0.03) { a = c; break; }
      }
      if (!a) continue;
      const lines = (b.y - a.y) / Math.max(a.size, b.size, 6);
      if (lines > 4) {
        jumps.push({ page: p.n, lines: Math.round(lines), after: snippet(a.str, 50), next: snippet(b.str, 50) });
      }
    }
  }

  // ---- characters that break keyword matching ----
  const odd = [
    ...(text.match(LIGATURE) ?? []).map((c) => ({ kind: 'ligature', char: c })),
    ...(text.match(PRIVATE_USE) ?? []).map((c) => ({ kind: 'private', char: c })),
    ...(text.match(REPLACEMENT) ?? []).map((c) => ({ kind: 'replacement', char: c })),
  ];

  // Letter-spaced headings ("E X P E R I E N C E"): some parsers keep the spaces, so a
  // heading search for "Experience" fails. Collapse them for the section check, and report
  // them separately.
  const spaced = [...new Set(text.match(/(?:^|\s)((?:\p{Lu} ){3,}\p{Lu})(?=\s|$)/gmu) ?? [])].map((m) => m.trim());
  const collapsed = text.replace(/(?:\p{Lu} ){3,}\p{Lu}/gu, (m) => m.replace(/ /g, ''));
  const sectionsFound = Object.entries(SECTIONS).filter(([, re]) => re.test(collapsed)).map(([k]) => k);

  return {
    pages: pages.length,
    words,
    chars: visible.length,
    thinPages,
    hasText: visible.length >= 200,
    imageOnly: visible.length < 200,
    title,
    email: (text.match(EMAIL) ?? [null])[0],
    phone: (text.match(PHONE) ?? [null])[0],
    sections: sectionsFound,
    jumps,
    spaced,
    odd,
    text,
  };
}

/** Turns the raw analysis into checks with a status: ok, warn, fail or info. */
export function checks(r) {
  if (r.error) return [];
  const out = [];
  out.push(r.hasText
    ? { id: 'text', status: r.thinPages.length ? 'warn' : 'ok', pages: r.thinPages }
    : { id: 'text', status: 'fail' });
  if (!r.hasText) return out;
  const severe = r.jumps.some((j) => j.lines > 8);
  out.push({ id: 'order', status: severe || r.jumps.length >= 2 ? 'fail' : r.jumps.length === 1 ? 'warn' : 'ok', jumps: r.jumps });
  out.push({ id: 'contact', status: r.email && r.phone ? 'ok' : r.email || r.phone ? 'warn' : 'fail', email: r.email, phone: r.phone });
  out.push({ id: 'sections', status: r.sections.length >= 2 ? 'ok' : 'warn', found: r.sections });
  out.push({ id: 'spacing', status: r.spaced.length ? 'warn' : 'ok', spaced: r.spaced });
  out.push({ id: 'chars', status: r.odd.length ? 'warn' : 'ok', odd: r.odd });
  out.push({ id: 'length', status: r.pages > 3 ? 'warn' : 'info', pages: r.pages, words: r.words });
  out.push({ id: 'title', status: 'info', title: r.title });
  return out;
}

// Points each finding costs, out of 100. Shown next to each check, so the score is never a
// black box. An image-only PDF scores 0: nothing else matters if there's no text.
const COST = {
  text: { warn: 10 },
  order: { fail: 35, warn: 10 },
  contact: { fail: 30, warn: 7 },
  sections: { warn: 10 },
  spacing: { warn: 8 },
  chars: { warn: 8 },
  length: { warn: 5 },
};

/** Overall score 0 to 100, the band (ok, warn, fail) and each check's deduction. */
export function score(list) {
  if (list.some((c) => c.id === 'text' && c.status === 'fail')) {
    return { score: 0, band: 'fail', cost: { text: 100 } };
  }
  const cost = {};
  for (const c of list) {
    const pts = COST[c.id]?.[c.status];
    if (pts) cost[c.id] = pts;
  }
  const s = Math.max(0, 100 - Object.values(cost).reduce((a, b) => a + b, 0));
  return { score: s, band: s >= 90 ? 'ok' : s >= 70 ? 'warn' : 'fail', cost };
}
