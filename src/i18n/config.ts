export const languages = {
  de: { label: 'Deutsch', htmlLang: 'de', flag: 'DE' },
  es: { label: 'Español', htmlLang: 'es', flag: 'ES' },
} as const;

export type Lang = keyof typeof languages;
export const langs = Object.keys(languages) as Lang[];
export const defaultLang: Lang = 'de';

type Localized<T> = Record<Lang, T>;

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
  house: {
    de: { slug: 'haus', label: 'Haus' },
    es: { slug: 'instalaciones', label: 'Instalaciones' },
  },
  educators: {
    de: { slug: 'erzieherinnen', label: 'ErzieherInnen' },
    es: { slug: 'educadoras', label: 'Educadoras' },
  },
  admission: {
    de: { slug: 'anmeldung', label: 'Anmeldung' },
    es: { slug: 'admision', label: 'Admisión' },
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

type NavNode =
  | { kind: 'page'; key: PageKey }
  | { kind: 'group'; label: Localized<string>; children: PageKey[] };

export const nav: NavNode[] = [
  { kind: 'page', key: 'concept' },
  {
    kind: 'group',
    label: { de: 'Kita', es: 'La Kita' },
    children: ['kita', 'house', 'educators'],
  },
  { kind: 'page', key: 'admission' },
  { kind: 'page', key: 'dates' },
  { kind: 'page', key: 'cooperation' },
  { kind: 'page', key: 'location' },
];

export const ui = {
  de: {
    skipToContent: 'Zum Inhalt springen',
    menu: 'Menü',
    chooseTitle: 'Willkommen bei der Kita Pipilota',
    chooseSubtitle: 'Bitte wählen Sie eine Sprache',
    otherLanguages: 'Andere Sprachen',
    contact: 'Kontakt',
    phone: 'Telefon',
    address: 'Adresse',
    directions: 'Anfahrt',
    download: 'Herunterladen',
    required: 'Pflichtfeld',
    submit: 'Absenden',
    formIntro: 'Anmeldung',
    backHome: 'Zur Startseite',
    notFound: 'Seite nicht gefunden',
    notFoundText: 'Die gesuchte Seite existiert leider nicht.',
  },
  es: {
    skipToContent: 'Saltar al contenido',
    menu: 'Menú',
    chooseTitle: 'Bienvenidxs a la Kita Pipilota',
    chooseSubtitle: 'Por favor, elige un idioma',
    otherLanguages: 'Otros idiomas',
    contact: 'Contacto',
    phone: 'Teléfono',
    address: 'Dirección',
    directions: 'Cómo llegar',
    download: 'Descargar',
    required: 'Campo obligatorio',
    submit: 'Enviar',
    formIntro: 'Inscripción',
    backHome: 'Volver al inicio',
    notFound: 'Página no encontrada',
    notFoundText: 'La página solicitada no existe.',
  },
} satisfies Record<Lang, Record<string, string>>;

export type UiKey = keyof (typeof ui)['de'];

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

/** Reverse lookup: language + slug -> page key. */
export function keyForSlug(lang: Lang, slug: string): PageKey | undefined {
  return (Object.keys(pageRegistry) as PageKey[]).find(
    (key) => pageRegistry[key][lang].slug === slug,
  );
}
