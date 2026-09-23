// Genera /faq.html e /en/faq.html, e il blocco FAQ delle due homepage.
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { SITE } from '../data/prodotti.mjs';
import { FAQ, FAQ_CATEGORIE } from '../data/faq.mjs';
import { FAQ_EN, FAQ_CATEGORIE_EN } from '../data/en/faq.mjs';
import { head, header, footer, esc, calBtn } from './lib/layout.mjs';
import { UI, pathFor } from './lib/i18n.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const DATA = { it: { faq: FAQ, cat: FAQ_CATEGORIE }, en: { faq: FAQ_EN, cat: FAQ_CATEGORIE_EN } };
const T = {
  it: { title: 'Domande frequenti su Ovia — AI, sicurezza, costi e tempi | Ovia', desc: 'Tutte le risposte su Ovia: come funziona il Process Check, sicurezza dei dati, Legge 132/2025, servizi, integrazioni, costi e tempi. Per studi professionali e PMI.', crumb: 'Domande frequenti', ey: 'Domande frequenti', h1: 'Tutto quello che ci chiedono, prima di iniziare.', lead: 'Metodo, sicurezza dei dati, normativa, costi e tempi: risposte dirette, senza gergo tecnico. Se la tua domanda non c’è, fallo nel Process Check.', search: 'Cerca una domanda… (es. privacy, costi, PEC)', searchL: 'Cerca nelle domande frequenti', filterL: 'Filtra per argomento', all: n => `Tutte (${n})`, empty: 'Nessuna domanda trovata. Prova con un’altra parola, oppure chiedicelo direttamente nel Process Check.', ctaH: 'La tua domanda non è qui?', ctaP: 'Trenta minuti sul tuo flusso di lavoro reale. Rispondiamo a tutto, anche a ciò che non si scrive in una FAQ.', ctaS: 'Senza impegno. Lavoriamo con pochi clienti alla volta.', homeH: 'Le domande che ci fanno prima di iniziare.', more: n => `Tutte le ${n} domande frequenti →` },
  en: { title: 'Ovia FAQ — AI, security, costs and timing | Ovia', desc: 'All the answers about Ovia: how the Process Check works, data security, Italian AI law, services, integrations, costs and timing. For professional firms and SMEs.', crumb: 'FAQ', ey: 'Frequently asked questions', h1: 'Everything people ask us before getting started.', lead: 'Method, data security, regulation, costs and timing: straight answers, no jargon. If your question isn’t here, ask it in the Process Check.', search: 'Search a question… (e.g. privacy, costs, email)', searchL: 'Search the FAQ', filterL: 'Filter by topic', all: n => `All (${n})`, empty: 'No questions found. Try another word, or ask us directly in the Process Check.', ctaH: 'Your question isn’t here?', ctaP: 'Thirty minutes on your real workflow. We answer everything, including what doesn’t fit in an FAQ.', ctaS: 'No obligation. We work with a few clients at a time.', homeH: 'The questions people ask us before getting started.', more: n => `All ${n} frequently asked questions →` },
};

// **grassetto** e [testo](/percorso-interno) — solo link interni al sito.
export function faqInline(t) {
  return esc(t)
    .replace(/\[([^\]]+)\]\((\/[a-z0-9\-/.]*)\)/g, (_, l, u) => `<a href="${u}">${l}</a>`)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}
const plain = t => t.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*/g, '');
const slug = s => s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70);

export function faqJsonLd(items) {
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: plain(f.a) } })) };
}

