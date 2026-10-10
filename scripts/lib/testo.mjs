// Correzioni tipografiche condivise tra le pagine scritte a mano e il build inglese.
// Agiscono solo sul testo (mai su link o nomi di file): accenti mancanti e frecce decorative.
const ACCENTI = [
  [/\bqual e\b/g, 'qual è'], [/\bc'e\b/g, "c'è"], [/\bc’e\b/g, 'c’è'], [/\bnon e se\b/g, 'non è se'],
  [/\bchi e (primo|costruito)\b/g, 'chi è $1'], [/\bPiu\b/g, 'Più'], [/\bpiu\b/g, 'più'],
  [/\bPerche\b/g, 'Perché'], [/\bperche\b/g, 'perché'], [/\bcitta\b/g, 'città'],
  [/\bvisibilita\b/g, 'visibilità'], [/\bgia\b/g, 'già'],
  [/(?<![-/\w])Attivita(?![-\w.])/g, 'Attività'], [/(?<![-/\w])attivita(?![-\w.])/g, 'attività'],
];
export const fixAccenti = s => ACCENTI.reduce((t, [re, r]) => t.replace(re, r), s);
export const noFrecce = s => s.replace(/\s*(?:→|&rarr;)(?=\s*$|\s*<|'|")/g, '');
export const pulisci = s => noFrecce(fixAccenti(s));
