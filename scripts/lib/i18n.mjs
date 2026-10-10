// =====================================================================
// OVIA — lingue del sito. Italiano = lingua principale (radice del sito),
// inglese = /en/. Qui ci sono le etichette dell'interfaccia e la mappa dei percorsi.
// =====================================================================

export const LANGS = ['it', 'en'];

// Percorso italiano → percorso inglese (il resto segue la regola "/en" + percorso)
const MAP = [
  [/^\/servizi\//, '/en/services/'],
  [/^\/siti-studi-professionali\.html$/, '/en/websites-professional-firms.html'],
  [/^\/siti-attivita-locali\.html$/, '/en/websites-local-businesses.html'],
  [/^\/chi-siamo\.html$/, '/en/about.html'],
];
export function enPath(itPath) {
  for (const [re, rep] of MAP) if (re.test(itPath)) return itPath.replace(re, rep);
  return '/en' + (itPath === '/' ? '/' : itPath);
}
export function itPath(enP) {
  if (enP.startsWith('/en/services/')) return enP.replace('/en/services/', '/servizi/');
  if (enP === '/en/websites-professional-firms.html') return '/siti-studi-professionali.html';
  if (enP === '/en/websites-local-businesses.html') return '/siti-attivita-locali.html';
  if (enP === '/en/about.html') return '/chi-siamo.html';
  return enP.replace(/^\/en/, '') || '/';
}
export const pathFor = (lang, itP) => (lang === 'en' ? enPath(itP) : itP);

export const UI = {
  it: {
    htmlLang: 'it', locale: 'it_IT', dateLocale: 'it-IT',
    cta: 'Prenota il Process Check',
    sign: 'Marketing & automation systems for business',
    positioning: 'La strategia e la sicurezza fanno guadagnare. L’AI è lo strumento.',
    nav: { services: 'Servizi', security: 'Sicurezza', method: 'Metodo', about: 'Chi siamo', blog: 'Blog', faq: 'FAQ', allServices: 'Tutti i servizi →', menu: 'Apri il menu', main: 'Principale' },
    footer: { services: 'Servizi', ovia: 'Ovia', legal: 'Note legali', aboutUs: 'Chi siamo', method: 'Il metodo', security: 'Sicurezza', blog: 'Blog', faq: 'Domande frequenti', all: 'Tutti i servizi', rss: 'Feed RSS', privacy: 'Privacy Policy', cookie: 'Cookie Policy', terms: 'Termini di servizio', about: 'Sistemi su misura per imprese e studi professionali, progettati partendo da strategia e sicurezza.' },
    home: 'Home', breadcrumb: 'Percorso', switchLabel: 'Lingua',
  },
  en: {
    htmlLang: 'en', locale: 'en_GB', dateLocale: 'en-GB',
    cta: 'Book the Process Check',
    sign: 'Marketing & automation systems for business',
    positioning: 'Strategy and security make the money. AI is the tool.',
    nav: { services: 'Services', security: 'Security', method: 'Method', about: 'About us', blog: 'Blog', faq: 'FAQ', allServices: 'All services →', menu: 'Open menu', main: 'Main' },
    footer: { services: 'Services', ovia: 'Ovia', legal: 'Legal', aboutUs: 'About us', method: 'Our method', security: 'Security', blog: 'Blog', faq: 'FAQ', all: 'All services', rss: 'RSS feed', privacy: 'Privacy Policy', cookie: 'Cookie Policy', terms: 'Terms of service', about: 'Tailor-made systems for businesses and professional firms, designed around strategy and security.' },
    home: 'Home', breadcrumb: 'Breadcrumb', switchLabel: 'Language',
  },
};
