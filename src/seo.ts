export const SITE_URL = 'https://pipilota.de';
export const SITE_NAME = 'Kita Pipilota';
export const OG_IMAGE = `${SITE_URL}/images/og-image.jpg`;

export const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ChildCare',
      '@id': `${SITE_URL}/#kita`,
      name: 'Kita Pipilota e.V.',
      alternateName: 'Kita Pipilota',
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/images/logosmall.png`,
      image: OG_IMAGE,
      email: 'info@pipilota.de',
      telephone: '+49 30 42809879',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Ebertystraße 43',
        postalCode: '10249',
        addressLocality: 'Berlin',
        addressRegion: 'Berlin',
        addressCountry: 'DE',
      },
      geo: { '@type': 'GeoCoordinates', latitude: 52.5246, longitude: 13.4528 },
      areaServed: { '@type': 'City', name: 'Berlin' },
      knowsLanguage: ['de', 'es'],
      sameAs: ['https://www.daks-berlin.de', 'https://strohhalm-ev.de/'],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      inLanguage: ['de', 'es'],
      publisher: { '@id': `${SITE_URL}/#kita` },
    },
  ],
};
