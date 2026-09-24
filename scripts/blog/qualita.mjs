// =====================================================================
// Controlli di qualità, in tre livelli:
//   1. ripara()        → difetti di forma corretti in automatico, mai bloccanti
//                        (blocchi incompleti, statistiche non verificate, slug duplicato…)
//   2. controlla()     → segnala i problemi di sostanza: "correggibili" (l'AI li
//                        rivede) e "bloccanti" (copia dalle fonti, articolo troppo corto)
//   3. ripulisciNumeri() → ultima rete di sicurezza: toglie le frasi con numeri
//                        che non compaiono nelle fonti, invece di buttare l'articolo
// Un dato non verificato non viene MAI pubblicato; un difetto di forma non
// ferma MAI la pubblicazione.
// =====================================================================
import { CONFIG } from './config.mjs';

const parole = s => (s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').match(/[a-z0-9]+/g) || []);
const MIN_PAROLE_ASSOLUTO = Math.round(CONFIG.minWords * 0.75);

export function testoCorpo(a) {
  return [
    ...a.intro,
    ...a.sezioni.flatMap(s => [s.h2, ...s.paragrafi, ...((s.blocco?.voci || []).map(v => [v.titolo, v.testo].filter(Boolean).join(' ')))]),
    ...a.conclusione,
  ].join(' ').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*/g, '');
}

function shingles(ws, n = 8) {
  const s = new Set();
  for (let i = 0; i + n <= ws.length; i++) s.add(ws.slice(i, i + n).join(' '));
  return s;
}

// Quota di sequenze di 8 parole dell'articolo presenti identiche nella fonte.
export function sovrapposizione(articolo, fonte) {
  const a = shingles(parole(articolo)), f = shingles(parole(fonte));
  if (!a.size) return 0;
  let comuni = 0;
  for (const x of a) if (f.has(x)) comuni++;
  return comuni / a.size;
}

// ---- Numeri: confronto tollerante tra formato italiano e inglese ----
// "141.000" = "141,000" = "141000"; "3,5" = "3.5". Ogni numero è un token a sé
// (prima "7 in 10" diventava "710" e generava falsi allarmi).
const RE_NUM = /\d{1,3}(?:[.,]\d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)?/g;
function normNum(t) {
  if (/^\d{1,3}(?:[.,]\d{3})+$/.test(t)) return t.replace(/[.,]/g, '');
  const m = t.match(/^(\d{1,3}(?:[.,]\d{3})+)[.,](\d+)$/);
  if (m) return m[1].replace(/[.,]/g, '') + '.' + m[2];
  return t.replace(',', '.').replace(/\.0+$/, '');
}
export function numeriDisponibili(testoFonti, extra = '') {
  return new Set(((testoFonti + ' ' + extra).match(RE_NUM) || []).map(normNum));
}
const EXTRA_OK = '132 2025 1689 2024 2026 679 2016';
// Numeri "sensibili" (percentuali, importi, migliaia, moltiplicatori) presenti nel testo ma non nelle fonti.
const RE_SENSIBILI = /(?:€\s?)?\d{1,3}(?:[.,]\d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)?\s?(?:%|per cento|€|euro|milioni|miliardi|mld|mln|volte|x\b|×)/gi;
export function numeriNonVerificati(testo, dispon) {
  const trovati = testo.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').match(RE_SENSIBILI) || [];
  return [...new Set(trovati)].filter(t => {
    const n = (t.match(RE_NUM) || [''])[0];
    return n && !dispon.has(normNum(n));
  });
}
const numeroOk = (valore, dispon) => {
  const n = (String(valore || '').match(RE_NUM) || [])[0];
  return !n || dispon.has(normNum(n));
};

function tuttiITesti(a) {
  return [testoCorpo(a), ...a.punti_chiave, ...a.faq.map(f => f.risposta), ...(a.ovia_view?.paragrafi || []), a.lead || '', a.meta_description || ''].join(' ');
}

