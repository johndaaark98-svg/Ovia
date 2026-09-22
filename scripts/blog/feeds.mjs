// Raccolta notizie dalle fonti RSS/Atom e estrazione del testo degli articoli.
import { XMLParser } from 'fast-xml-parser';
import { FONTI_RSS, FILTRO_AI, CONFIG } from './config.mjs';

const UA = 'Mozilla/5.0 (compatible; OviaBlogBot/1.0; +https://oviaitalia.it/blog/)';
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@', textNodeName: '#text', cdataPropName: false });

const txt = v => {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  if (Array.isArray(v)) return txt(v[0]);
  return v['#text'] ?? '';
};
const strip = s => String(s || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&#8217;|&rsquo;/g, '’').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#\d+;/g, ' ').replace(/\s+/g, ' ').trim();

function linkOf(item) {
  if (typeof item.link === 'string') return item.link;
  const links = Array.isArray(item.link) ? item.link : [item.link];
  const alt = links.find(l => l && (l['@rel'] === 'alternate' || !l['@rel']));
  return alt?.['@href'] || txt(item.guid) || '';
}

export async function fetchFeed(f) {
  const r = await fetch(f.url, { headers: { 'user-agent': UA, accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*' }, signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const x = parser.parse(await r.text());
  const items = x?.rss?.channel?.item || x?.feed?.entry || x?.['rdf:RDF']?.item || [];
  return (Array.isArray(items) ? items : [items]).map(it => ({
    fonte: f.nome, lingua: f.lingua,
    titolo: strip(txt(it.title)),
    url: linkOf(it).trim(),
    data: new Date(txt(it.pubDate) || txt(it.published) || txt(it.updated) || txt(it['dc:date']) || 0),
    sommario: strip(txt(it.description) || txt(it.summary) || txt(it['content:encoded']) || txt(it.content)).slice(0, 600),
  })).filter(i => i.titolo && /^https?:\/\//.test(i.url) && (!f.filtra || FILTRO_AI.test(i.titolo + ' ' + i.sommario)));
}

export async function raccogli({ usati = new Set(), log = console.log } = {}) {
  const limite = Date.now() - CONFIG.windowHours * 3600e3;
  const esiti = await Promise.allSettled(FONTI_RSS.map(fetchFeed));
  const tutte = [];
  esiti.forEach((e, i) => {
    const f = FONTI_RSS[i];
    if (e.status === 'fulfilled') { log(`  ✓ ${f.nome}: ${e.value.length} notizie`); tutte.push(...e.value); }
    else log(`  ✗ ${f.nome}: ${e.reason?.message || e.reason}`);
  });
  const visti = new Set();
  return tutte
    .filter(i => !(i.data instanceof Date) || isNaN(i.data) || i.data.getTime() >= limite)
    .filter(i => !usati.has(i.url))
    .filter(i => { const k = i.titolo.toLowerCase().slice(0, 70); if (visti.has(k)) return false; visti.add(k); return true; })
    .sort((a, b) => (b.data?.getTime() || 0) - (a.data?.getTime() || 0))
    .slice(0, 120);
}

// Testo leggibile di una pagina (Readability). In caso di errore torna il sommario del feed.
export async function testoArticolo(item) {
  try {
    const [{ parseHTML }, { Readability }] = await Promise.all([import('linkedom'), import('@mozilla/readability')]);
    const r = await fetch(item.url, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(25000), redirect: 'follow' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const { document } = parseHTML(await r.text());
    const art = new Readability(document).parse();
    const t = (art?.textContent || '').replace(/\s+/g, ' ').trim();
    if (t.length < 400) throw new Error('testo troppo corto');
    return t.slice(0, 14000);
  } catch (e) {
    return item.sommario || '';
  }
}
