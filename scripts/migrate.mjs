// One-time migration: fetch the two Weebly sites, extract the page content
// (`#wsite-content`), convert it to Markdown and write content-collection files.
//
// Usage: node scripts/migrate.mjs
//
// The output is a *draft*; review and tidy each file afterwards.

import { writeFile, mkdir } from 'node:fs/promises';
import { parse } from 'node-html-parser';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const OUT_DIR = 'src/content/pages';

const SITES = {
  es: 'https://kitapipilota.weebly.com',
  de: 'https://kitapipilotadeutsch.weebly.com',
};

/** source page -> [lang, slug, translationKey, title, description?] */
const PAGES = [
  ['', 'es', 'home', 'home', 'Inicio'],
  ['concepto.html', 'es', 'concepto', 'concept', 'Concepto'],
  ['la-kita.html', 'es', 'la-kita', 'kita', 'La Kita'],
  ['instalaciones.html', 'es', 'instalaciones', 'house', 'Instalaciones'],
  ['educadoras.html', 'es', 'educadoras', 'educators', 'Educadoras'],
  ['admisioacuten.html', 'es', 'admision', 'admission', 'Admisión'],
  ['calendario.html', 'es', 'calendario', 'dates', 'Calendario'],
  ['colabora.html', 'es', 'colabora', 'cooperation', 'Colabora'],
  ['ubicacioacuten.html', 'es', 'ubicacion', 'location', 'Ubicación'],
  ['', 'de', 'home', 'home', 'Startseite'],
  ['konzept.html', 'de', 'konzept', 'concept', 'Konzept'],
  ['kita.html', 'de', 'kita', 'kita', 'Kita'],
  ['haus.html', 'de', 'haus', 'house', 'Haus'],
  ['erzieherinnen.html', 'de', 'erzieherinnen', 'educators', 'ErzieherInnen'],
  ['anmeldung.html', 'de', 'anmeldung', 'admission', 'Anmeldung'],
  ['termine.html', 'de', 'termine', 'dates', 'Termine'],
  ['kooperationen.html', 'de', 'kooperationen', 'cooperation', 'Kooperationen'],
  ['standort.html', 'de', 'standort', 'location', 'Standort'],
];

const assetMap = {
  'logosmall.png': '/images/logosmall.png',
  'img-0706.png': '/images/home-hero.png',
  'screenshot-2025-11-12-at-15-54-27': '/images/admission.png',
  'screenshot-2025-11-12-at-16-58-51': '/images/kooperation-1.png',
  'screenshot-2025-11-12-at-16-59-01': '/images/kooperation-2.png',
  'screenshot-2025-11-12-at-16-59-11': '/images/kooperation-3.png',
  'screenshot-2025-11-12-at-16-59-26': '/images/kooperation-4.png',
  'concepto_pipilota_': '/downloads/konzept-pipilota-es.pdf',
  'concepto_pipilota__1': '/downloads/konzept-pipilota-de.pdf',
};

/** Gallery image order taken from the Weebly slideshow config. */
const GALLERY = [
  ['07-pipilota-spielkraum1.jpg', 'Spielraum'],
  ['13-pipilota-spielraum2.jpg', 'Spielraum'],
  ['08-pipilota-kletterraum.jpg', 'Kletterraum'],
  ['18-pipilota-garderobe.jpg', 'Garderobe'],
  ['04-pipilota-5tische.jpg', 'Tische'],
  ['02-pipilota-essenraum.jpg', 'Essenraum'],
  ['17-pipilota-bad.jpg', 'Bad'],
  ['22-pipilota-wald-04.jpg', 'Wald'],
  ['21-pipilota-wald-03.jpg', 'Wald'],
  ['19-pipilota-wald-01.jpg', 'Wald'],
  ['20-pipilota-wald-02.jpg', 'Wald'],
  ['15-pipilota-spielraum2.jpg', 'Spielraum'],
  ['10-pipilota-mal-und-bastelraum.jpg', 'Mal- und Bastelraum'],
  ['05-pipilota-giraffe-1.jpg', 'Giraffe'],
  ['03-pipilota-gebastelt.jpg', 'Gebastelt'],
];

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '_',
});
turndown.use(gfm);

function normalizeStem(base) {
  return base
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/(_orig)+$/i, '')
    .replace(/(_1)+$/i, '')
    .replace(/(_orig)+$/i, '');
}

function localizeAsset(url) {
  if (!url) return url;
  const clean = url.split('?')[0];
  const base = clean.split('/').pop();
  const stem = normalizeStem(base);

  for (const [key, target] of Object.entries(assetMap)) {
    if (base === key || stem === key || normalizeStem(key) === stem) return target;
  }
  if (clean.includes('/uploads/')) {
    const ext = (base.match(/\.[a-z0-9]+$/i) ?? [''])[0];
    return `/images/${stem}${ext}`;
  }
  return url;
}

