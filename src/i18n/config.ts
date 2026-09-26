export const languages = {
  de: { label: 'Deutsch', htmlLang: 'de' },
  es: { label: 'Español', htmlLang: 'es' },
} as const;

export type Lang = keyof typeof languages;
export const langs = Object.keys(languages) as Lang[];

/**
 * Registry of every page: its slug and nav label per language.
 * The key is the language-independent `translationKey` used in frontmatter.
 */
export const pageRegistry = {
  home: {
    de: { slug: '', label: 'Startseite' },
    es: { slug: '', label: 'Inicio' },
  },
  concept: {
    de: { slug: 'konzept', label: 'Konzept' },
    es: { slug: 'concepto', label: 'Concepto' },
  },
  kita: {
    de: { slug: 'kita', label: 'Kita' },
    es: { slug: 'la-kita', label: 'La Kita' },
  },
  admission: {
    de: { slug: 'anmeldung', label: 'Anmeldung' },
    es: { slug: 'admision', label: 'Inscripción' },
  },
  dates: {
    de: { slug: 'termine', label: 'Termine' },
    es: { slug: 'calendario', label: 'Calendario' },
  },
  cooperation: {
    de: { slug: 'kooperationen', label: 'Kooperationen' },
    es: { slug: 'colabora', label: 'Colabora' },
  },
  location: {
    de: { slug: 'standort', label: 'Standort' },
    es: { slug: 'ubicacion', label: 'Ubicación' },
  },
  imprint: {
    de: { slug: 'impressum', label: 'Impressum' },
    es: { slug: 'aviso-legal', label: 'Aviso legal' },
  },
  privacy: {
    de: { slug: 'datenschutz', label: 'Datenschutz' },
    es: { slug: 'proteccion-de-datos', label: 'Protección de datos' },
  },
} as const;

export type PageKey = keyof typeof pageRegistry;

/** Top-level navigation, in order. */
export const nav: PageKey[] = [
  'concept',
  'kita',
  'admission',
  'dates',
  'cooperation',
  'location',
];

export const ui = {
  de: {
    skipToContent: 'Zum Inhalt springen',
    menu: 'Menü',
    contact: 'Kontakt',
    phone: 'Telefon',
  },
  es: {
    skipToContent: 'Saltar al contenido',
    menu: 'Menú',
    contact: 'Contacto',
    phone: 'Teléfono',
  },
} satisfies Record<Lang, Record<string, string>>;

/** Absolute site path for a page in a given language, with trailing slash. */
export function localePath(lang: Lang, key: PageKey): string {
  const slug = pageRegistry[key][lang].slug;
  return slug ? `/${lang}/${slug}/` : `/${lang}/`;
}

/** Same page in the other language. */
export function alternatePath(lang: Lang, key: PageKey): string {
  const other: Lang = lang === 'de' ? 'es' : 'de';
  return localePath(other, key);
}
