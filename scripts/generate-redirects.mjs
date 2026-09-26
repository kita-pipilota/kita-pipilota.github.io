// Generates meta-refresh redirect stubs for the old Weebly URLs.
// GitHub Pages cannot issue HTTP 301s, so we ship static HTML pages instead.
//
// Usage: node scripts/generate-redirects.mjs

import { writeFile } from 'node:fs/promises';

const SITE = 'https://pipilota.de';

/** old Weebly path -> new localized path */
const redirects = {
  'concepto.html': '/es/concepto/',
  'la-kita.html': '/es/la-kita/',
  'la-kita2.html': '/es/la-kita/',
  'instalaciones.html': '/es/la-kita/',
  'educadoras.html': '/es/la-kita/',
  'admisioacuten.html': '/es/admision/',
  'calendario.html': '/es/calendario/',
  'colabora.html': '/es/colabora/',
  'ubicacioacuten.html': '/es/ubicacion/',
  'konzept.html': '/de/konzept/',
  'kita.html': '/de/kita/',
  'haus.html': '/de/kita/',
  'erzieherinnen.html': '/de/kita/',
  'anmeldung.html': '/de/anmeldung/',
  'termine.html': '/de/termine/',
  'kooperationen.html': '/de/kooperationen/',
  'standort.html': '/de/standort/',
};

const messages = {
  es: { title: 'Redirigiendo…', text: 'Esta página se ha movido a' },
  de: { title: 'Weiterleitung…', text: 'Diese Seite wurde verschoben nach' },
};

for (const [from, to] of Object.entries(redirects)) {
  const lang = to.startsWith('/es/') ? 'es' : 'de';
  const m = messages[lang];
  const html = `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8" />
    <title>${m.title}</title>
    <link rel="canonical" href="${SITE}${to}" />
    <meta http-equiv="refresh" content="0; url=${to}" />
    <meta name="robots" content="noindex" />
  </head>
  <body>
    <p>${m.text} <a href="${to}">${to}</a>.</p>
  </body>
</html>
`;
  await writeFile(`public/${from}`, html, 'utf8');
  console.log(`✓ public/${from} -> ${to}`);
}
