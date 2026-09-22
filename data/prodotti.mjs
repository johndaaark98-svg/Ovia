// =====================================================================
// OVIA — Catalogo prodotti: UNICA fonte di verità.
// Lo usano: pagine servizio, blog automatico (tag prodotti sotto ogni
// articolo), sitemap, llms.txt. Per aggiungere/togliere un servizio si
// modifica solo questo file e si rilancia `npm run build`.
// =====================================================================

export const SITE = {
  url: 'https://oviaitalia.it',
  name: 'Ovia',
  legal: 'Ovia — L3 Innovation Srl · P.IVA 02882330901',
  email: 'oviaitalia@gmail.com',
  calLink: 'ovia-jpa3s2/ovia-check-process',
  calNamespace: 'ovia-check-process',
  cta: 'Prenota il tuo Process Check',
  positioning: 'La strategia e la sicurezza fanno guadagnare. L’AI è lo strumento.',
};

// glyph = contenuto SVG in viewBox 0 0 88 88 (stesso stile della homepage)
export const PRODOTTI = [
  {
    id: 'second-brain', name: 'Ovia Second Brain', short: 'Second Brain', kicker: 'Il servizio di punta',
    tagline: 'La memoria del tuo studio, sempre interrogabile.',
    pitch: 'Chiamate, decisioni, note e impegni catturati, collegati al cliente giusto e ritrovati con una domanda.',
    keywords: ['memoria', 'conoscenza', 'knowledge management', 'ricerca informazioni', 'RAG', 'appunti', 'decisioni', 'second brain', 'assistente interno', 'procedure'],
    glyph: '<path class="g-line" d="M44 14 L20 34 L28 62 L60 62 L68 34 Z M44 14 L44 44 M20 34 L44 44 M68 34 L44 44 M28 62 L44 44 M60 62 L44 44"/><circle class="g-node" cx="44" cy="14" r="3"/><circle class="g-node" cx="20" cy="34" r="3"/><circle class="g-node" cx="68" cy="34" r="3"/><circle class="g-node" cx="28" cy="62" r="3"/><circle class="g-node" cx="60" cy="62" r="3"/><circle class="g-core" cx="44" cy="44" r="5"/>',
  },
  {
    id: 'inbox', name: 'Ovia Inbox', short: 'Inbox', kicker: 'Email',
    tagline: 'La tua casella, letta e capita.',
    pitch: 'Ogni email riconosciuta per cliente, argomento e urgenza, assegnata e con bozza di risposta pronta da approvare.',
    keywords: ['email', 'posta', 'PEC', 'casella', 'smistamento', 'risposte automatiche', 'customer service', 'triage', 'agenti AI email'],
    glyph: '<path class="g-line" d="M12 44 L36 24 L60 40 L78 18 M36 24 L44 56 L60 40 M12 44 L44 56 L70 70"/><circle class="g-node" cx="12" cy="44" r="3"/><circle class="g-node" cx="60" cy="40" r="3"/><circle class="g-node" cx="78" cy="18" r="3"/><circle class="g-node" cx="70" cy="70" r="3"/><circle class="g-core" cx="36" cy="24" r="4.5"/><circle class="g-core" cx="44" cy="56" r="4.5"/>',
  },
  {
    id: 'lead-generation', name: 'Ovia Lead Generation', short: 'Lead Generation', kicker: 'Nuovi clienti',
    tagline: 'Ogni contatto riceve risposta in minuti, non in giorni.',
    pitch: 'Risposta immediata ai nuovi contatti, qualifica, follow-up dei preventivi e riattivazione dei contatti freddi.',
    keywords: ['lead', 'lead generation', 'vendite', 'preventivi', 'follow-up', 'marketing', 'acquisizione clienti', 'outbound', 'inbound', 'conversione', 'sales'],
    glyph: '<path class="g-line" d="M12 72 L30 52 L48 60 L66 32 L78 14 M30 52 L38 30 M48 60 L70 66"/><circle class="g-node" cx="12" cy="72" r="3"/><circle class="g-node" cx="38" cy="30" r="3"/><circle class="g-node" cx="70" cy="66" r="3"/><circle class="g-node" cx="78" cy="14" r="3"/><circle class="g-core" cx="30" cy="52" r="4.5"/><circle class="g-core" cx="66" cy="32" r="4.5"/>',
  },
  {
    id: 'chiamate', name: 'Ovia Chiamate', short: 'Chiamate', kicker: 'Voce',
    tagline: 'Registra la chiamata. Il resto si organizza da solo.',
    pitch: 'Trascrizione e sintesi di chiamate e riunioni, trasformate in attività, scadenze e scheda cliente aggiornata.',
    keywords: ['chiamate', 'telefonate', 'riunioni', 'meeting', 'trascrizione', 'voce', 'speech to text', 'verbali', 'note vocali', 'Plaud'],
    glyph: '<path class="g-line" d="M10 50 Q30 10 50 40 T80 30 M50 40 L44 72 M44 72 L18 66"/><circle class="g-node" cx="10" cy="50" r="3"/><circle class="g-node" cx="80" cy="30" r="3"/><circle class="g-node" cx="18" cy="66" r="3"/><circle class="g-core" cx="50" cy="40" r="4.5"/><circle class="g-core" cx="44" cy="72" r="4.5"/>',
  },
  {
    id: 'documenti', name: 'Ovia Documenti', short: 'Documenti', kicker: 'Documenti',
    tagline: 'I documenti arrivano. Nessuno deve rincorrerli.',
    pitch: 'Richieste, controllo di ciò che arriva, solleciti mirati solo su ciò che manca, con storico di ogni invio.',
    keywords: ['documenti', 'solleciti', 'raccolta documentale', 'OCR', 'estrazione dati', 'archiviazione', 'fatture', 'pratiche', 'dichiarazioni', 'modelli'],
    glyph: '<path class="g-line" d="M14 70 L30 30 L54 50 L74 14 M30 30 L58 22 M54 50 L74 60"/><circle class="g-node" cx="14" cy="70" r="3"/><circle class="g-node" cx="58" cy="22" r="3"/><circle class="g-node" cx="74" cy="60" r="3"/><circle class="g-node" cx="74" cy="14" r="3"/><circle class="g-core" cx="30" cy="30" r="4.5"/><circle class="g-core" cx="54" cy="50" r="4.5"/>',
  },
  {
    id: 'siti-web-ai', name: 'Ovia Siti Web per le AI', short: 'Siti Web per le AI', kicker: 'AI search',
    tagline: 'Il sito che ChatGPT, Gemini e Google AI citano come risposta.',
    pitch: 'Siti progettati per essere trovati e citati dai motori AI, con assistente che risponde e prenota.',
    keywords: ['sito web', 'SEO', 'GEO', 'AI search', 'ChatGPT', 'AI Overviews', 'Perplexity', 'Gemini', 'posizionamento', 'SEO locale', 'dati strutturati'],
    glyph: '<path class="g-line" d="M44 12 A32 32 0 1 1 43.9 12 M12 44 L76 44 M44 12 Q24 44 44 76 M44 12 Q64 44 44 76"/><circle class="g-node" cx="12" cy="44" r="3"/><circle class="g-node" cx="76" cy="44" r="3"/><circle class="g-node" cx="44" cy="12" r="3"/><circle class="g-node" cx="44" cy="76" r="3"/><circle class="g-core" cx="44" cy="44" r="5"/>',
  },
  {
    id: 'crm', name: 'Ovia CRM', short: 'CRM', kicker: 'Controllo',
    tagline: 'Clienti, pratiche e scadenze in un’unica dashboard che lavora da sola.',
    pitch: 'CRM operativo su misura: scadenze ricorrenti, solleciti automatici, email categorizzate e documenti generati.',
    keywords: ['CRM', 'gestione clienti', 'scadenze', 'dashboard', 'pipeline', 'pratiche', 'team', 'attività', 'workflow', 'on-premise'],
    glyph: '<path class="g-line" d="M44 44 L20 20 M44 44 L68 20 M44 44 L20 68 M44 44 L68 68 M44 44 L44 12 M44 44 L44 76"/><circle class="g-node" cx="20" cy="20" r="3"/><circle class="g-node" cx="68" cy="20" r="3"/><circle class="g-node" cx="20" cy="68" r="3"/><circle class="g-node" cx="68" cy="68" r="3"/><circle class="g-node" cx="44" cy="12" r="3"/><circle class="g-node" cx="44" cy="76" r="3"/><circle class="g-core" cx="44" cy="44" r="5"/>',
  },
];

export const byId = Object.fromEntries(PRODOTTI.map(p => [p.id, p]));
export const urlOf = id => `/servizi/${id}.html`;
