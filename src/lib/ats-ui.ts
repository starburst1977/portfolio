// Browser side of the ATS check: file handling, rendering of results, wording per language.
// Shared by /apply-kit/ats-check/ (en) and /apply-kit/de/ats-check/ (de). Analysis lives in
// ats-analyse.js; pdf.js is loaded from the site's own /vendor/pdfjs/, never from a CDN.

import { analysePdf, checks, score } from './ats-analyse.js';

type Check = any;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

interface Strings {
  label: Record<string, string>;
  section: Record<string, string>;
  tag: Record<string, string>;
  verdict: Record<string, [string, string]>;
  verdictMinor: string;
  scoreNote: string;
  noText: string;
  status: { notPdf: string; tooBig: string; reading: string; password: string; unreadable: string; failed: string };
  explain: (c: Check) => string;
}

const en: Strings = {
  label: {
    text: 'Real text', order: 'Reading order', contact: 'Contact details', sections: 'Section headings',
    spacing: 'Letter spacing', chars: 'Problem characters', length: 'Length', title: 'Document title',
  },
  section: { experience: 'Experience', education: 'Education', skills: 'Skills' },
  tag: { ok: 'Good', warn: 'Check', fail: 'Problem', info: 'Info' },
  verdict: {
    ok: ['Reads cleanly', 'A parser gets real text, in order, with your contact details and headings.'],
    warn: ['Readable, with things to check', 'The basics work. Have a look at the points marked “Check” below.'],
    fail: ['A parser will likely get this wrong', 'At least one problem below can make a system misread or miss parts of your CV.'],
  },
  verdictMinor: 'A parser gets real text, in order, with your contact details and headings. One or two small points below.',
  scoreNote: 'The score starts at 100; each finding takes off the points shown next to it. A PDF without real text scores 0.',
  noText: '(no text found)',
  status: {
    notPdf: 'That isn’t a PDF. Export your CV as PDF and drop it in again.',
    tooBig: 'That file is over 20 MB. A CV is usually well under 2 MB.',
    reading: 'Reading your CV…',
    password: 'This PDF is password-protected. Many systems can’t open those either; save it without a password.',
    unreadable: 'This PDF couldn’t be read. It may be damaged; export it again and retry.',
    failed: 'Something went wrong reading this file. Try exporting the PDF again.',
  },
  explain(c) {
    const S = en.section;
    switch (c.id) {
      case 'text':
        if (c.status === 'fail') return 'No readable text. Your CV is probably an image (a scan, or exported as a picture). Most systems see an empty page.';
        if (c.status === 'warn') return `Your PDF has real text, but page ${c.pages.join(', ')} has almost none. If it holds content, that content may be an image.`;
        return 'Your PDF has a real, selectable text layer.';
      case 'order': {
        if (c.status === 'ok') return 'The text is stored in reading order.';
        const j = c.jumps.slice(0, 3).map((x: any) => `<li>“${esc(x.next)}” is stored after “${esc(x.after)}”, which sits ${x.lines} lines further down the page.</li>`).join('');
        return (c.status === 'fail'
          ? 'The text is stored out of reading order. A parser that reads in stored order may put lines in the wrong section, for example achievements under the wrong job.'
          : 'The text jumps back up the page once. Often harmless, but worth a look.') + `<ul class="mt-2 space-y-1 list-disc pl-5">${j}</ul>`;
      }
      case 'contact':
        if (c.status === 'ok') return `Found an email address (${esc(c.email)}) and a phone number (${esc(c.phone)}).`;
        if (c.status === 'warn') return c.email ? `Found an email address (${esc(c.email)}) but no phone number.` : `Found a phone number (${esc(c.phone)}) but no email address.`;
        return 'No email address or phone number found as text. If they’re in an image, a logo or an icon font, parsers miss them.';
      case 'sections':
        if (c.status === 'ok') return `Found standard headings: ${c.found.map((f: string) => S[f]).join(', ')}.`;
        return `Couldn’t find standard headings for ${['experience', 'education', 'skills'].filter((s) => !c.found.includes(s)).map((s) => S[s]).join(' or ')}. Parsers look for words like Experience or Berufserfahrung.`;
      case 'spacing':
        if (c.status === 'ok') return 'No letter-spaced headings.';
        return `Spaced-out letters such as “${esc(c.spaced[0])}”. Some parsers read these as single letters, so the heading isn’t recognised. Headings with normal letter spacing are safer.`;
      case 'chars':
        if (c.status === 'ok') return 'No characters that break keyword search.';
        return `Found ${c.odd.length} character${c.odd.length > 1 ? 's' : ''} that can break keyword search, for example ligatures like “ﬁ”: a search for “finance” won’t find “ﬁnance”.`;
      case 'length':
        return c.status === 'warn' ? `${c.pages} pages, ${c.words} words. Long for most roles.` : `${c.pages} page${c.pages > 1 ? 's' : ''}, ${c.words} words.`;
      case 'title':
        return c.title ? `The document title is “${esc(c.title)}”. Some systems show it to recruiters, so it should be your name, not a file name.` : 'No document title set. Some systems show it to recruiters; your name is a good title.';
    }
    return '';
  },
};

