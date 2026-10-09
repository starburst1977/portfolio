// Shared data for the Apply Kit pages: links, navigation, the layouts and the articles.
// Everything user-facing comes in English and German; pages pick with `lang`.

export type Lang = 'en' | 'de';

export const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export const GITHUB = 'https://github.com/starburst1977/apply-kit';
// Polar checkouts for the Layout Pack. EN succeeds to /apply-kit/thanks/, DE to /apply-kit/de/thanks/.
export const PACK_URL: Record<Lang, string> = {
  en: 'https://buy.polar.sh/polar_cl_NmROLmRsVNrLNKKkFgJAEBsBnHEwqMfQgLxwi3gB17Y',
  de: 'https://buy.polar.sh/polar_cl_oy5ZBeS71ub3jzTs6Hfl86JcHbQhbn0Wo7OZn4QHc1s',
};
export const PACK_PRICE = '19 €';
export const KIT_MIN = '1.1.1';

/** Site-relative URLs of the Apply Kit pages, per language. */
export const routes = {
  home: { en: `${base}/apply-kit/`, de: `${base}/apply-kit/de/` },
  pack: { en: `${base}/apply-kit/layout-pack/`, de: `${base}/apply-kit/de/layout-pack/` },
  ats: { en: `${base}/apply-kit/ats-check/`, de: `${base}/apply-kit/de/ats-check/` },
  articles: { en: `${base}/apply-kit/articles/`, de: `${base}/apply-kit/de/artikel/` },
  thanks: { en: `${base}/apply-kit/thanks/`, de: `${base}/apply-kit/de/thanks/` },
  privacy: { en: `${base}/apply-kit/privacy/`, de: `${base}/apply-kit/de/datenschutz/` },
} as const;
export type Route = keyof typeof routes;

export const pdf = (name: string) => `${base}/apply-kit/Lena_Hoffmann_${name}.pdf`;

export const ui = {
  en: {
    nav: { how: 'How it works', pack: 'Layout Pack', ats: 'ATS check', articles: 'Articles' },
    getFree: 'Get it free',
    getFreeLong: 'Get it free on GitHub',
    menu: 'Menu',
    otherLang: 'DE',
    otherLangLabel: 'Diese Seite auf Deutsch',
    footBlurb: 'A free kit for Claude Code that writes a tailored CV and cover letter for every job, from facts you confirmed.',
    footCols: { kit: 'Kit', tools: 'Tools', about: 'About' },
    contact: 'Contact',
    madeNear: 'Made near Munich',
  },
  de: {
    nav: { how: 'So funktioniert’s', pack: 'Layout Pack', ats: 'ATS-Check', articles: 'Artikel' },
    getFree: 'Kostenlos holen',
    getFreeLong: 'Kostenlos auf GitHub',
    menu: 'Menü',
    otherLang: 'EN',
    otherLangLabel: 'Read this page in English',
    footBlurb: 'Ein kostenloses Kit für Claude Code, das für jede Stelle Lebenslauf und Anschreiben schreibt, aus Fakten, die Sie bestätigt haben.',
    footCols: { kit: 'Kit', tools: 'Werkzeuge', about: 'Über' },
    contact: 'Kontakt',
    madeNear: 'Gemacht bei München',
  },
} as const;

// ---------------------------------------------------------------- layouts

export type LayoutKey = 'classic' | 'modern' | 'compact' | 'din5008' | 'margin' | 'statement' | 'mono' | 'sidebar' | 'poster';

export interface LayoutInfo {
  key: LayoutKey;
  name: string;
  /** Runs to two pages (one column) or fits one page (two columns). */
  group: 'flow' | 'onepage';
  photo: boolean;
  free?: boolean;
  short: Record<Lang, string>;
  desc: Record<Lang, string>;
  tags: Record<Lang, string[]>;
}

