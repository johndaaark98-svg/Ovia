// Prompt e schemi per scelta del tema e scrittura dell'articolo.
import { PRODOTTI, SITE, urlOf } from '../../data/prodotti.mjs';
import { CATEGORIE, CONFIG } from './config.mjs';

const catalogo = () => PRODOTTI.map(p => `- id "${p.id}" · ${p.name}: ${p.pitch} (temi: ${p.keywords.join(', ')}) · pagina ${urlOf(p.id)}`).join('\n');

export const SYSTEM_EDITOR = `Sei il caporedattore del blog di Ovia (oviaitalia.it), società italiana che costruisce sistemi di automazione e intelligenza artificiale su misura per studi professionali (commercialisti, avvocati, consulenti del lavoro) e PMI italiane.
Il posizionamento di Ovia: "${SITE.positioning}" Ovia si distingue per strategia (decidere cosa automatizzare e come misurarlo) e sicurezza (segreto professionale, GDPR, AI Act, Legge 132/2025), non per l'uso dell'ultimo strumento.
Pubblico: titolari e responsabili di studi e PMI italiane, non tecnici, pragmatici, attenti a costi, rischi e responsabilità professionali.`;

export function promptScelta(candidati, recenti) {
  return `Ecco le notizie raccolte oggi dalle fonti del settore AI (id · fonte · data · titolo · sommario):
${candidati.map((c, i) => `[${i}] ${c.fonte} · ${c.data instanceof Date && !isNaN(c.data) ? c.data.toISOString().slice(0, 10) : 'n.d.'} · ${c.titolo} — ${c.sommario.slice(0, 280)}`).join('\n')}

Articoli già pubblicati di recente sul blog (da NON ripetere):
${recenti.length ? recenti.map(r => '- ' + r).join('\n') : '- nessuno'}

Servizi Ovia:
${catalogo()}

Scegli UN tema per l'articolo di oggi. Criteri, in ordine:
1. Rilevanza concreta per uno studio professionale o una PMI italiana (impatto su lavoro, costi, rischi, clienti, obblighi).
2. Possibilità di un angolo Ovia su strategia e sicurezza, collegato ad almeno un servizio.
3. Il tema deve essere coperto da PIÙ fonti tra quelle elencate (ideale 2-${CONFIG.maxSources}), così l'articolo è una sintesi originale e non la riscrittura di un singolo pezzo. Se un tema importante ha una sola fonte, puoi sceglierlo solo se aggiungi un'analisi pratica sostanziale.
4. Evita gossip, finanziamenti di startup, notizie da borsa, annunci senza impatto pratico.
Indica anche la parola chiave principale in italiano (quella che un titolare cercherebbe su Google o chiederebbe a ChatGPT).`;
}

export const SCHEMA_SCELTA = {
  type: 'object',
  properties: {
    indici: { type: 'array', items: { type: 'integer' }, minItems: 1, maxItems: CONFIG.maxSources, description: 'Indici delle notizie da usare come fonti' },
    tema: { type: 'string', description: 'Il tema in una frase' },
    angolo: { type: 'string', description: 'L’angolo pratico per studi e PMI italiane, con il collegamento a strategia e sicurezza' },
    keyword: { type: 'string', description: 'Parola chiave principale in italiano' },
    domande: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 7, description: 'Domande reali che il lettore si fa su questo tema' },
    categoria: { type: 'string', enum: CATEGORIE.map(c => c.id) },
    prodotti: { type: 'array', items: { type: 'string', enum: PRODOTTI.map(p => p.id) }, minItems: 1, maxItems: 3 },
  },
  required: ['indici', 'tema', 'angolo', 'keyword', 'domande', 'categoria', 'prodotti'],
};

