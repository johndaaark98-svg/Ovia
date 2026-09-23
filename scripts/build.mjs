// Build completo: pagine servizio, blog (da content/blog/*.json), feed, sitemap, llms.txt.
// Idempotente: si può rilanciare quando si vuole.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { SITE, PRODOTTI, urlOf } from '../data/prodotti.mjs';
import { renderArticolo, renderIndice, renderFeed } from './blog/render.mjs';
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
  const articoli = caricaArticoli();
  mkdirSync(ROOT + 'blog', { recursive: true });
  for (const a of articoli) writeFileSync(`${ROOT}blog/${a.slug}.html`, renderArticolo(a, articoli));
  writeFileSync(ROOT + 'blog/index.html', renderIndice(articoli));
  writeFileSync(ROOT + 'blog/feed.xml', renderFeed(articoli));

  const oggi = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: '/', pr: '1.0', cf: 'weekly' },
    { loc: '/servizi/', pr: '0.9', cf: 'monthly' },
    { loc: '/faq.html', pr: '0.8', cf: 'monthly' },
    ...PRODOTTI.map(p => ({ loc: urlOf(p.id), pr: '0.9', cf: 'monthly' })),
    { loc: '/siti-studi-professionali.html', pr: '0.7', cf: 'monthly' },
    { loc: '/siti-attivita-locali.html', pr: '0.7', cf: 'monthly' },
    { loc: '/blog/', pr: '0.8', cf: 'daily', lm: articoli[0]?.data.slice(0, 10) },
    ...articoli.map(a => ({ loc: `/blog/${a.slug}.html`, pr: '0.6', cf: 'monthly', lm: (a.aggiornato || a.data).slice(0, 10) })),
  ];
  writeFileSync(ROOT + 'sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${SITE.url}${u.loc}</loc><lastmod>${u.lm || oggi}</lastmod><changefreq>${u.cf}</changefreq><priority>${u.pr}</priority></url>`).join('\n')}
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

## Contatti
- Email: ${SITE.email}
- Sito: ${SITE.url}
`);
  log(`✓ Blog: ${articoli.length} articoli · sitemap ${urls.length} URL · feed · llms.txt`);
  return articoli;
}

if (import.meta.url === `file://${process.argv[1]}`) await buildTutto();
