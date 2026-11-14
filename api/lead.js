// OVIA - Proxy sicuro verso il webhook Lead di Base44 (Ovia Manager).
// La chiave BASE44_WEBHOOK_KEY resta lato server (Environment Variables Vercel).
//
// SICUREZZA (14/11/2026, correzioni della verifica indipendente, stesso schema di api/maggiordomo.js):
//   - accetta solo chiamate dalle pagine del sito (Origin), anche lato server: chi chiama senza Origin
//     o da un altro sito riceve 403. Così un modulo nascosto su un altro sito non può creare contatti;
//   - accetta solo JSON (Content-Type application/json): niente moduli HTML «semplici» da altri siti;
//   - limite di richieste per indirizzo IP e tetto globale di inoltri a Base44 (protezione «best effort»,
//     per istanza della funzione: il controllo dell'Origin ferma i browser, il limite ferma gli script);
//   - campo trappola gestito qui: se è pieno si risponde come se fosse andato tutto bene, senza creare nulla
//     e senza far partire email (un robot non ha indizi per capire che è stato scartato);
//   - i valori importanti li decide il server: fonte solo da un elenco di fonti del sito (mai «Manuale»),
//     stato sempre «Nuovo», data di arrivo messa dal server, lunghezze massime per ogni campo;
//   - la provenienza (UTM, sito di provenienza, pagina d'ingresso) e la zona arrivano come campi a parte e
//     finiscono in un blocco tecnico in fondo a note_interne, che solo questo proxy può scrivere: il segno
//     che lo apre viene tolto da tutto ciò che scrive la persona. Il CRM legge la provenienza solo da lì.

const ALLOWED_ORIGINS = [
  'https://oviaitalia.it',
  'https://www.oviaitalia.it',
  'https://johndaaark98-svg.github.io',
];

// Limiti (si cambiano qui). Un modulo vero manda 1 richiesta; 5 in 10 minuti lasciano spazio a un errore e un nuovo invio.
const RATE = { windowMs: 10 * 60 * 1000, perIp: 5, globalPerHour: 60 };
const hits = new Map();
let globalHits = [];

// Fonti che il sito può dichiarare. Qualsiasi altro valore (o nessuno) diventa «Altro».
const FONTI_SITO = [
  'Sito — Maggiordomo',
  'Sito — Ovia Radar',
  'Sito — Pacchetti Ovia Pratiche',
  'Sito — Ovia Morosità',
  'Sito — Sovraindebitamento',
  'Sito — Ovia Circolarizzazione',
  'Sito — Ovia Piano',
  'Sito — Ovia Esecuzione',
  'Sito — Siti web studi professionali',
  'Sito — Siti web attività locali',
];
const PRIORITA = ['Bassa', 'Media', 'Alta'];
const CATEGORIE = ['Siti web', 'Servizi AI', 'Chiamata Plaud', 'Altro'];

// Lunghezze massime (caratteri). Il testo più lungo viene tagliato, non rifiutato: una persona vera non perde il messaggio.
const MAX = {
  azienda: 150, nome: 80, cognome: 80, telefono: 40, attivita: 200,
  esigenza: 3000, strumenti_attuali: 1000, volume_frequenza: 300, pacchetto_suggerito: 200,
  trascrizione_conversazione: 20000, note_interne: 3000, provenienza: 300, zona: 120,
};
const MAX_EMAIL = 254;

// Segno del blocco tecnico: deve essere identico a SEGNO_BLOCCO nel CRM (src/lib/provenienza.js di Ovia Manager).
const SEGNO_BLOCCO = '— Dati tecnici del modulo —';

const PACKAGE_NAMES = [
  // Ordine importante: i nomi più lunghi prima, così "Ovia Siti Web per le AI"
  // non viene confuso con il vecchio "Ovia Siti Web".
  'Ovia Siti Web per le AI',
  'Ovia Radar', // lista d'attesa di radar.html (valore aggiunto anche allo schema Lead)
  'Ovia Chiamata → Pratica',
  'Ovia Documenti Crisi',
  'Ovia Raccolta & Solleciti',
  'Ovia Pratiche completo',
  'Ovia Morosità',
  'Ovia Circolarizzazione',
  'Ovia Esecuzione',
  'Ovia Piano',
  'Ovia Second Brain',
  'Ovia Inbox',
  'Ovia Lead Generation',
  'Ovia Chiamate',
  'Ovia Documenti',
  'Ovia CRM',
];

// Vecchi nomi ancora presenti in conversazioni/lead storici → nuovo servizio.
const LEGACY = {
  'Ovia Siti Web': 'Ovia Siti Web per le AI',
  'Ovia Crescita': 'Ovia Lead Generation',
  'Ovia Clienti': 'Ovia CRM',
  'Ovia Workflow': 'Ovia CRM',
  'Ovia Conoscenza': 'Ovia Second Brain',
};

function normalizePackage(text) {
  if (!text) return 'Su misura';
  for (const name of PACKAGE_NAMES) {
    if (text.includes(name)) return name;
  }
  for (const [old, now] of Object.entries(LEGACY)) {
    if (text.includes(old)) return now;
  }
  return 'Su misura';
}

function clientIp(req) {
  const real = String(req.headers['x-real-ip'] || '').trim();
  const fwd = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return real || fwd || (req.socket && req.socket.remoteAddress) || 'unknown';
}

// true se l'indirizzo ha superato il suo limite (ogni richiesta che arriva fin qui conta).
function ipOltreLimite(ip, now) {
  const list = (hits.get(ip) || []).filter((t) => now - t < RATE.windowMs);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear(); // evita che la memoria cresca senza fine
  return list.length > RATE.perIp;
}

