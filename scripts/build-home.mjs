// Genera la homepage: /index.html e /en/index.html, dalla stessa struttura.
// I testi sono in T.it / T.en qui sotto; i servizi arrivano da data/prodotti.mjs.
// Modifica qui e rilancia `npm run sito`.
import { writeFileSync, mkdirSync } from 'node:fs';
import { SITE, prodottiIn } from '../data/prodotti.mjs';
import { head, header, footer, esc, calBtn, urlIn } from './lib/layout.mjs';
import { UI, pathFor } from './lib/i18n.mjs';
import { bloccoHome } from './build-faq.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const ALT = { it: '/', en: '/en/' };
const MARKETING = ['siti-web-ai', 'lead-generation'];
const AUTOMAZIONE = ['second-brain', 'inbox', 'chiamate', 'documenti', 'crm'];
const LOGHI = [
  { src: '/loghi/eurofiltri-trim.png', alt: 'Eurofiltri Group', h: 26, mono: true },
  { src: '/loghi/rialziamoci.svg', alt: 'Rialziamoci Italia', h: 34 },
  { src: '/loghi/l3-innovation-trim.png', alt: 'L3 Innovation', h: 26 },
  { src: '/loghi/lucrezia-trabucco-trim.png', alt: 'Lucrezia Trabucco, biologa nutrizionista', h: 15, mono: true },
];

