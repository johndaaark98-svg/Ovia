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
import { SYSTEM_EDITOR, promptScelta, SCHEMA_SCELTA, promptArticolo, promptRevisione, SCHEMA_ARTICOLO, SYSTEM_TRADUTTORE, promptTraduzione } from './prompts.mjs';
import { prodottiIn } from '../../data/prodotti.mjs';
import { readFileSync } from 'node:fs';
import { controlla, ripara, ripulisciNumeri } from './qualita.mjs';
import { caricaArticoli, buildTutto } from '../build.mjs';

const ROOT = new URL('../..', import.meta.url).pathname;
const args = new Set(process.argv.slice(2));
const log = (...m) => console.log(...m);
const oggiRoma = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome' }).format(new Date());
const summary = t => { if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, t + '\n'); };

// ---- Traduzione inglese: non blocca mai la pubblicazione italiana ----
function mappaLink(esistenti) {
  const m = prodottiIn('it').map(p => [`/servizi/${p.id}.html`, `/en/services/${p.id}.html`]);
  m.push(['/servizi/', '/en/services/'], ['/faq.html', '/en/faq.html'], ['/blog/', '/en/blog/']);
  for (const a of esistenti) if (a.en?.slug) m.push([`/blog/${a.slug}.html`, `/en/blog/${a.en.slug}.html`]);
  return m;
}
async function traduci(articolo, esistenti) {
  const nomi = prodottiIn('en').map(p => `${p.id} = ${p.name}`).join(', ');
  const en = await chiamaStrutturato({ system: SYSTEM_TRADUTTORE, prompt: promptTraduzione(articolo, mappaLink(esistenti), nomi), nomeTool: 'articolo_en', schema: SCHEMA_ARTICOLO, maxTokens: 16000 });
  if ((en.sezioni || []).length !== articolo.sezioni.length) throw new Error('struttura della traduzione diversa dall’originale');
  en.slug = (en.slug || en.title).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70);
  if (esistenti.some(a => a.en?.slug === en.slug)) en.slug += '-' + articolo.data.slice(0, 10);
  const parole = [...en.intro, ...en.sezioni.flatMap(s => s.paragrafi), ...en.conclusione].join(' ').split(/\s+/).length;
  return { ...en, parole, minuti: Math.max(3, Math.round(parole / 200) + 1), tradotto: { da: 'ai', modello: CONFIG.model, il: new Date().toISOString() } };
}
// Recupera eventuali articoli rimasti senza versione inglese (max 2 per esecuzione)
async function traduciMancanti(esistenti) {
  const mancanti = esistenti.filter(a => !a.en).slice(0, 2);
  let fatti = 0;
  for (const a of mancanti) {
    try {
      a.en = await traduci(a, esistenti);
      writeFileSync(`${ROOT}content/blog/${a.slug}.json`, JSON.stringify(a, null, 2) + '\n');
      log(`   ✓ Tradotto in inglese: ${a.en.slug}`);
      fatti++;
    } catch (e) { log(`   ⚠ Traduzione non riuscita per ${a.slug}: ${e.message}`); }
  }
  if (fatti) await buildTutto({ log }); // le pagine inglesi escono subito, anche senza articolo nuovo
}

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

  if (!args.has('--dry-run') && process.env.ANTHROPIC_API_KEY) await traduciMancanti(esistenti);

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

  // Fino a 2 temi diversi: se il primo non produce un articolo pubblicabile si passa al secondo.
  const recenti = esistenti.slice(0, 30).map(a => a.title);
  const interni = esistenti.slice(0, 40).map(a => ({ title: a.title, slug: a.slug }));
  let risultato = null;
  for (let tema = 1; tema <= CONFIG.maxTopics && !risultato; tema++) {
    if (candidati.length < 2) break;
    log(`2/5 Scelgo il tema ${tema > 1 ? '(alternativo) ' : ''}tra ${candidati.length} notizie…`);
    const scelta = await chiamaStrutturato({ system: SYSTEM_EDITOR, prompt: promptScelta(candidati, recenti), nomeTool: 'scelta_tema', schema: SCHEMA_SCELTA, maxTokens: 2000 });
    const idx = [...new Set(scelta.indici)].filter(i => candidati[i]).slice(0, CONFIG.maxSources);
    const scelte = idx.map(i => candidati[i]);
    candidati = candidati.filter((_, i) => !idx.includes(i));
    if (!scelte.length) { log('   Scelta del tema senza fonti valide.'); continue; }
    recenti.push(scelta.tema);
    log(`   Tema: ${scelta.tema}\n   Keyword: ${scelta.keyword}\n   Fonti: ${scelte.map(x => x.fonte + ' — ' + x.titolo).join(' | ')}`);

    log('3/5 Leggo le fonti…');
    const fonti = [];
    for (const x of scelte) fonti.push({ ...x, testo: await testoArticolo(x) });

    log('4/5 Scrivo l’articolo…');
    try {
      let articolo = await chiamaStrutturato({ system: SYSTEM_EDITOR, prompt: promptArticolo({ scelta, fonti, articoliInterni: interni, oggi, feedback: '' }), nomeTool: 'articolo', schema: SCHEMA_ARTICOLO, maxTokens: 16000 });
      const verifica = (etichetta) => {
        articolo.slug = (articolo.slug || articolo.title).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70);
        const note = ripara(articolo, { fonti, slugEsistenti, oggi });
        const e = controlla(articolo, { fonti });
        log(`   ${etichetta}: ${e.nParole} parole${note.length ? ' · corretto in automatico: ' + note.join('; ') : ''} — ${e.ok ? 'OK' : 'da sistemare: ' + e.errori.join(' / ')}`);
        return e;
      };
      let esito = verifica('Bozza');
      for (let r = 1; r <= CONFIG.maxRevisions && !esito.ok; r++) {
        articolo = await chiamaStrutturato({ system: SYSTEM_EDITOR, prompt: promptRevisione({ articolo, problemi: esito.errori, fonti }), nomeTool: 'articolo', schema: SCHEMA_ARTICOLO, maxTokens: 16000 });
        esito = verifica(`Revisione ${r}`);
      }
      if (!esito.ok && esito.pubblicabile) {
        // ultima rete: via le frasi con dati non verificati, il resto si pubblica
        const n = ripulisciNumeri(articolo, { fonti });
        esito = verifica(`Pulizia finale (${n} frasi con dati non verificati rimosse)`);
        if (esito.pubblicabile) esito.ok = true; // restano solo difetti di forma: si pubblica
      }
      if (esito.ok) risultato = { articolo, esito, scelta, fonti };
      else log(`   ✗ Tema scartato: ${esito.bloccanti.join(' / ')}`);
    } catch (e) { log(`   ✗ Errore su questo tema: ${e.message}`); }
  }
  if (!risultato) throw new Error('Nessun articolo pubblicabile oggi (' + CONFIG.maxTopics + ' temi tentati).');
  const { articolo, esito, scelta, fonti } = risultato;

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

  log('   Traduzione inglese…');
  try { record.en = await traduci(record, esistenti); log(`   ✓ EN: ${record.en.slug}`); }
  catch (e) { log(`   ⚠ Traduzione inglese non riuscita (pubblico solo in italiano, riprovo domani): ${e.message}`); }

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
  summary(`### ✓ Articolo di oggi\n**${record.title}**\n\nhttps://oviaitalia.it/blog/${record.slug}.html${record.en ? `\nhttps://oviaitalia.it/en/blog/${record.en.slug}.html` : ''}\n\nFonti: ${record.fonti.map(f => f.fonte).join(', ')} · ${record.parole} parole`);
}

// Fallimento: nelle prime esecuzioni del giorno si esce "puliti" (niente email di errore):
// ci riprova la successiva. Solo l'ultima esecuzione del giorno segnala il problema.
main().catch(e => {
  const ultimo = process.env.ULTIMO_TENTATIVO !== '0';
  console.error((ultimo ? '✗ ' : '⚠ ') + e.message + (ultimo ? '' : ' — riprovo alla prossima esecuzione di oggi.'));
  summary(`### ${ultimo ? '✗ Nessun articolo pubblicato oggi' : '⚠ Tentativo non riuscito, si riprova più tardi'}\n${e.message}`);
  process.exit(ultimo ? 1 : 0);
});