function pagina(lang) {
  const { faq, cat } = DATA[lang], t = T[lang], u = UI[lang], P = x => pathFor(lang, x);
  const alt = { it: '/faq.html', en: '/en/faq.html' };
  const chips = `<button data-f="tutti" aria-pressed="true">${t.all(faq.length)}</button>` + cat.map(c => `<button data-f="${c.id}" aria-pressed="false">${esc(c.label)}</button>`).join('');
  const gruppi = cat.map(c => {
    const voci = faq.filter(f => f.c === c.id);
    if (!voci.length) return '';
    return `<section class="fq-group" data-cat="${c.id}" id="${c.id}">
      <h2 class="fq-h2">${esc(c.label)}</h2>
      <div class="ov-faq">${voci.map(f => `<details id="${slug(f.q)}" data-search="${esc((f.q + ' ' + plain(f.a)).toLowerCase())}"><summary>${esc(f.q)}</summary><div class="ans"><p>${faqInline(f.a)}</p></div></details>`).join('')}</div>
    </section>`;
  }).join('');
  const jsonld = [faqJsonLd(faq), { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: u.home, item: SITE.url + P('/') }, { '@type': 'ListItem', position: 2, name: t.crumb, item: SITE.url + P('/faq.html') }] }];
  return head({ title: t.title, description: t.desc, path: '/faq.html', lang, alt, jsonld }) + header('faq', lang, alt) + `
<main><div class="ov-narrow">
  <nav class="ov-breadcrumb" aria-label="${u.breadcrumb}"><a href="${P('/')}">${u.home}</a><span>/</span>${t.crumb}</nav>
  <section class="bl-hero">
    <p class="ov-eyebrow">${t.ey}</p>
    <h1>${t.h1}</h1>
    <p class="ov-lead">${t.lead}</p>
  </section>
  <div data-faq>
    <input class="bl-search fq-search" type="search" placeholder="${t.search}" aria-label="${t.searchL}">
    <div class="bl-filters fq-filters" role="group" aria-label="${t.filterL}">${chips}</div>
    ${gruppi}
    <p class="bl-empty">${t.empty}</p>
  </div>
  <section class="ov-section"><div class="ov-cta-band">
    <p class="ov-eyebrow">Ovia Process Check</p>
    <h2>${t.ctaH}</h2>
    <p>${t.ctaP}</p>
    ${calBtn(u.cta)}
    <p class="small">${t.ctaS}</p>
  </div></section>
</div></main>` + footer(lang);
}

// Blocco per la homepage: selezione "home: true" + link alla pagina completa.
// Link relativi alla cartella della homepage (/ o /en/).
export function bloccoHome(lang = 'it') {
  const { faq } = DATA[lang], t = T[lang], voci = faq.filter(f => f.home);
  const rel = h => lang === 'en' ? h : h.replace(/href="\//g, 'href="');
  return `<!-- FAQ:INIZIO (generato da scripts/build-faq.mjs — non modificare a mano) -->
    <section class="home-faq" id="faq">
      <p class="hf-eyebrow">${t.ey}</p>
      <h2 class="hf-title">${t.homeH}</h2>
      <div class="hf-list">${voci.map((f, i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(f.q)}</summary><div class="hf-ans"><p>${rel(faqInline(f.a))}</p></div></details>`).join('')}</div>
      <p class="hf-more"><a href="${lang === 'en' ? '/en/faq.html' : 'faq.html'}">${t.more(faq.length)}</a></p>
      <script type="application/ld+json">${JSON.stringify(faqJsonLd(voci)).replace(/</g, '\\u003c')}</script>
    </section>
    <!-- FAQ:FINE -->`;
}

function aggiornaHome(file, lang) {
  if (!existsSync(file)) return;
  let h = readFileSync(file, 'utf8');
  const re = /<!-- FAQ:INIZIO[\s\S]*?<!-- FAQ:FINE -->/;
  if (re.test(h)) h = h.replace(re, () => bloccoHome(lang));
  else h = h.replace('<section class="next-step" id="prossimo-passo">', () => bloccoHome(lang) + '\n\n    <section class="next-step" id="prossimo-passo">');
  writeFileSync(file, h);
}

export function buildFaq() {
  mkdirSync(ROOT + 'en', { recursive: true });
  writeFileSync(ROOT + 'faq.html', pagina('it'));
  writeFileSync(ROOT + 'en/faq.html', pagina('en'));
  aggiornaHome(ROOT + 'index.html', 'it');
}
export { aggiornaHome };