function cleanContent(content) {
  content.querySelectorAll('script, style').forEach((el) => el.remove());
  content.querySelectorAll('.wsite-spacer, .wsite-form, form').forEach((el) => el.remove());

  // Flatten existing headings so inline markup doesn't nest.
  content.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
    h.innerHTML = h.text.trim();
  });

  // Promote the big inline "font size 5/6" titles to real headings.
  content.querySelectorAll('font[size="5"], font[size="6"]').forEach((el) => {
    const target = el.closest('strong') ?? el;
    target.replaceWith(`<h2>${el.text.trim()}</h2>`);
  });

  // Weebly marks section headings as <strong>Heading<br/>&#8203;</strong>.
  content.querySelectorAll('strong, b').forEach((el) => {
    const html = el.innerHTML;
    const text = el.text.trim();
    const looksLikeHeading =
      (/<br\s*\/?>/i.test(html) || html.includes('\u200b')) && text.length > 0 && text.length <= 120;
    if (looksLikeHeading) el.replaceWith(`<h2>${text}</h2>`);
  });

  // Flatten Weebly's layout tables (deepest first so replacements stick).
  content
    .querySelectorAll('table, tbody, thead, tfoot, tr, td, th, .wsite-multicol, .wsite-multicol-table-wrap')
    .reverse()
    .forEach((el) => el.replaceWith(el.innerHTML));

  // Drop decorative spacers.
  content.querySelectorAll('div').forEach((div) => {
    const style = div.getAttribute('style') ?? '';
    if (/height:\s*0(px)?\s*;/.test(style) || /overflow:\s*hidden/.test(style)) div.remove();
  });

  // Drop decorative empty anchors.
  content.querySelectorAll('a:not([href])').forEach((el) => el.replaceWith(el.innerHTML));

  // Rewrite assets to local paths.
  content.querySelectorAll('img').forEach((el) => {
    const src = localizeAsset(el.getAttribute('src'));
    if (src) el.setAttribute('src', src);
  });
  content.querySelectorAll('a[href]').forEach((el) => {
    const href = el.getAttribute('href');
    if (href && href.includes('/uploads/')) el.setAttribute('href', localizeAsset(href));
  });

  // Replace the JS slideshow with a static gallery.
  const slideshow = content.querySelector("[id$='-slideshow']");
  if (slideshow) {
    const galleryHtml = [
      '<div class="gallery">',
      ...GALLERY.map(
        ([file, alt]) =>
          `  <img src="/images/${file}" alt="${alt}" loading="lazy" width="700" height="467" />`,
      ),
      '</div>',
    ].join('\n');
    slideshow.replaceWith(galleryHtml);
  }

  // Strip Weebly styling/attributes, keeping only what Markdown needs.
  content.querySelectorAll('*').forEach((el) => {
    for (const attr of Object.keys(el.attributes)) {
      if (!['src', 'href', 'alt'].includes(attr)) el.removeAttribute(attr);
    }
  });

  return content.innerHTML;
}

function tidy(markdown) {
  let md = markdown
    .replace(/\u200b/g, '')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n');

  // Turn whole-line bold labels into headings (short lines only).
  const asHeading = (line) => line.trim().length > 0 && line.trim().length <= 80;
  md = md.replace(/^\*\*_(.+?)_\*\*$/gm, '### $1');
  md = md.replace(/^_\*\*(.+?)\*\*_$/gm, '### $1');
  md = md.replace(/^\*\*(.+?)\*\*(.*)$/gm, (_m, heading, rest) => {
    if (!asHeading(heading)) return _m;
    return rest.trim() ? `## ${heading.trim()}\n\n${rest.trim()}` : `## ${heading.trim()}`;
  });
  md = md.replace(/^\*\*(.+)$/gm, (m, heading) => (asHeading(heading) ? `## ${heading}` : m));

  // Normalise bullet markers.
  md = md.replace(/^[•\-]\\? /gm, '- ').replace(/^\\- /gm, '- ');
  md = md.replace(/^\s*[•]\s*/gm, '- ');

  return md.replace(/\n{3,}/g, '\n\n').trim();
}

async function fetchPage(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  return res.text();
}

await mkdir(OUT_DIR, { recursive: true });

for (const [path, lang, slug, key, title] of PAGES) {
  const url = `${SITES[lang]}/${path}`;
  const html = await fetchPage(url);
  const root = parse(html);
  const content = root.querySelector('#wsite-content');
  if (!content) {
    console.warn(`! no #wsite-content for ${url}`);
    continue;
  }

  const description =
    root.querySelector('meta[property="og:description"]')?.getAttribute('content') ?? '';
  const body = tidy(turndown.turndown(cleanContent(content)));

  const frontmatter = [
    '---',
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(description.replace(/\s+/g, ' ').trim())}`,
    `translationKey: ${JSON.stringify(key)}`,
    '---',
    '',
    body,
    '',
  ].join('\n');

  const dir = `${OUT_DIR}/${lang}`;
  await mkdir(dir, { recursive: true });
  await writeFile(`${dir}/${slug}.md`, frontmatter, 'utf8');
  console.log(`✓ ${lang}/${slug}.md`);
}