export function promptArticolo({ scelta, fonti, articoliInterni, oggi, feedback }) {
  return `Scrivi l'articolo di oggi per il blog Ovia.

TEMA: ${scelta.tema}
ANGOLO: ${scelta.angolo}
PAROLA CHIAVE PRINCIPALE: ${scelta.keyword}
DOMANDE DEL LETTORE DA SODDISFARE: ${scelta.domande.join(' | ')}
CATEGORIA: ${scelta.categoria}
DATA DI OGGI: ${oggi}

FONTI (puoi usare SOLO fatti, dati e citazioni presenti qui; ogni fonte ha il suo URL):
${fonti.map((f, i) => `=== FONTE ${i + 1}: ${f.titolo} — ${f.fonte} — ${f.url}\n${f.testo}`).join('\n\n')}

SERVIZI OVIA (per i link interni e per la sezione prodotti):
${catalogo()}

ARTICOLI OVIA GIÀ PUBBLICATI (puoi linkarne 1-2 se davvero pertinenti):
${articoliInterni.length ? articoliInterni.map(a => `- ${a.title} → /blog/${a.slug}.html`).join('\n') : '- nessuno'}

REGOLE EDITORIALI — OBBLIGATORIE
1. ORIGINALITÀ: non riassumere né parafrasare una singola fonte paragrafo per paragrafo. Scrivi una SINTESI ORIGINALE: incrocia le fonti, spiega cosa significa per uno studio o una PMI italiana, aggiungi indicazioni pratiche, rischi, passi operativi. Non riprendere frasi delle fonti: al massimo citazioni brevi tra virgolette con attribuzione. Struttura, esempi e ragionamento devono essere tuoi.
2. VERITÀ: nessun numero, data, nome o fatto che non sia nelle fonti o conoscenza generale consolidata. Se un dato non c'è, non inventarlo: usa formulazioni qualitative. Non attribuire alle fonti cose che non dicono. Niente testimonianze o casi clienti inventati.
3. ATTRIBUZIONE: quando usi un fatto di una fonte, collegalo con un link markdown [testo](URL della fonte) almeno una volta per fonte.
4. LINGUA: italiano chiaro, frasi brevi, zero gergo non spiegato. Termini inglesi solo se d'uso comune (spiegali la prima volta). Tono autorevole e pratico, mai sensazionalistico.
5. ANGOLO OVIA: la tesi di fondo è che strategia e sicurezza fanno la differenza, l'AI è lo strumento. Inseriscilo in modo naturale e argomentato, senza pubblicità martellante. La sezione "ovia_view" è l'unico punto dove si parla esplicitamente di Ovia.
6. SEO / AI SEARCH: la parola chiave nel titolo (entro 65 caratteri), nella meta description (140-158 caratteri), nel primo paragrafo e in almeno un H2. Titoli H2 che rispondono a domande reali. Risposte dirette in apertura di sezione (citabili dai motori AI). FAQ con risposte autonome di 2-4 frasi.
7. LUNGHEZZA: almeno ${CONFIG.minWords} parole nel corpo (intro + sezioni + conclusione). 4-6 sezioni.
8. BLOCCHI VISIVI: usa almeno 3 tipi diversi di blocco tra compare, steps, checklist, warning, stats (stats solo con numeri presi dalle fonti). Ogni sezione al massimo un blocco.
9. LINK INTERNI: nel testo inserisci 1-3 link markdown ai servizi Ovia pertinenti (es. [gestione delle email](/servizi/inbox.html)) o ad articoli già pubblicati.
10. PRODOTTI: scegli 1-3 servizi Ovia che risolvono esattamente il problema dell'articolo e spiega in una frase concreta perché, riferita al tema.
11. FORMATTAZIONE nei testi: solo **grassetto** e [link](url). Niente HTML, niente titoli markdown, niente elenchi markdown dentro i paragrafi.
${feedback ? `\nATTENZIONE — la versione precedente è stata scartata dal controllo qualità per questi motivi, correggili:\n${feedback}\n` : ''}`;
}

const BLOCCO = {
  type: 'object',
  description: 'Blocco visivo opzionale in fondo alla sezione',
  properties: {
    tipo: { type: 'string', enum: ['compare', 'steps', 'checklist', 'warning', 'stats'] },
    titolo: { type: 'string' },
    sinistra: { type: 'object', description: 'compare: colonna "come si fa oggi"', properties: { titolo: { type: 'string' }, badge: { type: 'string' }, righe: { type: 'array', items: { type: 'object', properties: { etichetta: { type: 'string' }, valore: { type: 'string' } }, required: ['etichetta', 'valore'] } } } },
    destra: { type: 'object', description: 'compare: colonna "approccio consigliato"', properties: { titolo: { type: 'string' }, badge: { type: 'string' }, righe: { type: 'array', items: { type: 'object', properties: { etichetta: { type: 'string' }, valore: { type: 'string' } }, required: ['etichetta', 'valore'] } } } },
    voci: {
      type: 'array', description: 'steps: {titolo, meta, testo}; checklist: {titolo, testo, ok}; warning: {testo}; stats: {valore, testo}',
      items: { type: 'object', properties: { titolo: { type: 'string' }, meta: { type: 'string' }, testo: { type: 'string' }, ok: { type: 'boolean' }, valore: { type: 'string' } } },
    },
  },
  required: ['tipo'],
};

export const SCHEMA_ARTICOLO = {
  type: 'object',
  properties: {
    title: { type: 'string', description: 'Titolo H1, max 65 caratteri, con la parola chiave' },
    slug: { type: 'string', description: 'slug-in-minuscolo-con-trattini, max 70 caratteri, senza data' },
    meta_description: { type: 'string', description: '140-158 caratteri' },
    lead: { type: 'string', description: 'Sottotitolo di 1-2 frasi' },
    tags: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 5, description: 'Parole chiave (la prima è la principale)' },
    intro: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 4 },
    punti_chiave: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 6 },
    sezioni: {
      type: 'array', minItems: 4, maxItems: 6,
      items: { type: 'object', properties: { h2: { type: 'string' }, paragrafi: { type: 'array', items: { type: 'string' }, minItems: 1 }, blocco: BLOCCO }, required: ['h2', 'paragrafi'] },
    },
    ovia_view: { type: 'object', properties: { titolo: { type: 'string' }, paragrafi: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 3 } }, required: ['titolo', 'paragrafi'] },
    faq: { type: 'array', minItems: 4, maxItems: 7, items: { type: 'object', properties: { domanda: { type: 'string' }, risposta: { type: 'string' } }, required: ['domanda', 'risposta'] } },
    conclusione: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 3 },
    prodotti: { type: 'array', minItems: 1, maxItems: 3, items: { type: 'object', properties: { id: { type: 'string', enum: PRODOTTI.map(p => p.id) }, perche: { type: 'string' } }, required: ['id', 'perche'] } },
  },
  required: ['title', 'slug', 'meta_description', 'lead', 'tags', 'intro', 'punti_chiave', 'sezioni', 'ovia_view', 'faq', 'conclusione', 'prodotti'],
};
