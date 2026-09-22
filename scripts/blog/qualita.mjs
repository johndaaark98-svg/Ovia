// Controlli di qualità prima della pubblicazione.
// Un articolo che non passa NON viene pubblicato: si riscrive con il feedback.
import { CONFIG } from './config.mjs';

const parole = s => (s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').match(/[a-z0-9]+/g) || []);

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

// Numeri "sensibili" (percentuali, importi, decimali, migliaia) devono comparire nelle fonti.
const norm = n => n.replace(/\s/g, '').replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.');
export function numeriNonVerificati(corpo, testoFonti, extraOk = '') {
  const pattern = /(?:€\s?)?\d{1,3}(?:[.\s]\d{3})+(?:,\d+)?|\d+(?:[.,]\d+)?\s?(?:%|per cento|€|euro|milioni|miliardi|mld|mln)/gi;
  const fonti = (testoFonti + ' ' + extraOk).replace(/ /g, ' ');
  const dispon = new Set((fonti.match(/\d+(?:[.,\s]\d+)*/g) || []).map(norm));
  const trovati = corpo.match(pattern) || [];
  return [...new Set(trovati)].filter(t => {
    const n = norm((t.match(/\d+(?:[.,\s]\d{3})*(?:[.,]\d+)?/) || [''])[0]);
    return n && !dispon.has(n);
  });
}

export function controlla(a, { fonti, slugEsistenti }) {
  const errori = [];
  const corpo = testoCorpo(a);
  const nParole = parole(corpo).length;
  if (nParole < CONFIG.minWords) errori.push(`Corpo troppo corto: ${nParole} parole, minimo ${CONFIG.minWords}.`);
  if (a.title.length > 70) errori.push(`Titolo troppo lungo (${a.title.length} caratteri, max 65).`);
  if (a.meta_description.length < 120 || a.meta_description.length > 165) errori.push(`Meta description di ${a.meta_description.length} caratteri: deve essere 140-158.`);
  if (slugEsistenti.has(a.slug)) errori.push(`Lo slug "${a.slug}" esiste già: scegli un titolo e uno slug diversi.`);
  const tipi = new Set(a.sezioni.map(s => s.blocco?.tipo).filter(Boolean));
  if (tipi.size < 2) errori.push('Usa almeno 2 tipi diversi di blocco visivo, meglio 3 (compare, steps, checklist, warning, stats).');
  for (const s of a.sezioni) {
    const b = s.blocco;
    if (!b) continue;
    if (b.tipo === 'compare' && !(b.sinistra?.righe?.length && b.destra?.righe?.length)) errori.push(`Blocco compare incompleto nella sezione "${s.h2}".`);
    if (['steps', 'checklist', 'warning', 'stats'].includes(b.tipo) && !(b.voci?.length >= 2)) errori.push(`Blocco ${b.tipo} con meno di 2 voci nella sezione "${s.h2}".`);
  }
  // Originalità rispetto a ogni singola fonte
  for (const f of fonti) {
    const ov = sovrapposizione(corpo, f.testo);
    if (ov > CONFIG.maxOverlap) errori.push(`Troppo simile alla fonte "${f.titolo}" (${(ov * 100).toFixed(1)}% di sequenze identiche, max ${(CONFIG.maxOverlap * 100).toFixed(0)}%): riscrivi con parole e struttura tue.`);
  }
  // Numeri non presenti nelle fonti = possibili dati inventati
  const tuttoIlTesto = corpo + ' ' + a.punti_chiave.join(' ') + ' ' + a.faq.map(f => f.risposta).join(' ') + ' ' + a.ovia_view.paragrafi.join(' ');
  const sospetti = numeriNonVerificati(tuttoIlTesto, fonti.map(f => f.testo + ' ' + f.titolo).join(' '), '132 2025 1689 2024 2026 679 2016');
  if (sospetti.length) errori.push(`Questi numeri non compaiono nelle fonti: ${sospetti.slice(0, 8).join(', ')}. Rimuovili o usa solo dati presenti nelle fonti.`);
  // Almeno un link a una fonte
  const linkFonti = fonti.filter(f => tuttoIlTesto.includes(f.url) || JSON.stringify(a).includes(f.url));
  if (!linkFonti.length) errori.push('Nessuna fonte è citata con un link nel testo: collega i fatti alle fonti con [testo](URL).');
  return { ok: errori.length === 0, errori, nParole };
}