export const LAYOUTS: LayoutInfo[] = [
  { key: 'classic', name: 'Classic', group: 'flow', photo: false, free: true,
    short: { en: 'Free, built into the kit', de: 'Kostenlos, im Kit enthalten' },
    desc: { en: 'The serif look the kit comes with: centred name, clear headings, dates on the right.', de: 'Der Serifen-Look, mit dem das Kit kommt: zentrierter Name, klare Überschriften, Daten rechts.' },
    tags: { en: ['One column', '1 to 2 pages'], de: ['Einspaltig', '1 bis 2 Seiten'] } },
  { key: 'modern', name: 'Modern', group: 'flow', photo: false,
    short: { en: 'Bold and sans-serif', de: 'Kräftig, serifenlos' },
    desc: { en: 'Sans-serif, left-aligned. A bold name, the title in your accent colour, dates on the right, the short sections side by side.', de: 'Serifenlos, linksbündig. Ein kräftiger Name, der Titel in Ihrer Akzentfarbe, Daten rechts, die kurzen Abschnitte nebeneinander.' },
    tags: { en: ['One column', '1 to 2 pages'], de: ['Einspaltig', '1 bis 2 Seiten'] } },
  { key: 'compact', name: 'Compact', group: 'flow', photo: false,
    short: { en: 'For long careers', de: 'Für lange Laufbahnen' },
    desc: { en: 'The classic serif look, denser, so a long career still fits on two pages.', de: 'Der klassische Serifen-Look, dichter gesetzt, damit auch eine lange Laufbahn auf zwei Seiten passt.' },
    tags: { en: ['One column', '1 to 2 pages'], de: ['Einspaltig', '1 bis 2 Seiten'] } },
  { key: 'din5008', name: 'DIN 5008', group: 'flow', photo: false,
    short: { en: 'Tabular, with the letter', de: 'Tabellarisch, passend zum Brief' },
    desc: { en: 'The formal German business letter, form B, with the address where a window envelope shows it, and a tabular CV in the same letterhead.', de: 'Der formelle deutsche Geschäftsbrief nach Form B, mit der Anschrift im Sichtfenster, und ein tabellarischer Lebenslauf im selben Briefkopf.' },
    tags: { en: ['Tabular CV', 'German letter'], de: ['Tabellarisch', 'Geschäftsbrief'] } },
  { key: 'margin', name: 'Margin', group: 'flow', photo: false,
    short: { en: 'Names in the margin', de: 'Rubriken am Rand' },
    desc: { en: 'One column, the section names in a left margin, three type sizes, black and white.', de: 'Einspaltig, die Rubriken in einem linken Rand, drei Schriftgrößen, schwarz-weiß.' },
    tags: { en: ['One column', '1 to 2 pages'], de: ['Einspaltig', '1 bis 2 Seiten'] } },
  { key: 'statement', name: 'Statement', group: 'onepage', photo: true,
    short: { en: 'Big name, accent title', de: 'Großer Name, farbiger Titel' },
    desc: { en: 'A big name with the title in your accent colour, the contact top right.', de: 'Ein großer Name mit dem Titel in Ihrer Akzentfarbe, die Kontaktdaten oben rechts.' },
    tags: { en: ['Two columns', '1 page'], de: ['Zweispaltig', '1 Seite'] } },
  { key: 'mono', name: 'Mono', group: 'onepage', photo: true,
    short: { en: 'Initials in a square', de: 'Initialen im Quadrat' },
    desc: { en: 'Monospace headings, your initials in an accent square, square accent bullets.', de: 'Überschriften in Monospace, Ihre Initialen in einem farbigen Quadrat, eckige Aufzählungspunkte.' },
    tags: { en: ['Two columns', '1 page'], de: ['Zweispaltig', '1 Seite'] } },
  { key: 'sidebar', name: 'Sidebar', group: 'onepage', photo: true,
    short: { en: 'Tinted sidebar', de: 'Getönte Seitenleiste' },
    desc: { en: 'A tinted sidebar with your initials, contact, skills and education; experience on the right.', de: 'Eine getönte Seitenleiste mit Initialen, Kontakt, Kenntnissen und Ausbildung; die Berufserfahrung rechts.' },
    tags: { en: ['Two columns', '1 page'], de: ['Zweispaltig', '1 Seite'] } },
  { key: 'poster', name: 'Poster', group: 'onepage', photo: true,
    short: { en: 'Huge lowercase name', de: 'Riesiger Name, klein geschrieben' },
    desc: { en: 'A huge lowercase serif name, grey headings, black and grey only. Opinionated, for creative roles.', de: 'Ein riesiger Serifen-Name in Kleinbuchstaben, graue Überschriften, nur Schwarz und Grau. Eigenwillig, für kreative Rollen.' },
    tags: { en: ['Two columns', '1 page'], de: ['Zweispaltig', '1 Seite'] } },
];

// ---------------------------------------------------------------- articles

export interface ArticleMeta {
  title: string;
  description: string;
  category: string;
  date: string; // ISO, e.g. 2026-10-02
  minutes: number;
  lang: Lang;
  /** Layout whose CV page illustrates the article. */
  cover?: LayoutKey;
  /** Slug of the same article in the other language, if there is one. */
  translation?: string;
  /** Drafts show in `astro dev` only, never in a production build. */
  draft?: boolean;
}
export interface Article extends ArticleMeta {
  slug: string;
  url: string;
  Content: any;
  headings: { depth: number; slug: string; text: string }[];
}

const files = import.meta.glob<any>('../apply-kit/articles/*.mdx', { eager: true });

export function getArticles(lang?: Lang): Article[] {
  return Object.entries(files)
    .map(([path, mod]) => {
      const slug = path.split('/').pop()!.replace(/\.mdx$/, '');
      const fm = mod.frontmatter as ArticleMeta;
      // YAML turns an unquoted 2026-10-08 into a Date; keep it as an ISO day string.
      const date = new Date(fm.date as unknown as string).toISOString().slice(0, 10);
      return { ...fm, date, slug, url: `${routes.articles[fm.lang]}${slug}/`, Content: mod.default, headings: mod.getHeadings?.() ?? [] };
    })
    .filter((a) => !(import.meta.env.PROD && a.draft))
    .filter((a) => !lang || a.lang === lang)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function formatDate(iso: string, lang: Lang) {
  return new Date(iso + 'T12:00:00Z').toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', { day: 'numeric', month: lang === 'de' ? 'long' : 'short', year: 'numeric' });
}
