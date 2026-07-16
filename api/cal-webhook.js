// OVIA - Riceve il webhook "prenotazione creata" da Cal.com e lo inoltra
// come Lead a Base44, con stato "Process Check prenotato".
// La chiave BASE44_WEBHOOK_KEY resta lato server, come per lead.js.

const PACKAGE_NAMES = [
  'Ovia Second Brain',
  'Ovia Inbox',
  'Ovia Documenti',
  'Ovia Chiamate',
  'Ovia Workflow',
  'Ovia Conoscenza',
  'Ovia Clienti',
  'Ovia Crescita',
];

function normalizePackage(text) {
  if (!text) return 'Su misura';
  for (const name of PACKAGE_NAMES) {
    if (text.includes(name)) return name;
  }
  return 'Su misura';
}

// Il nome arriva come stringa unica da Cal.com; lo dividiamo in nome/cognome
// nel modo piu' semplice possibile (prima parola / resto).
function splitName(fullName) {
  const parts = (fullName || '').trim().split(/\s+/);
  if (parts.length === 0 || parts[0] === '') return { nome: '', cognome: '' };
  if (parts.length === 1) return { nome: parts[0], cognome: '' };
  return { nome: parts[0], cognome: parts.slice(1).join(' ') };
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
    if (typeof c === 'string' && c.startsWith('http')) return c;
  }
  return '';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body || {};
  const payload = body.payload || body;

  const attendee = (payload.attendees && payload.attendees[0]) || {};
  const { nome, cognome } = splitName(attendee.name);
  const email = attendee.email || '';
  const startTime = payload.startTime || '';
  const meetLink = extractMeetLink(payload);

  const leadPayload = {
    nome,
    cognome,
    email,
    esigenza: 'Prenotazione Process Check via Cal.com' + (meetLink ? (' - Meet: ' + meetLink) : ''),
    pacchetto_suggerito: normalizePackage(''),
    fonte: 'Process Check',
    stato: 'Process Check prenotato',
    data_ricezione: new Date().toISOString(),
    note_interne: JSON.stringify({ startTime, meetLink, raw: payload }).slice(0, 4000),
  };

  if (startTime) {
    leadPayload.data_appuntamento = startTime.slice(0, 10);
    leadPayload.ora_appuntamento = startTime.slice(11, 16);
  }

  if (!leadPayload.nome || !leadPayload.email) {
    // Payload inatteso (es. ping di test da Cal.com): rispondiamo comunque 200
    // per non far comparire l'endpoint come "in errore" nel pannello Cal.com.
    res.status(200).json({ skipped: true });
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
        body: JSON.stringify(leadPayload),
      }
    );

    const data = await upstream.text();
    res.status(upstream.status).setHeader('Content-Type', 'application/json').send(data);
  } catch (e) {
    res.status(500).json({ error: 'Errore proxy verso Base44' });
  }
}
