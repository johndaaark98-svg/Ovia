// Genera /faq.html da data/faq.mjs ed esporta l'HTML del blocco FAQ per la homepage.
import { writeFileSync, readFileSync } from 'node:fs';
import { SITE } from '../data/prodotti.mjs';
import { FAQ, FAQ_CATEGORIE } from '../data/faq.mjs';
import { head, header, footer, esc, calBtn } from './lib/layout.mjs';

const ROOT = new URL('..', import.meta.url).pathname;

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

function pagina() {
  const chips = `<button data-f="tutti" aria-pressed="true">Tutte (${FAQ.length})</button>` +
    FAQ_CATEGORIE.map(c => `<button data-f="${c.id}" aria-pressed="false">${esc(c.label)}</button>`).join('');
  const gruppi = FAQ_CATEGORIE.map(c => {
    const voci = FAQ.filter(f => f.c === c.id);
    if (!voci.length) return '';
    return `<section class="fq-group" data-cat="${c.id}" id="${c.id}">
      <h2 class="fq-h2">${esc(c.label)}</h2>
      <div class="ov-faq">${voci.map(f => `<details id="${slug(f.q)}" data-search="${esc((f.q + ' ' + plain(f.a)).toLowerCase())}"><summary>${esc(f.q)}</summary><div class="ans"><p>${faqInline(f.a)}</p></div></details>`).join('')}</div>
    </section>`;
  }).join('');
  const jsonld = [
    faqJsonLd(FAQ),
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url + '/' }, { '@type': 'ListItem', position: 2, name: 'Domande frequenti', item: SITE.url + '/faq.html' }] },
  ];
  return head({ title: 'Domande frequenti su Ovia — AI, sicurezza, costi e tempi | Ovia', description: 'Tutte le risposte su Ovia: come funziona il Process Check, sicurezza dei dati, Legge 132/2025, servizi, integrazioni, costi e tempi. Per studi professionali e PMI.', path: '/faq.html', jsonld }) + header('faq') + `
<main><div class="ov-narrow">
  <nav class="ov-breadcrumb" aria-label="Percorso"><a href="/">Home</a><span>/</span>Domande frequenti</nav>
  <section class="bl-hero">
    <p class="ov-eyebrow">Domande frequenti</p>
    <h1>Tutto quello che ci chiedono, prima di iniziare.</h1>
    <p class="ov-lead">Metodo, sicurezza dei dati, normativa, costi e tempi: risposte dirette, senza gergo tecnico. Se la tua domanda non c’è, fallo nel Process Check.</p>
  </section>
  <div data-faq>
    <input class="bl-search fq-search" type="search" placeholder="Cerca una domanda… (es. privacy, costi, PEC)" aria-label="Cerca nelle domande frequenti">
    <div class="bl-filters fq-filters" role="group" aria-label="Filtra per argomento">${chips}</div>
    ${gruppi}
    <p class="bl-empty">Nessuna domanda trovata. Prova con un’altra parola, oppure chiedicelo direttamente nel Process Check.</p>
  </div>
  <section class="ov-section"><div class="ov-cta-band">
    <p class="ov-eyebrow">Ovia Process Check</p>
    <h2>La tua domanda non è qui?</h2>
    <p>Trenta minuti sul tuo flusso di lavoro reale. Rispondiamo a tutto, anche a ciò che non si scrive in una FAQ.</p>
    ${calBtn()}
    <p class="small">Senza impegno. Lavoriamo con pochi clienti alla volta.</p>
  </div></section>
</div></main>` + footer();
}

// Blocco per la homepage (index.html): selezione "home: true" + link alla pagina completa.
export function bloccoHome() {
  const voci = FAQ.filter(f => f.home);
  return `<!-- FAQ:INIZIO (generato da scripts/build-faq.mjs — non modificare a mano) -->
    <section class="home-faq" id="faq">
      <p class="hf-eyebrow">Domande frequenti</p>
      <h2 class="hf-title">Le domande che ci fanno prima di iniziare.</h2>
      <div class="hf-list">${voci.map((f, i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(f.q)}</summary><div class="hf-ans"><p>${faqInline(f.a).replace(/href="\//g, 'href="')}</p></div></details>`).join('')}</div>
      <p class="hf-more"><a href="faq.html">Tutte le ${FAQ.length} domande frequenti →</a></p>
      <script type="application/ld+json">${JSON.stringify(faqJsonLd(voci)).replace(/</g, '\\u003c')}</script>
    </section>
    <!-- FAQ:FINE -->`;
}

export function buildFaq() {
  writeFileSync(ROOT + 'faq.html', pagina());
  // aggiorna il blocco tra i marcatori in index.html (idempotente)
  const f = ROOT + 'index.html';
  let h = readFileSync(f, 'utf8');
  const re = /<!-- FAQ:INIZIO[\s\S]*?<!-- FAQ:FINE -->/;
  if (re.test(h)) h = h.replace(re, bloccoHome());
  else h = h.replace('<section class="next-step" id="prossimo-passo">', bloccoHome() + '\n\n    <section class="next-step" id="prossimo-passo">');
  writeFileSync(f, h);
}
