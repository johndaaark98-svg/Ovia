// Build completo: pagine servizio, blog (da content/blog/*.json), feed, sitemap, llms.txt.
// Idempotente: si può rilanciare quando si vuole.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { SITE, PRODOTTI, urlOf } from '../data/prodotti.mjs';
import { renderArticolo, renderIndice, renderFeed, loc } from './blog/render.mjs';
import { pathFor } from './lib/i18n.mjs';
import { buildEnStatic } from './build-en-static.mjs';
import { buildFaq } from './build-faq.mjs';
import { FAQ } from '../data/faq.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const DIR = ROOT + 'content/blog/';

export function caricaArticoli() {
  if (!existsSync(DIR)) return [];
  return readdirSync(DIR).filter(f => f.endsWith('.json')).map(f => JSON.parse(readFileSync(DIR + f, 'utf8')))
    .filter(a => a.stato !== 'bozza')
    .sort((x, y) => y.data.localeCompare(x.data));
}

export async function buildTutto({ log = console.log } = {}) {
  await import('./build-servizi.mjs?' + Date.now());
  buildFaq();
  await buildEnStatic(); // homepage, landing e pagine legali in inglese (da index.html & co.)
  const articoli = caricaArticoli();
  const it = articoli.map(a => loc(a, 'it'));
  const en = articoli.map(a => loc(a, 'en')).filter(Boolean);
  mkdirSync(ROOT + 'blog', { recursive: true });
  mkdirSync(ROOT + 'en/blog', { recursive: true });
  for (const a of it) writeFileSync(`${ROOT}blog/${a._it}.html`, renderArticolo(a, it, 'it'));
  for (const a of en) writeFileSync(`${ROOT}en/blog/${a._en}.html`, renderArticolo(a, en, 'en'));
  writeFileSync(ROOT + 'blog/index.html', renderIndice(it, 'it'));
  writeFileSync(ROOT + 'blog/feed.xml', renderFeed(it, 'it'));
  writeFileSync(ROOT + 'en/blog/index.html', renderIndice(en, 'en'));
  writeFileSync(ROOT + 'en/blog/feed.xml', renderFeed(en, 'en'));

  const oggi = new Date().toISOString().slice(0, 10);
  const statiche = ['/', '/servizi/', '/faq.html', ...PRODOTTI.map(p => urlOf(p.id)), '/siti-studi-professionali.html', '/siti-attivita-locali.html', '/blog/', '/privacy.html', '/cookie.html', '/termini.html'];
  const pr = p => p === '/' ? '1.0' : p.startsWith('/servizi') ? '0.9' : ['/privacy.html', '/cookie.html', '/termini.html'].includes(p) ? '0.3' : '0.8';
  const urls = [
    ...statiche.flatMap(p => [
      { loc: p, pr: pr(p), cf: p === '/blog/' ? 'daily' : 'monthly', alt: { it: p, en: pathFor('en', p) } },
      { loc: pathFor('en', p), pr: pr(p), cf: p === '/blog/' ? 'daily' : 'monthly', alt: { it: p, en: pathFor('en', p) } },
    ]),
    ...it.map(a => ({ loc: `/blog/${a._it}.html`, pr: '0.6', cf: 'monthly', lm: (a.aggiornato || a.data).slice(0, 10), alt: a._en ? { it: `/blog/${a._it}.html`, en: `/en/blog/${a._en}.html` } : null })),
    ...en.map(a => ({ loc: `/en/blog/${a._en}.html`, pr: '0.6', cf: 'monthly', lm: (a.aggiornato || a.data).slice(0, 10), alt: { it: `/blog/${a._it}.html`, en: `/en/blog/${a._en}.html` } })),
  ];
  const altXml = u => u.alt ? `<xhtml:link rel="alternate" hreflang="it" href="${SITE.url}${u.alt.it}"/><xhtml:link rel="alternate" hreflang="en" href="${SITE.url}${u.alt.en}"/>` : '';
  writeFileSync(ROOT + 'sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map(u => `  <url><loc>${SITE.url}${u.loc}</loc><lastmod>${u.lm || oggi}</lastmod><changefreq>${u.cf}</changefreq><priority>${u.pr}</priority>${altXml(u)}</url>`).join('\n')}
</urlset>
`);

  // llms.txt: indice leggibile dai motori AI (proposta llmstxt.org)
  writeFileSync(ROOT + 'llms.txt', `# Ovia

> Ovia (L3 Innovation Srl) costruisce sistemi di automazione e intelligenza artificiale su misura per studi professionali (commercialisti, avvocati, consulenti del lavoro) e PMI italiane. ${SITE.positioning} Primo passo: il Process Check, un'analisi di 30 minuti del flusso di lavoro reale.

## Servizi
${PRODOTTI.map(p => `- [${p.name}](${SITE.url}${urlOf(p.id)}): ${p.pitch}`).join('\n')}

## Domande frequenti
- [Tutte le FAQ](${SITE.url}/faq.html): ${FAQ.length} risposte su metodo, sicurezza, normativa, costi e tempi.
${FAQ.filter(f => f.home).map(f => `- ${f.q}`).join('\n')}

## Blog (ultimi articoli)
${articoli.slice(0, 30).map(a => `- [${a.title}](${SITE.url}/blog/${a.slug}.html): ${a.meta_description}`).join('\n')}

## English version
- [Home (EN)](${SITE.url}/en/): Ovia in English.
- [Services (EN)](${SITE.url}/en/services/)
- [FAQ (EN)](${SITE.url}/en/faq.html)
${en.slice(0, 20).map(a => `- [${a.title}](${SITE.url}/en/blog/${a._en}.html): ${a.meta_description}`).join('\n')}

## Contatti
- Email: ${SITE.email}
- Sito: ${SITE.url}
`);
  log(`✓ Blog: ${articoli.length} articoli · sitemap ${urls.length} URL · feed · llms.txt`);
  return articoli;
}

if (import.meta.url === `file://${process.argv[1]}`) await buildTutto();