const T = {
  it: {
    title: 'Ovia — Sistemi di marketing e automazione per le imprese',
    desc: 'Ovia progetta e gestisce sistemi di marketing e automazione per imprese e studi professionali: più clienti, meno lavoro ripetitivo, dati sotto controllo. Prenota il Process Check.',
    h1: 'Sistemi di marketing e automazione per le imprese.',
    lead: 'Progettiamo e gestiamo i sistemi che portano nuovi clienti alla tua azienda e tolgono il lavoro ripetitivo a chi ci lavora. Prima la strategia, poi la tecnologia.',
    talk: 'Parla con l’assistente',
    facts: [['15.000+', 'pratiche gestite con i software che abbiamo costruito'], ['30 minuti', 'per il Process Check, senza impegno'], ['Olbia', 'sede, braccio operativo di L3 Innovation Srl']],
    mapLabel: 'Come funziona un sistema Ovia',
    mapIn: 'Cosa arriva', mapOut: 'Cosa ottieni',
    ins: ['Ricerche su Google e sulle AI', 'Richieste dal sito e dai social', 'Email e chiamate', 'Documenti dei clienti'],
    core: [['Marketing', 'porta e qualifica i contatti'], ['Automazione', 'gestisce il lavoro ripetitivo']],
    outs: ['Nuovi clienti qualificati', 'Risposte in pochi minuti', 'Pratiche e scadenze in ordine', 'Numeri chiari per decidere'],
    human: 'Le decisioni che contano restano alle persone.',
    clients: 'Hanno scelto Ovia',
    sysH: 'Due sistemi che lavorano insieme.',
    sysP: 'Il marketing porta le richieste, l’automazione le gestisce senza perdite di tempo. Li progettiamo come un unico sistema, costruito sul modo in cui lavori.',
    mkH: 'Marketing', mkGoal: 'Portare nuovi clienti, in modo misurabile.',
    auH: 'Automazione', auGoal: 'Togliere il lavoro ripetitivo e riprendere il controllo.',
    landings: [['/siti-studi-professionali.html', 'Siti per studi professionali', 'Il sito che porta consulenze e prenota al posto tuo.'], ['/siti-attivita-locali.html', 'Siti per attività locali', 'Il sito che porta tavoli, clienti e prenotazioni.']],
    open: 'Scopri',
    methodH: 'Un metodo, quattro passaggi.',
    methodP: 'Nessuna trasformazione improvvisa: partiamo dal problema che ti costa di più e lo risolviamo con un risultato che si può misurare.',
    steps: [
      ['Process Check', 'Trenta minuti sul tuo flusso di lavoro reale: dove si perde tempo, dove si perdono clienti.'],
      ['Progetto', 'Ti proponiamo cosa costruire per primo, con costi, tempi e risultato atteso nero su bianco.'],
      ['Costruzione', 'Costruiamo il sistema sugli strumenti che usi già. Il tuo team lo prova prima che diventi operativo.'],
      ['Misura e cura', 'Misuriamo ore recuperate e clienti acquisiti, e miglioriamo il sistema mese dopo mese.'],
    ],
    originH: 'Abbiamo imparato dove un errore costa caro.',
    originP: 'Ovia è il braccio operativo di L3 Innovation Srl, nata a Olbia. Prima di lavorare con imprese e studi abbiamo costruito il software che ha gestito oltre 15.000 pratiche di sovraindebitamento: documenti, scadenze e persone che aspettano una risposta. Da lì viene il nostro metodo.',
    founder: 'Luca Lorenzo', founderRole: 'Fondatore e CEO', story: 'La nostra storia',
    founderAlt: 'Luca Lorenzo, fondatore e CEO di Ovia',
    trustH: 'La responsabilità resta alle persone.',
    trustP: 'Strategia e sicurezza fanno guadagnare. L’intelligenza artificiale è lo strumento.',
    trust: [
      ['Approvazione umana', 'Nessuna comunicazione sensibile parte senza il via libera di una persona del tuo team.'],
      ['Dati sotto controllo', 'Permessi per ruolo, registro di ogni modifica e, se serve, installazione sui tuoi server.'],
      ['Conformità', 'Sistemi progettati nel rispetto di GDPR, AI Act e Legge 132/2025 sull’intelligenza artificiale.'],
      ['Nessun addestramento', 'I dati dei tuoi clienti non vengono mai usati per addestrare modelli esterni.'],
    ],
    ctaH: 'Partiamo dal tuo processo reale.',
    ctaP: 'Trenta minuti con noi: ti mostriamo dove va il tempo, cosa si può automatizzare in sicurezza e da dove conviene partire.',
    ctaS: 'Senza impegno. Lavoriamo con pochi clienti alla volta.',
  },
  en: {
    title: 'Ovia — Marketing & automation systems for business',
    desc: 'Ovia designs and runs marketing and automation systems for businesses and professional firms: more clients, less repetitive work, data under control. Book the Process Check.',
    h1: 'Marketing and automation systems for business.',
    lead: 'We design and run the systems that bring new clients to your company and take repetitive work off your people. Strategy first, then technology.',
    talk: 'Talk to the assistant',
    facts: [['15,000+', 'cases handled with the software we built'], ['30 minutes', 'for the Process Check, no obligation'], ['Olbia, Italy', 'home base, operating arm of L3 Innovation Srl']],
    mapLabel: 'How an Ovia system works',
    mapIn: 'What comes in', mapOut: 'What you get',
    ins: ['Searches on Google and AI assistants', 'Enquiries from your site and social media', 'Emails and calls', 'Client documents'],
    core: [['Marketing', 'brings in and qualifies leads'], ['Automation', 'handles the repetitive work']],
    outs: ['New qualified clients', 'Replies within minutes', 'Cases and deadlines in order', 'Clear numbers for decisions'],
    human: 'The decisions that matter stay with people.',
    clients: 'They chose Ovia',
    sysH: 'Two systems working together.',
    sysP: 'Marketing brings the enquiries in, automation handles them without wasted time. We design them as one system, built around the way you work.',
    mkH: 'Marketing', mkGoal: 'Bring in new clients, measurably.',
    auH: 'Automation', auGoal: 'Remove repetitive work and take back control.',
    landings: [['/siti-studi-professionali.html', 'Websites for professional firms', 'The website that brings in consultations and books them for you.'], ['/siti-attivita-locali.html', 'Websites for local businesses', 'The website that brings in tables, clients and bookings.']],
    open: 'Explore',
    methodH: 'One method, four steps.',
    methodP: 'No sudden transformation: we start from the problem that costs you most and solve it with a result you can measure.',
    steps: [
      ['Process Check', 'Thirty minutes on your real workflow: where time is lost, where clients are lost.'],
      ['Plan', 'We propose what to build first, with costs, timing and the expected result in writing.'],
      ['Build', 'We build the system on the tools you already use. Your team tests it before it goes live.'],
      ['Measure and improve', 'We measure hours saved and clients won, and improve the system month after month.'],
    ],
    originH: 'We learned where a mistake costs the most.',
    originP: 'Ovia is the operating arm of L3 Innovation Srl, founded in Olbia, Italy. Before working with businesses and firms we built the software that has handled more than 15,000 debt-relief cases: documents, deadlines and people waiting for an answer. That is where our method comes from.',
    founder: 'Luca Lorenzo', founderRole: 'Founder and CEO', story: 'Our story',
    founderAlt: 'Luca Lorenzo, founder and CEO of Ovia',
    trustH: 'Responsibility stays with people.',
    trustP: 'Strategy and security make the money. Artificial intelligence is the tool.',
    trust: [
      ['Human approval', 'No sensitive message goes out without the go-ahead of someone on your team.'],
      ['Data under control', 'Role-based permissions, a log of every change and, if needed, installation on your own servers.'],
      ['Compliance', 'Systems designed in line with the GDPR, the EU AI Act and Italian Law 132/2025 on artificial intelligence.'],
      ['No training on your data', 'Your clients’ data is never used to train external models.'],
    ],
    ctaH: 'Let’s start from your real process.',
    ctaP: 'Thirty minutes with us: we show you where the time goes, what can be safely automated and where it makes sense to begin.',
    ctaS: 'No obligation. We work with a few clients at a time.',
  },
};

