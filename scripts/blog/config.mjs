// =====================================================================
// OVIA BLOG — configurazione del motore editoriale giornaliero.
// Modifica liberamente fonti, categorie e parametri: nient'altro da toccare.
// =====================================================================

export const CONFIG = {
  // Modello Anthropic (sovrascrivibile con la variabile BLOG_MODEL nel workflow)
  model: process.env.BLOG_MODEL || 'claude-sonnet-4-6',
  author: process.env.BLOG_AUTHOR || 'Redazione Ovia',
  // Finestra temporale delle notizie da considerare (ore)
  windowHours: 72,
  // Quante fonti al massimo mettere nella stessa sintesi
  maxSources: 4,
  // Lunghezza minima dell'articolo (parole)
  minWords: 1200,
  // Soglia anti-copia: quota massima di sequenze di 8 parole in comune con una singola fonte
  maxOverlap: 0.06,
  // Tentativi di riscrittura se un controllo di qualità fallisce
  maxAttempts: 3,
};

export const CATEGORIE = [
  { id: 'normativa-sicurezza', label: 'Normativa e sicurezza' },
  { id: 'automazione', label: 'Automazione' },
  { id: 'ai-search-marketing', label: 'AI search e marketing' },
  { id: 'strumenti-ai', label: 'Strumenti AI' },
  { id: 'strategia', label: 'Strategia' },
];

// Fonti RSS/Atom del settore AI. Una fonte che non risponde viene saltata
// (e segnalata nel log), non blocca la pubblicazione.
// "filtra": true = fonte generalista, si tengono solo le notizie che parlano di AI.
export const FONTI_RSS = [
  // Italia
  { nome: 'Agenda Digitale', url: 'https://www.agendadigitale.eu/feed/', lingua: 'it', filtra: true },
  { nome: 'AI4Business', url: 'https://www.ai4business.it/feed/', lingua: 'it' },
  { nome: 'Cybersecurity360', url: 'https://www.cybersecurity360.it/feed/', lingua: 'it', filtra: true },
  { nome: 'Key4biz', url: 'https://www.key4biz.it/feed/', lingua: 'it', filtra: true },
  { nome: 'Wired Italia', url: 'https://www.wired.it/feed/rss', lingua: 'it', filtra: true },
  { nome: 'Innovation Post', url: 'https://www.innovationpost.it/feed/', lingua: 'it', filtra: true },
  { nome: 'FederPrivacy', url: 'https://www.federprivacy.org/informazione/flash-news?format=feed&type=rss', lingua: 'it', filtra: true },
  // Internazionali
  { nome: 'OpenAI News', url: 'https://openai.com/news/rss.xml', lingua: 'en' },
  { nome: 'Google AI Blog', url: 'https://blog.google/technology/ai/rss/', lingua: 'en' },
  { nome: 'Hugging Face Blog', url: 'https://huggingface.co/blog/feed.xml', lingua: 'en' },
  { nome: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', lingua: 'en' },
  { nome: 'The Verge AI', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', lingua: 'en' },
  { nome: 'VentureBeat AI', url: 'https://venturebeat.com/category/ai/feed/', lingua: 'en' },
  { nome: 'MIT Technology Review AI', url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed', lingua: 'en' },
  { nome: 'Search Engine Land', url: 'https://searchengineland.com/feed', lingua: 'en', filtra: true },
  { nome: 'Search Engine Journal', url: 'https://www.searchenginejournal.com/feed/', lingua: 'en', filtra: true },
];

export const FILTRO_AI = /\b(ai|a\.i\.|intelligenza artificiale|artificial intelligence|llm|chatgpt|openai|claude|anthropic|gemini|copilot|agent[ie]?|agentic|automazion|automation|machine learning|genai|generativ|ai act|gpt|mistral|llama|perplexity|ai overview|deepfake)\b/i;
