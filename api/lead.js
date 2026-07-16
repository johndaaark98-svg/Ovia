// OVIA - Proxy sicuro verso il webhook Lead di Base44.
// La chiave WEBHOOK_API_KEY non e' mai nel codice del sito: sta nelle
// Environment Variables di Vercel (nome: BASE44_WEBHOOK_KEY).

const ALLOWED_ORIGINS = [
  'https://oviaitalia.it',
  'https://www.oviaitalia.it',
  'https://johndaaark98-svg.github.io',
];

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

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body || {};

  const payload = {
    nome: body.nome || '',
    cognome: body.cognome || '',
    email: body.email || '',
    telefono: body.telefono || '',
    attivita: body.attivita || '',
    esigenza: body.esigenza || '',
    strumenti_attuali: body.strumenti_attuali || '',
    volume_frequenza: body.volume_frequenza || '',
    pacchetto_suggerito: normalizePackage(body.pacchetto_suggerito),
    trascrizione_conversazione: body.trascrizione_conversazione || '',
    fonte: body.fonte || 'Sito - Maggiordomo',
    stato: body.stato || 'Nuovo',
    data_ricezione: body.data_ricezione || new Date().toISOString(),
    note_interne: body.note_interne || '',
  };

  if (body.data_appuntamento) payload.data_appuntamento = body.data_appuntamento;
  if (body.ora_appuntamento) payload.ora_appuntamento = body.ora_appuntamento;

  if (!payload.nome || !payload.cognome || !payload.email) {
    res.status(400).json({ error: 'Nome, cognome ed email sono obbligatori' });
    return;
  }

  try {
    const upstream = await fetch(
      'https://base44.app/apps/6a58ab9b7da671857cfef024/api/functions/invoke/createLeadWebhook',
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