const de: Strings = {
  label: {
    text: 'Echter Text', order: 'Lesereihenfolge', contact: 'Kontaktdaten', sections: 'Abschnittsüberschriften',
    spacing: 'Sperrschrift', chars: 'Problemzeichen', length: 'Umfang', title: 'Dokumenttitel',
  },
  section: { experience: 'Berufserfahrung', education: 'Ausbildung', skills: 'Kenntnisse' },
  tag: { ok: 'Gut', warn: 'Prüfen', fail: 'Problem', info: 'Info' },
  verdict: {
    ok: ['Wird sauber gelesen', 'Ein Parser bekommt echten Text, in der richtigen Reihenfolge, mit Kontaktdaten und Überschriften.'],
    warn: ['Lesbar, mit Punkten zum Prüfen', 'Die Grundlagen stimmen. Schauen Sie sich die Punkte mit „Prüfen“ unten an.'],
    fail: ['Ein Parser liest das wahrscheinlich falsch', 'Mindestens ein Problem unten kann dazu führen, dass ein System Teile Ihres Lebenslaufs falsch liest oder übersieht.'],
  },
  verdictMinor: 'Ein Parser bekommt echten Text, in der richtigen Reihenfolge, mit Kontaktdaten und Überschriften. Ein, zwei Kleinigkeiten stehen unten.',
  scoreNote: 'Die Wertung startet bei 100; jeder Befund zieht die daneben stehenden Punkte ab. Ein PDF ohne echten Text bekommt 0.',
  noText: '(kein Text gefunden)',
  status: {
    notPdf: 'Das ist kein PDF. Exportieren Sie Ihren Lebenslauf als PDF und ziehen Sie ihn noch einmal hierher.',
    tooBig: 'Die Datei ist größer als 20 MB. Ein Lebenslauf hat normalerweise deutlich unter 2 MB.',
    reading: 'Ihr Lebenslauf wird gelesen…',
    password: 'Dieses PDF ist passwortgeschützt. Viele Systeme können es dann auch nicht öffnen; speichern Sie es ohne Passwort.',
    unreadable: 'Dieses PDF ließ sich nicht lesen. Es ist vielleicht beschädigt; exportieren Sie es neu und versuchen Sie es noch einmal.',
    failed: 'Beim Lesen der Datei ist etwas schiefgegangen. Exportieren Sie das PDF bitte neu.',
  },
  explain(c) {
    const S = de.section;
    switch (c.id) {
      case 'text':
        if (c.status === 'fail') return 'Kein lesbarer Text. Ihr Lebenslauf ist vermutlich ein Bild (ein Scan oder als Bild exportiert). Die meisten Systeme sehen eine leere Seite.';
        if (c.status === 'warn') return `Ihr PDF enthält echten Text, aber Seite ${c.pages.join(', ')} fast keinen. Steht dort etwas, ist es womöglich ein Bild.`;
        return 'Ihr PDF hat eine echte, markierbare Textebene.';
      case 'order': {
        if (c.status === 'ok') return 'Der Text ist in Lesereihenfolge gespeichert.';
        const j = c.jumps.slice(0, 3).map((x: any) => `<li>„${esc(x.next)}“ ist nach „${esc(x.after)}“ gespeichert, das ${x.lines} Zeilen weiter unten auf der Seite steht.</li>`).join('');
        return (c.status === 'fail'
          ? 'Der Text ist nicht in Lesereihenfolge gespeichert. Ein Parser, der in gespeicherter Reihenfolge liest, ordnet Zeilen womöglich dem falschen Abschnitt zu, zum Beispiel Erfolge der falschen Stelle.'
          : 'Der Text springt einmal auf der Seite zurück nach oben. Oft harmlos, aber einen Blick wert.') + `<ul class="mt-2 space-y-1 list-disc pl-5">${j}</ul>`;
      }
      case 'contact':
        if (c.status === 'ok') return `E-Mail-Adresse (${esc(c.email)}) und Telefonnummer (${esc(c.phone)}) gefunden.`;
        if (c.status === 'warn') return c.email ? `E-Mail-Adresse gefunden (${esc(c.email)}), aber keine Telefonnummer.` : `Telefonnummer gefunden (${esc(c.phone)}), aber keine E-Mail-Adresse.`;
        return 'Weder E-Mail-Adresse noch Telefonnummer als Text gefunden. Stehen sie in einem Bild, Logo oder Icon-Font, übersehen Parser sie.';
      case 'sections':
        if (c.status === 'ok') return `Übliche Überschriften gefunden: ${c.found.map((f: string) => S[f]).join(', ')}.`;
        return `Keine übliche Überschrift für ${['experience', 'education', 'skills'].filter((s) => !c.found.includes(s)).map((s) => S[s]).join(' oder ')} gefunden. Parser suchen nach Wörtern wie Berufserfahrung oder Experience.`;
      case 'spacing':
        if (c.status === 'ok') return 'Keine gesperrten Überschriften.';
        return `Gesperrte Buchstaben wie „${esc(c.spaced[0])}“. Manche Parser lesen das als einzelne Buchstaben, dann wird die Überschrift nicht erkannt. Überschriften mit normalem Buchstabenabstand sind sicherer.`;
      case 'chars':
        if (c.status === 'ok') return 'Keine Zeichen, die die Stichwortsuche stören.';
        return `${c.odd.length} Zeichen gefunden, die die Stichwortsuche stören können, etwa Ligaturen wie „ﬁ“: Eine Suche nach „Zertifikat“ findet „Zertiﬁkat“ nicht.`;
      case 'length':
        return c.status === 'warn' ? `${c.pages} Seiten, ${c.words} Wörter. Für die meisten Stellen lang.` : `${c.pages} Seite${c.pages > 1 ? 'n' : ''}, ${c.words} Wörter.`;
      case 'title':
        return c.title ? `Der Dokumenttitel lautet „${esc(c.title)}“. Manche Systeme zeigen ihn Personalern an, er sollte also Ihr Name sein, kein Dateiname.` : 'Kein Dokumenttitel gesetzt. Manche Systeme zeigen ihn Personalern an; Ihr Name ist ein guter Titel.';
    }
    return '';
  },
};