// true se nell'ultima ora sono già stati inoltrati a Base44 troppi contatti (protegge crediti ed email).
function globaleOltreLimite(now) {
  globalHits = globalHits.filter((t) => now - t < 60 * 60 * 1000);
  if (globalHits.length >= RATE.globalPerHour) return true;
  globalHits.push(now);
  return false;
}

// Testo pulito: stringa, senza caratteri di controllo (tranne a capo e tab), senza il segno del blocco, tagliato.
function testo(v, max, { righe = true } = {}) {
  if (typeof v !== 'string') return '';
  let t = v.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  t = t.split(SEGNO_BLOCCO).join('');
  if (!righe) t = t.replace(/\s+/g, ' ');
  t = t.trim();
  return t.slice(0, max).trim();
}

// Provenienza dal browser: solo «chiave=valore» con caratteri semplici (lettere, numeri, _ . - / =), separati da «, ».
function provenienzaPulita(v) {
  if (typeof v !== 'string') return '';
  const pezzi = v.split(',').map((p) => p.trim()).filter(Boolean).slice(0, 8)
    .map((p) => p.replace(/[^\w.\-/=]/g, '').slice(0, 80))
    .filter((p) => p === 'diretto' || /^[a-z_]+=[\w.\-/]+$/i.test(p));
  return pezzi.join(', ').slice(0, MAX.provenienza);
}

function idFinto() {
  let s = '';
  for (let i = 0; i < 24; i++) s += '0123456789abcdef'[Math.floor(Math.random() * 16)];
  return s;
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowed = ALLOWED_ORIGINS.includes(origin);

  res.setHeader('Access-Control-Allow-Origin', allowed ? origin : ALLOWED_ORIGINS[0]);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') { res.status(allowed ? 204 : 403).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  if (!allowed) { res.status(403).json({ error: 'Origine non consentita' }); return; }

  const tipo = String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
  if (tipo !== 'application/json') { res.status(415).json({ error: 'Formato non supportato' }); return; }

  const now = Date.now();
  if (ipOltreLimite(clientIp(req), now)) {
    res.status(429).json({ error: 'Troppe richieste, riprova tra qualche minuto' });
    return;
  }

  let body;
  try { body = req.body; } catch (e) { body = null; }
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  if (!body || typeof body !== 'object' || Array.isArray(body)) { res.status(400).json({ error: 'Richiesta non valida' }); return; }

  // Campo trappola (nascosto alle persone): risposta identica a un invio riuscito, ma niente contatto e niente email.
  if (typeof body.sito_web === 'string' && body.sito_web.trim() !== '') {
    console.log('lead: campo trappola compilato, invio scartato'); // nessun dato della persona nel registro
    res.status(201).json({ success: true, id: idFinto() });
    return;
  }

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  if (!email) { res.status(400).json({ error: 'Email obbligatoria' }); return; }
  if (email.length > MAX_EMAIL || !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) {
    res.status(400).json({ error: 'Email non valida' });
    return;
  }

  const fonte = FONTI_SITO.includes(body.fonte) ? body.fonte : 'Altro';
  const zona = testo(body.zona, MAX.zona, { righe: false });
  const provenienza = typeof body.provenienza === 'string' ? (provenienzaPulita(body.provenienza) || 'diretto') : '';

  // Blocco tecnico in fondo alla nota (solo se la pagina manda la provenienza: le pagine di prima la mettevano nel testo).
  let note = testo(body.note_interne, MAX.note_interne);
  if (provenienza) {
    const blocco = [SEGNO_BLOCCO, 'Provenienza: ' + provenienza + '.', zona ? 'Zona: ' + zona + '.' : ''].filter(Boolean).join('\n');
    note = (note ? note + '\n' : '') + blocco;
  }

  const payload = {
    azienda: testo(body.azienda, MAX.azienda, { righe: false }),
    nome: testo(body.nome, MAX.nome, { righe: false }),
    cognome: testo(body.cognome, MAX.cognome, { righe: false }),
    email,
    telefono: testo(body.telefono, MAX.telefono, { righe: false }),
    attivita: testo(body.attivita, MAX.attivita, { righe: false }),
    esigenza: testo(body.esigenza, MAX.esigenza),
    strumenti_attuali: testo(body.strumenti_attuali, MAX.strumenti_attuali),
    volume_frequenza: testo(body.volume_frequenza, MAX.volume_frequenza),
    pacchetto_suggerito: normalizePackage(testo(body.pacchetto_suggerito, MAX.pacchetto_suggerito)),
    trascrizione_conversazione: testo(body.trascrizione_conversazione, MAX.trascrizione_conversazione),
    categoria: CATEGORIE.includes(body.categoria) ? body.categoria : 'Servizi AI',
    fonte,
    stato: 'Nuovo',
    priorita: PRIORITA.includes(body.priorita) ? body.priorita : 'Media',
    data_ricezione: new Date(now).toISOString(),
    note_interne: note,
  };
  if (zona) payload.zona = zona;

  // Tetto globale: conta solo ciò che arriva davvero a Base44.
  if (globaleOltreLimite(now)) {
    console.error('lead: tetto globale di inoltri raggiunto');
    res.status(429).json({ error: 'Troppe richieste, riprova tra qualche minuto' });
    return;
  }

  try {
    const upstream = await fetch(
      'https://ovia-flow-core.base44.app/functions/createLeadWebhook',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + process.env.BASE44_WEBHOOK_KEY,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await upstream.text();
    res.status(upstream.status).setHeader('Content-Type', 'application/json').send(data);
  } catch (e) {
    res.status(500).json({ error: 'Errore proxy verso Base44' });
  }
}
