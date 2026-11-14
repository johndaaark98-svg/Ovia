// OVIA - Riceve il webhook "prenotazione creata" da Cal.com e lo inoltra
// come Lead a Base44, con stato "Process Check prenotato".
// La chiave BASE44_WEBHOOK_KEY resta lato server, come per lead.js.
//
// SICUREZZA (14/11/2026, correzione A3 della verifica indipendente):
// Cal.com firma ogni chiamata: l'intestazione X-Cal-Signature-256 contiene l'HMAC-SHA256 (in esadecimale)
// del corpo della richiesta, calcolato con il «secret» impostato sul webhook in Cal.com.
//   - Se la variabile d'ambiente CAL_WEBHOOK_SECRET esiste (impostata da Luca su Vercel): ogni richiesta senza
//     una firma valida riceve 401 e non arriva al CRM. Il confronto è a tempo costante.
//   - Finché la variabile NON esiste: la richiesta viene accettata (per non perdere prenotazioni vere), ma con un
//     limite di frequenza, SENZA email di avviso e con «Firma Cal.com: NON VERIFICATA» nelle note del contatto.
// Per leggere il corpo esattamente com'è arrivato (serve alla firma) si usa la forma «fetch» delle funzioni Vercel.

import { createHmac, timingSafeEqual } from 'node:crypto';

const PACKAGE_NAMES = [
  // Ordine importante: i nomi più lunghi prima, così "Ovia Siti Web per le AI"
  // non viene confuso con il vecchio "Ovia Siti Web".
  'Ovia Siti Web per le AI',
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

// Segno del blocco tecnico: identico a quello di api/lead.js e del CRM.
const SEGNO_BLOCCO = '— Dati tecnici del modulo —';
const MAX_CORPO = 100 * 1024; // un webhook di Cal.com pesa pochi kB

// Limite di frequenza quando la firma NON si può verificare (per istanza della funzione).
const RATE = { windowMs: 60 * 60 * 1000, perIp: 10, globalPerHour: 30 };
const hits = new Map();
let globalHits = [];

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

// Il nome arriva come stringa unica da Cal.com; lo dividiamo in nome/cognome
// nel modo piu' semplice possibile (prima parola / resto).
function splitName(fullName) {
  const parts = (typeof fullName === 'string' ? fullName : '').trim().split(/\s+/);
  if (parts.length === 0 || parts[0] === '') return { nome: '', cognome: '' };
  if (parts.length === 1) return { nome: parts[0].slice(0, 80), cognome: '' };
  return { nome: parts[0].slice(0, 80), cognome: parts.slice(1).join(' ').slice(0, 80) };
}

// Cal.com colloca il link Meet in punti diversi a seconda della versione
// e del tipo di integrazione video: proviamo i percorsi piu' comuni.
function extractMeetLink(payload) {
  const candidates = [
    payload.videoCallData && payload.videoCallData.url,
    payload.location,
    payload.metadata && payload.metadata.videoCallUrl,
    payload.additionalInformation && payload.additionalInformation.hangoutLink,
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && c.startsWith('http')) return c.slice(0, 500);
  }
  return '';
}

function firmaValida(corpo, intestazione, segreto) {
  if (!intestazione || !/^[a-f0-9]{64}$/i.test(intestazione)) return false; // es. «no-secret-provided»
  const attesa = createHmac('sha256', segreto).update(corpo, 'utf8').digest();
  const ricevuta = Buffer.from(intestazione, 'hex');
  return ricevuta.length === attesa.length && timingSafeEqual(ricevuta, attesa);
}

function oltreLimite(ip, now) {
  globalHits = globalHits.filter((t) => now - t < RATE.windowMs);
  if (globalHits.length >= RATE.globalPerHour) return true;
  const list = (hits.get(ip) || []).filter((t) => now - t < RATE.windowMs);
  if (list.length >= RATE.perIp) { hits.set(ip, list); return true; }
  list.push(now);
  hits.set(ip, list);
  globalHits.push(now);
  if (hits.size > 5000) hits.clear();
  return false;
}

function json(dati, status) {
  return new Response(JSON.stringify(dati), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}

export default {
  async fetch(request) {
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

    const corpo = await request.text();
    if (corpo.length > MAX_CORPO) return json({ error: 'Richiesta troppo grande' }, 413);

    const segreto = process.env.CAL_WEBHOOK_SECRET || '';
    const verificata = segreto ? firmaValida(corpo, request.headers.get('x-cal-signature-256'), segreto) : false;
    if (segreto && !verificata) return json({ error: 'Firma non valida' }, 401);

    if (!segreto) {
      const ip = (request.headers.get('x-real-ip') || (request.headers.get('x-forwarded-for') || '').split(',')[0] || 'unknown').trim();
      if (oltreLimite(ip, Date.now())) return json({ error: 'Troppe richieste' }, 429);
    }

    let body;
    try { body = JSON.parse(corpo); } catch (e) { body = null; }
    if (!body || typeof body !== 'object') return json({ skipped: true }, 200);
    const payload = (body.payload && typeof body.payload === 'object') ? body.payload : body;

    const attendee = (Array.isArray(payload.attendees) && payload.attendees[0]) || {};
    const { nome, cognome } = splitName(attendee.name);
    const email = typeof attendee.email === 'string' ? attendee.email.trim().slice(0, 254) : '';
    const startTime = typeof payload.startTime === 'string' ? payload.startTime.slice(0, 40) : '';
    const meetLink = extractMeetLink(payload);

    if (!nome || !email) {
      // Payload inatteso (es. ping di test da Cal.com): rispondiamo comunque 200
      // per non far comparire l'endpoint come "in errore" nel pannello Cal.com.
      return json({ skipped: true }, 200);
    }

    const grezzo = JSON.stringify({ startTime, meetLink, raw: payload }).split(SEGNO_BLOCCO).join('').slice(0, 4000);
    const blocco = [SEGNO_BLOCCO, verificata ? 'Firma Cal.com: verificata.' : 'Firma Cal.com: NON VERIFICATA (segreto non ancora impostato su Vercel). Controlla che la prenotazione esista davvero in Cal.com.'].join('\n');

    const leadPayload = {
      nome,
      cognome,
      email,
      esigenza: 'Prenotazione Process Check via Cal.com' + (meetLink ? (' - Meet: ' + meetLink) : ''),
      pacchetto_suggerito: normalizePackage(''),
      fonte: 'Process Check',
      stato: 'Process Check prenotato',
      data_ricezione: new Date().toISOString(),
      note_interne: grezzo + '\n' + blocco,
    };
    if (!verificata) leadPayload.senza_avviso = true; // il CRM salva il contatto ma non manda l'email di avviso

    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(startTime)) {
      leadPayload.data_appuntamento = startTime.slice(0, 10);
      leadPayload.ora_appuntamento = startTime.slice(11, 16);
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
          body: JSON.stringify(leadPayload),
        }
      );
      const data = await upstream.text();
      return new Response(data, { status: upstream.status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
    } catch (e) {
      return json({ error: 'Errore proxy verso Base44' }, 500);
    }
  },
};