// ---------------------------------------------------------------- rendering

// Status colours, matching the Apply Kit pages (src/styles/apply-kit.css).
const TONE: Record<string, { icon: string; fg: string; row: string }> = {
  ok: { icon: 'check', fg: 'text-ok', row: '' },
  warn: { icon: 'alert', fg: 'text-warn', row: 'bg-[#FFFBEB]' },
  fail: { icon: 'x', fg: 'text-fail', row: 'bg-[#FEF2F2]' },
  info: { icon: 'info', fg: 'text-muted', row: '' },
};
const BAND: Record<string, { pill: string; ring: string }> = {
  ok: { pill: 'bg-[#F0FDF4] text-[#15803D]', ring: '#4F46E5' },
  warn: { pill: 'bg-[#FFFBEB] text-[#B45309]', ring: '#D97706' },
  fail: { pill: 'bg-[#FEF2F2] text-[#B91C1C]', ring: '#DC2626' },
};
// Lucide circle-check / circle-alert / circle-x / info, inlined so the results need no icon lookups.
const ICON: Record<string, string> = {
  check: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  alert: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  x: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
};
const svg = (name: string, cls: string) => `<svg class="${cls}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name]}</svg>`;
const RING = 2 * Math.PI * 42;

export function initAtsCheck(lang: 'en' | 'de', base: string) {
  const t = lang === 'de' ? de : en;
  const $ = (id: string) => document.getElementById(id)!;
  const show = (state: 'empty' | 'reading' | 'result') => {
    $('report-empty').hidden = state !== 'empty';
    $('report-reading').hidden = state !== 'reading';
    $('report').hidden = state !== 'result';
  };

  let pdfjs: any = null;
  async function loadPdfjs() {
    if (pdfjs) return pdfjs;
    pdfjs = await import(/* @vite-ignore */ `${base}/vendor/pdfjs/pdf.min.mjs`);
    pdfjs.GlobalWorkerOptions.workerSrc = `${base}/vendor/pdfjs/pdf.worker.min.mjs`;
    return pdfjs;
  }

  function fail(msg: string) {
    $('status').textContent = msg;
    $('status').hidden = false;
    show('empty');
  }

  async function run(file: File) {
    $('status').hidden = true;
    if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') return fail(t.status.notPdf);
    if (file.size > 20 * 1024 * 1024) return fail(t.status.tooBig);
    $('file-name').textContent = file.name;
    $('file-meta').textContent = `${Math.max(1, Math.round(file.size / 1024))} KB`;
    $('file-row').hidden = false;
    show('reading');
    try {
      const lib = await loadPdfjs();
      const r: any = await analysePdf(lib, new Uint8Array(await file.arrayBuffer()));
      if (r.error) return fail(r.error === 'password' ? t.status.password : t.status.unreadable);
      if (r.pages) $('file-meta').textContent += ` · ${r.pages} ${lang === 'de' ? (r.pages > 1 ? 'Seiten' : 'Seite') : (r.pages > 1 ? 'pages' : 'page')}`;
      const list = checks(r);
      const { score: total, band, cost } = score(list) as { score: number; band: string; cost: Record<string, number> };
      const minor = list.some((c: Check) => c.status === 'warn' || c.status === 'fail');
      const [h, p0] = t.verdict[band];

      $('score').textContent = String(total);
      const arc = $('score-arc') as unknown as SVGCircleElement;
      arc.style.stroke = BAND[band].ring;
      arc.style.strokeDashoffset = String(RING * (1 - total / 100));
      $('verdict-pill').className = `inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${BAND[band].pill}`;
      $('verdict-pill').innerHTML = svg(band === 'ok' ? 'check' : band === 'warn' ? 'alert' : 'x', 'h-3.5 w-3.5') + esc(h);
      $('verdict-text').textContent = band === 'ok' && minor ? t.verdictMinor : p0;

      $('findings').innerHTML = list.map((c: Check) => {
        const tone = TONE[c.status];
        const pts = cost[c.id] ? `<span class="font-mono text-xs font-semibold ${tone.fg}">−${cost[c.id]}</span>`
          : `<span class="font-mono text-xs text-[#A1A1AA]">${c.status === 'info' ? t.tag.info : '0'}</span>`;
        return `<li class="flex items-center gap-3.5 border-t border-line px-4 py-3.5 first:border-t-0 md:px-7 ${tone.row}">`
          + svg(tone.icon, `shrink-0 ${tone.fg}`)
          + `<div class="min-w-0 flex-1"><p class="text-[15px] font-semibold">${t.label[c.id]}</p><div class="mt-0.5 text-sm leading-relaxed text-muted">${t.explain(c)}</div></div>`
          + `<span class="w-10 shrink-0 text-right">${pts}</span></li>`;
      }).join('');
      $('parsed').textContent = r.text.trim() || t.noText;
      selectTab('findings');
      show('result');
      if (window.matchMedia('(max-width: 1023px)').matches) $('report').scrollIntoView({ behavior: 'smooth', block: 'start' });
      (window as any).plausible?.('ATS Check', { props: { result: band, score: String(Math.round(total / 10) * 10), lang } });
    } catch {
      fail(t.status.failed);
    }
  }

  function selectTab(name: string) {
    document.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === name)));
    $('panel-findings').hidden = name !== 'findings';
    $('panel-parsed').hidden = name !== 'parsed';
  }
  document.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((b) => b.addEventListener('click', () => selectTab(b.dataset.tab!)));

  const input = $('file') as HTMLInputElement;
  input.addEventListener('change', () => input.files?.[0] && run(input.files[0]));
  $('file-clear').addEventListener('click', () => {
    input.value = '';
    $('file-row').hidden = true;
    $('status').hidden = true;
    show('empty');
  });
  const drop = $('drop');
  const on = (ev: Event) => { ev.preventDefault(); drop.dataset.over = 'true'; };
  const off = (ev: Event) => { ev.preventDefault(); delete drop.dataset.over; };
  ['dragenter', 'dragover'].forEach((e) => drop.addEventListener(e, on));
  ['dragleave', 'drop'].forEach((e) => drop.addEventListener(e, off));
  drop.addEventListener('drop', (ev: DragEvent) => { const f = ev.dataTransfer?.files?.[0]; if (f) run(f); });
}