// ---------------------------------------------------------------------
// 1. Riparazioni automatiche (deterministiche)
// ---------------------------------------------------------------------
export function ripara(a, { fonti, slugEsistenti, oggi }) {
  const note = [];
  const dispon = numeriDisponibili(fonti.map(f => f.testo + ' ' + f.titolo).join(' '), EXTRA_OK);
  for (const s of a.sezioni) {
    const b = s.blocco;
    if (!b) continue;
    if (b.tipo === 'stats') {
      const prima = (b.voci || []).length;
      b.voci = (b.voci || []).filter(v => numeroOk(v.valore, dispon));
      if (b.voci.length < prima) note.push(`statistiche non verificate rimosse in "${s.h2}"`);
    }
    const incompleto =
      (b.tipo === 'compare' && !(b.sinistra?.righe?.length && b.destra?.righe?.length)) ||
      (['steps', 'checklist', 'warning', 'stats'].includes(b.tipo) && !((b.voci || []).length >= 2));
    if (incompleto) {
      // un avviso con una sola voce diventa una frase del testo: il contenuto non si perde
      if (b.tipo === 'warning' && b.voci?.[0]?.testo) s.paragrafi.push(`**Attenzione:** ${b.voci[0].testo}`);
      delete s.blocco;
      note.push(`blocco ${b.tipo} incompleto rimosso in "${s.h2}"`);
    }
  }
  if (a.meta_description?.length > 160) {
    a.meta_description = a.meta_description.slice(0, 157).replace(/\s+\S*$/, '') + '…';
    note.push('meta description accorciata');
  }
  if (slugEsistenti.has(a.slug)) { a.slug = `${a.slug}-${oggi}`.slice(0, 80); note.push('slug reso unico'); }
  // Nessun link alle fonti nel testo: aggiunge la frase di attribuzione in conclusione
  const json = JSON.stringify(a);
  if (!fonti.some(f => json.includes(f.url))) {
    a.conclusione.push('Fonti principali: ' + fonti.map(f => `[${f.fonte}](${f.url})`).join(', ') + '.');
    note.push('link alle fonti aggiunti');
  }
  return note;
}

// ---------------------------------------------------------------------
// 2. Controllo: correggibili (l'AI rivede) e bloccanti
// ---------------------------------------------------------------------
export function controlla(a, { fonti }) {
  const correggibili = [], bloccanti = [];
  const corpo = testoCorpo(a);
  const nParole = parole(corpo).length;
  if (nParole < CONFIG.minWords) (nParole < MIN_PAROLE_ASSOLUTO ? bloccanti : correggibili).push(`Corpo di ${nParole} parole: servono almeno ${CONFIG.minWords} parole (intro + sezioni + conclusione).`);
  if (a.title.length > 70) correggibili.push(`Titolo di ${a.title.length} caratteri: massimo 65.`);
  if (a.meta_description.length < 120) correggibili.push(`Meta description di ${a.meta_description.length} caratteri: deve essere 140-158.`);
  for (const f of fonti) {
    const ov = sovrapposizione(corpo, f.testo);
    if (ov > CONFIG.maxOverlap) bloccanti.push(`Troppo simile alla fonte "${f.titolo}" (${(ov * 100).toFixed(1)}% di sequenze identiche, max ${(CONFIG.maxOverlap * 100).toFixed(0)}%): riscrivi con parole e struttura tue.`);
  }
  const dispon = numeriDisponibili(fonti.map(f => f.testo + ' ' + f.titolo).join(' '), EXTRA_OK);
  const sospetti = numeriNonVerificati(tuttiITesti(a), dispon);
  if (sospetti.length) correggibili.push(`Questi numeri non compaiono nelle fonti: ${sospetti.slice(0, 10).join(', ')}. Toglili o riformula in modo qualitativo.`);
  return { ok: !correggibili.length && !bloccanti.length, pubblicabile: !bloccanti.length, correggibili, bloccanti, errori: [...bloccanti, ...correggibili], nParole, sospetti };
}

// ---------------------------------------------------------------------
// 3. Rete di sicurezza: rimuove le frasi con numeri non verificati
// ---------------------------------------------------------------------
// divide in frasi senza perdere testo (i link markdown con punti nell'URL restano interi)
const frasi = t => t.split(/(?<=[.!?…»”"])\s+(?=[A-ZÀ-ÝÈÉ“"«(\[*0-9])/);
export function ripulisciNumeri(a, { fonti }) {
  const dispon = numeriDisponibili(fonti.map(f => f.testo + ' ' + f.titolo).join(' '), EXTRA_OK);
  let rimosse = 0;
  const pulisci = t => {
    if (!t) return t;
    const tenute = frasi(t).filter(f => !numeriNonVerificati(f, dispon).length);
    rimosse += frasi(t).length - tenute.length;
    return tenute.join(' ').trim();
  };
  const lista = arr => arr.map(pulisci).filter(x => x && x.length > 20);
  a.intro = lista(a.intro);
  a.conclusione = lista(a.conclusione);
  a.punti_chiave = lista(a.punti_chiave);
  if (a.ovia_view?.paragrafi) a.ovia_view.paragrafi = lista(a.ovia_view.paragrafi);
  for (const s of a.sezioni) {
    s.paragrafi = lista(s.paragrafi);
    for (const v of s.blocco?.voci || []) if (v.testo) v.testo = pulisci(v.testo);
  }
  a.faq = a.faq.map(f => ({ ...f, risposta: pulisci(f.risposta) })).filter(f => f.risposta.length > 30);
  a.lead = pulisci(a.lead) || a.lead;
  if (numeriNonVerificati(a.meta_description, dispon).length) a.meta_description = pulisci(a.meta_description) || a.lead.slice(0, 155);
  a.sezioni = a.sezioni.filter(s => s.paragrafi.length);
  return rimosse;
}