function pagina(lang) {
  const t = T[lang], u = UI[lang], P = x => pathFor(lang, x);
  const prods = prodottiIn(lang), byId = Object.fromEntries(prods.map(p => [p.id, p]));
  const url = SITE.url + ALT[lang];

  const jsonld = [{ '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebSite', '@id': SITE.url + '/#website', url: SITE.url + '/', name: 'Ovia', inLanguage: lang === 'en' ? 'en' : 'it-IT', publisher: { '@id': SITE.url + '/#organization' } },
    { '@type': 'Organization', '@id': SITE.url + '/#organization', name: 'Ovia', url: SITE.url, email: SITE.email, logo: SITE.url + '/favicon.svg',
      slogan: 'Marketing & automation systems for business', legalName: 'L3 Innovation Srl', vatID: 'IT02882330901',
      parentOrganization: { '@type': 'Organization', name: 'L3 Innovation Srl' },
      address: { '@type': 'PostalAddress', addressLocality: 'Olbia', addressCountry: 'IT' },
      founder: { '@type': 'Person', '@id': SITE.url + '/chi-siamo.html#luca-lorenzo', name: 'Luca Lorenzo' },
      sameAs: ['https://www.linkedin.com/company/oviaitalia'] },
    { '@type': 'WebPage', '@id': url + '#webpage', url, name: t.title, description: t.desc, inLanguage: lang === 'en' ? 'en' : 'it-IT', isPartOf: { '@id': SITE.url + '/#website' }, about: { '@id': SITE.url + '/#organization' } },
  ] }];

  const svc = ids => ids.map(id => byId[id]).map(p => `<li><a href="${urlIn(lang, p.id)}"><strong>${esc(p.name)}</strong><span>${esc(p.tagline)}</span><em>${t.open}</em></a></li>`).join('');
  const land = t.landings.map(([path, n, d]) => `<li><a href="${P(path)}"><strong>${esc(n)}</strong><span>${esc(d)}</span><em>${t.open}</em></a></li>`).join('');

  const extra = `<meta name="twitter:title" content="${esc(t.title)}">
<meta name="twitter:description" content="${esc(t.desc)}">`;

  return head({ title: t.title, description: t.desc, path: '/', lang, alt: ALT, jsonld, extra }) + header('home', lang, ALT) + `
<main>
  <section class="ov-wrap hm-hero">
    <div>
      <h1>${esc(t.h1)}</h1>
      <p class="ov-lead">${esc(t.lead)}</p>
      <div class="hm-ctas">${calBtn(u.cta)}<button type="button" class="ov-btn-ghost js-concierge">${esc(t.talk)}</button></div>
      <dl class="hm-facts">${t.facts.map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl>
    </div>
    <figure class="hm-map" aria-label="${esc(t.mapLabel)}">
      <div class="mp-col mp-in"><p class="mp-h">${esc(t.mapIn)}</p><ul>${t.ins.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
      <div class="mp-core"><p class="mp-name">OVIA</p>${t.core.map(([a, b]) => `<div><strong>${esc(a)}</strong><span>${esc(b)}</span></div>`).join('')}</div>
      <div class="mp-col mp-out"><p class="mp-h">${esc(t.mapOut)}</p><ul>${t.outs.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
      <figcaption>${esc(t.human)}</figcaption>
    </figure>
  </section>

  <section class="hm-clients" aria-label="${esc(t.clients)}"><div class="ov-wrap">
    <p>${esc(t.clients)}</p>
    <ul class="hm-logos">${LOGHI.map(l => `<li><img src="${l.src}" alt="${esc(l.alt)}"${l.mono ? ' class="mono"' : ''} style="height:${l.h}px" loading="lazy" decoding="async"></li>`).join('')}</ul>
  </div></section>

  <section class="ov-section" id="soluzioni"><div class="ov-wrap">
    <h2 class="ov-h2">${esc(t.sysH)}</h2>
    <p class="ov-lead">${esc(t.sysP)}</p>
    <div class="hm-sys">
      <div id="siti-web"><h3>${esc(t.mkH)}</h3><p class="goal">${esc(t.mkGoal)}</p><ul class="hm-svc">${svc(MARKETING)}${land}</ul></div>
      <div><h3>${esc(t.auH)}</h3><p class="goal">${esc(t.auGoal)}</p><ul class="hm-svc">${svc(AUTOMAZIONE)}</ul></div>
    </div>
  </div></section>

  <section class="ov-section" id="metodo" style="padding-top:0"><div class="ov-wrap">
    <h2 class="ov-h2">${esc(t.methodH)}</h2>
    <p class="ov-lead">${esc(t.methodP)}</p>
    <ol class="hm-steps">${t.steps.map(([h, p]) => `<li><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('')}</ol>
  </div></section>

  <section class="ov-section hm-origin" id="chi-siamo"><div class="ov-wrap hm-origin-grid">
    <div>
      <h2 class="ov-h2">${esc(t.originH)}</h2>
      <p class="ov-lead">${esc(t.originP)}</p>
    </div>
    <div class="hm-founder">
      <picture><source srcset="/assets/luca-lorenzo.webp" type="image/webp"><img src="/assets/luca-lorenzo.jpg" alt="${esc(t.founderAlt)}" width="120" height="150" loading="lazy" decoding="async"></picture>
      <div><strong>${esc(t.founder)}</strong><span>${esc(t.founderRole)}</span><a class="hm-link" href="${P('/chi-siamo.html')}">${esc(t.story)}</a></div>
    </div>
  </div></section>

  <section class="ov-section" id="sicurezza"><div class="ov-wrap">
    <h2 class="ov-h2">${esc(t.trustH)}</h2>
    <p class="ov-lead">${esc(t.trustP)}</p>
    <div class="hm-trust">${t.trust.map(([h, p]) => `<div><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join('')}</div>
  </div></section>

  ${bloccoHome(lang)}

  <section class="ov-wrap" id="prossimo-passo"><div class="ov-cta-band">
    <h2>${esc(t.ctaH)}</h2>
    <p>${esc(t.ctaP)}</p>
    <div class="hm-ctas">${calBtn(u.cta)}<button type="button" class="ov-btn-ghost js-concierge">${esc(t.talk)}</button></div>
    <p class="small">${esc(t.ctaS)}</p>
  </div></section>
</main>` + footer(lang);
}

export function buildHome() {
  mkdirSync(ROOT + 'en', { recursive: true });
  writeFileSync(ROOT + 'index.html', pagina('it'));
  writeFileSync(ROOT + 'en/index.html', pagina('en'));
}
