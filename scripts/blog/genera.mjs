// =====================================================================
// OVIA BLOG — pipeline giornaliera
//   1. raccoglie le notizie AI dalle fonti RSS (config.mjs)
//   2. l'AI sceglie il tema più rilevante per studi/PMI, coperto da più fonti
//   3. legge il testo completo delle fonti scelte
//   4. l'AI scrive una sintesi ORIGINALE in italiano con angolo Ovia e prodotti
//   5. controlli qualità (lunghezza, originalità, numeri verificati, SEO)
//   6. salva content/blog/<slug>.json e rigenera blog, feed, sitemap
//
// Uso:  node scripts/blog/genera.mjs            → genera e salva
//       node scripts/blog/genera.mjs --dry-run  → genera senza salvare
//       node scripts/blog/genera.mjs --force    → anche se oggi c'è già un articolo
//       node scripts/blog/genera.mjs --check-feeds → verifica solo le fonti
// =====================================================================
import { writeFileSync, mkdirSync, appendFileSync } from 'node:fs';
import { CONFIG } from './config.mjs';
import { raccogli, testoArticolo } from './feeds.mjs';
import { chiamaStrutturato } from './llm.mjs';
import { SYSTEM_EDITOR, promptScelta, SCHEMA_SCELTA, promptArticolo, SCHEMA_ARTICOLO } from './prompts.mjs';
import { controlla } from './qualita.mjs';
import { caricaArticoli, buildTutto } from '../build.mjs';

const ROOT = new URL('../..', import.meta.url).pathname;
const args = new Set(process.argv.slice(2));
const log = (...m) => console.log(...m);
const oggiRoma = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome' }).format(new Date());
const summary = t => { if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, t + '\n'); };

async function main() {
  const esistenti = caricaArticoli();
  const usati = new Set(esistenti.flatMap(a => (a.fonti || []).map(f => f.url)));
  const slugEsistenti = new Set(esistenti.map(a => a.slug));

  if (args.has('--check-feeds')) {
    log('Verifica fonti RSS:');
    const c = await raccogli({ log });
    log(`\n${c.length} notizie utilizzabili nelle ultime ${CONFIG.windowHours} ore.`);
    return;
  }

  const oggi = oggiRoma();
  if (!args.has('--force') && !args.has('--dry-run') && esistenti.some(a => a.data.slice(0, 10) === oggi)) {
    log(`Articolo di oggi (${oggi}) già pubblicato: niente da fare.`);
    return;
  }

  log('1/5 Raccolgo le notizie…');
  let candidati = await raccogli({ usati, log });
  if (candidati.length < 3) {
    log('   Poche notizie fresche: allargo la finestra a 7 giorni.');
    CONFIG.windowHours = 24 * 7;
    candidati = await raccogli({ usati, log: () => {} });
  }
  if (!candidati.length) throw new Error('Nessuna notizia disponibile dalle fonti: controlla scripts/blog/config.mjs');

  log(`2/5 Scelgo il tema tra ${candidati.length} notizie…`);
  const recenti = esistenti.slice(0, 30).map(a => a.title);
  const scelta = await chiamaStrutturato({ system: SYSTEM_EDITOR, prompt: promptScelta(candidati, recenti), nomeTool: 'scelta_tema', schema: SCHEMA_SCELTA, maxTokens: 2000 });
  const scelte = [...new Set(scelta.indici)].filter(i => candidati[i]).slice(0, CONFIG.maxSources).map(i => candidati[i]);
  if (!scelte.length) throw new Error('La scelta del tema non ha restituito fonti valide');
  log(`   Tema: ${scelta.tema}\n   Keyword: ${scelta.keyword}\n   Fonti: ${scelte.map(s => s.fonte + ' — ' + s.titolo).join(' | ')}`);

  log('3/5 Leggo le fonti…');
  const fonti = [];
  for (const s of scelte) fonti.push({ ...s, testo: await testoArticolo(s) });

  log('4/5 Scrivo l’articolo…');
  const interni = esistenti.slice(0, 40).map(a => ({ title: a.title, slug: a.slug }));
  let articolo, esito, feedback = '';
  for (let t = 1; t <= CONFIG.maxAttempts; t++) {
    articolo = await chiamaStrutturato({ system: SYSTEM_EDITOR, prompt: promptArticolo({ scelta, fonti, articoliInterni: interni, oggi, feedback }), nomeTool: 'articolo', schema: SCHEMA_ARTICOLO, maxTokens: 16000 });
    articolo.slug = (articolo.slug || articolo.title).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70);
    esito = controlla(articolo, { fonti, slugEsistenti });
    log(`   Tentativo ${t}: ${esito.nParole} parole — ${esito.ok ? 'OK' : 'scartato: ' + esito.errori.join(' / ')}`);
    if (esito.ok) break;
    feedback = esito.errori.map(e => '- ' + e).join('\n');
  }
  if (!esito.ok) throw new Error('Controllo qualità non superato dopo ' + CONFIG.maxAttempts + ' tentativi. Nessun articolo pubblicato oggi.');

  const record = {
    ...articolo,
    categoria: scelta.categoria,
    keyword: scelta.keyword,
    data: new Date().toISOString(),
    autore: CONFIG.author,
    parole: esito.nParole,
    minuti: Math.max(3, Math.round(esito.nParole / 200)),
    fonti: fonti.map(f => ({ titolo: f.titolo, fonte: f.fonte, url: f.url })),
    generato: { da: 'ai', modello: CONFIG.model, il: new Date().toISOString() },
  };

  if (args.has('--dry-run')) {
    const out = ROOT + 'anteprima-articolo.json';
    writeFileSync(out, JSON.stringify(record, null, 2));
    log(`5/5 Dry-run: articolo salvato solo in ${out} (non pubblicato).`);
    return;
  }

  log('5/5 Pubblico…');
  mkdirSync(ROOT + 'content/blog', { recursive: true });
  writeFileSync(`${ROOT}content/blog/${record.slug}.json`, JSON.stringify(record, null, 2));
  await buildTutto({ log });
  log(`✓ Pubblicato: https://oviaitalia.it/blog/${record.slug}.html`);
  summary(`### ✓ Articolo di oggi\n**${record.title}**\n\nhttps://oviaitalia.it/blog/${record.slug}.html\n\nFonti: ${record.fonti.map(f => f.fonte).join(', ')} · ${record.parole} parole`);
}

main().catch(e => { console.error('✗ ' + e.message); summary('### ✗ Nessun articolo pubblicato\n' + e.message); process.exit(1); });
