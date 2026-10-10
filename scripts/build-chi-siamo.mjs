// Genera /chi-siamo.html e /en/about.html: storia di Ovia, valori e fondatore.
// I testi sono qui sotto (T.it / T.en): modificali qui e rilancia `npm run sito`.
import { writeFileSync, mkdirSync } from 'node:fs';
import { SITE } from '../data/prodotti.mjs';
import { head, header, footer, esc, calBtn } from './lib/layout.mjs';
import { UI, pathFor } from './lib/i18n.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const ALT = { it: '/chi-siamo.html', en: '/en/about.html' };
const FOTO = { webp: '/assets/luca-lorenzo.webp', jpg: '/assets/luca-lorenzo.jpg', w: 900, h: 1206 };

const T = {
  it: {
    title: 'Chi siamo — Ovia, il braccio operativo di L3 Innovation | Ovia',
    desc: 'Ovia nasce a Olbia come braccio operativo di L3 Innovation Srl. Dai software per il sovraindebitamento, con oltre 15.000 pratiche gestite, ai sistemi automatizzati per studi e imprese. Fondatore e CEO: Luca Lorenzo.',
    crumb: 'Chi siamo',
    ey: 'Chi siamo',
    h1: 'Siamo nati dentro le pratiche vere. Per questo costruiamo sistemi che funzionano.',
    lead: 'Ovia è il braccio operativo di L3 Innovation Srl: una realtà nata a Olbia che progetta sistemi di automazione e intelligenza artificiale su misura per studi professionali e imprese.',
    stats: [
      ['15.000+', 'pratiche di sovraindebitamento gestite con i nostri software'],
      ['Olbia', 'dove è nata Ovia, come braccio operativo di L3 Innovation'],
      ['1 principio', 'la tecnologia serve le persone, non il contrario'],
    ],
    storiaEy: 'La nostra storia',
    storiaH: 'Abbiamo imparato sul campo più difficile.',
    storia: [
      'Abbiamo iniziato da uno dei settori più complessi da digitalizzare: il **sovraindebitamento**. Pratiche lunghe, documenti da raccogliere, scadenze da rispettare e, dall’altra parte, persone in un momento delicato della loro vita.',
      'Lì abbiamo progettato e sviluppato il software che ha gestito **oltre 15.000 pratiche**. Ogni errore costava tempo a chi lavorava e serenità a chi aspettava una risposta: un’ottima scuola per capire cosa significa costruire sistemi affidabili.',
      'Quell’esperienza ci ha lasciato una convinzione: la tecnologia rende davvero solo quando si adatta al modo in cui le persone lavorano. Da lì abbiamo allargato lo sguardo. Oggi portiamo lo stesso metodo negli studi professionali e nelle imprese, con **sistemi automatizzati che migliorano, semplificano e rendono più produttivo il lavoro di ogni giorno**.',
    ],
    tappe: [
      ['L’inizio', 'Nasce L3 Innovation, a Olbia, per costruire software dove i processi sono più complessi.'],
      ['Sovraindebitamento', 'Software dedicati alle procedure di sovraindebitamento: oltre 15.000 pratiche gestite.'],
      ['Ovia', 'Il metodo diventa un’offerta per studi professionali e imprese: nasce Ovia, braccio operativo di L3 Innovation.'],
    ],
    valoriEy: 'Cosa non cambia',
    valoriH: 'Automatizziamo il lavoro, non le persone.',
    valoriLead: 'L’AI prepara, organizza e segnala. Le decisioni restano a chi ha esperienza e responsabilità. È la condizione per lavorare con dati delicati come quelli dei clienti di uno studio.',
    valori: [
      ['Strategia', 'Prima capiamo come lavori, dove si perde tempo e cosa vale la pena automatizzare. Lo strumento si sceglie dopo.', 'Da dove partiamo', 100, false],
      ['Sicurezza', 'Dati protetti, permessi chiari, tracciabilità di ogni passaggio. Non è un’aggiunta finale: è il punto di partenza.', 'Non negoziabile', 100, false],
      ['Valore umano', 'Il sistema toglie i passaggi ripetitivi e restituisce tempo alle persone, che restano al centro di ogni decisione.', 'Il fattore più importante', 100, false],
    ],
    fondEy: 'Il fondatore',
    fondNome: 'Luca Lorenzo',
    fondRuolo: 'Fondatore e CEO di Ovia',
    fondBio: [
      'Luca ha fondato L3 Innovation e ha seguito da vicino lo sviluppo dei software per il sovraindebitamento. Oggi guida Ovia con un’idea semplice: partire dal processo reale di chi lavora, mettere la sicurezza dei dati al primo posto e usare l’intelligenza artificiale solo dove produce un risultato misurabile.',
    ],
    citazione: 'Non vendiamo intelligenza artificiale. Togliamo dal lavoro delle persone tutto ciò che non richiede una persona.',
    fotoAlt: 'Luca Lorenzo, fondatore e CEO di Ovia',
    ctaH: 'Partiamo dal tuo lavoro reale.',
    ctaP: 'Trenta minuti sul tuo flusso di lavoro: dove va il tempo, cosa si può automatizzare in sicurezza e da dove conviene iniziare.',
    ctaS: 'Senza impegno. Lavoriamo con pochi clienti alla volta.',
  },
  en: {
    title: 'About us — Ovia, the operating arm of L3 Innovation | Ovia',
    desc: 'Ovia was born in Olbia, Italy, as the operating arm of L3 Innovation Srl. From debt-relief case software, with more than 15,000 cases handled, to automated systems for professional firms and businesses. Founder and CEO: Luca Lorenzo.',
    crumb: 'About us',
    ey: 'About us',
    h1: 'We were born inside real casework. That is why we build systems that work.',
    lead: 'Ovia is the operating arm of L3 Innovation Srl: a company born in Olbia, Italy, that designs tailor-made automation and artificial intelligence systems for professional firms and businesses.',
    stats: [
      ['15,000+', 'debt-relief cases handled with our software'],
      ['Olbia', 'where Ovia was born, as the operating arm of L3 Innovation'],
      ['1 principle', 'technology serves people, not the other way round'],
    ],
    storiaEy: 'Our story',
    storiaH: 'We learned in the hardest field.',
    storia: [
      'We started in one of the hardest sectors to digitise: **over-indebtedness and debt relief**. Long cases, documents to collect, deadlines to meet and, on the other side, people going through a delicate moment in their lives.',
      'That is where we designed and built the software that has handled **more than 15,000 cases**. Every mistake cost time to the people doing the work and peace of mind to the people waiting for an answer: a great school for learning what reliable systems really mean.',
      'That experience left us with one conviction: technology only pays off when it adapts to the way people work. From there we widened our view. Today we bring the same method to professional firms and businesses, with **automated systems that improve, simplify and make everyday work more productive**.',
    ],
    tappe: [
      ['The beginning', 'L3 Innovation is founded in Olbia to build software where processes are most complex.'],
      ['Debt relief', 'Dedicated software for debt-relief procedures: more than 15,000 cases handled.'],
      ['Ovia', 'The method becomes an offer for professional firms and businesses: Ovia is born, the operating arm of L3 Innovation.'],
    ],
    valoriEy: 'What never changes',
    valoriH: 'We automate the work, not the people.',
    valoriLead: 'AI prepares, organises and flags. Decisions stay with the people who have the experience and the responsibility. That is the condition for working with sensitive data such as a firm’s client records.',
    valori: [
      ['Strategy', 'First we understand how you work, where time is lost and what is worth automating. The tool comes after.', 'Where we start', 100, false],
      ['Security', 'Protected data, clear permissions, every step traceable. Not a final add-on: the starting point.', 'Non-negotiable', 100, false],
      ['Human value', 'The system removes repetitive steps and gives time back to people, who stay at the centre of every decision.', 'The most important factor', 100, false],
    ],
    fondEy: 'The founder',
    fondNome: 'Luca Lorenzo',
    fondRuolo: 'Founder and CEO of Ovia',
    fondBio: [
      'Luca founded L3 Innovation and closely followed the development of its debt-relief software. Today he leads Ovia with a simple idea: start from the real process of the people doing the work, put data security first, and use artificial intelligence only where it produces a measurable result.',
    ],
    citazione: 'We don’t sell artificial intelligence. We take out of people’s work everything that doesn’t need a person.',
    fotoAlt: 'Luca Lorenzo, founder and CEO of Ovia',
    ctaH: 'Let’s start from your real work.',
    ctaP: 'Thirty minutes on your workflow: where the time goes, what can be safely automated and where it makes sense to begin.',
    ctaS: 'No obligation. We work with a few clients at a time.',
  },
};

const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

const CSS = `<style id="cs-css">
.cs-story{display:grid;grid-template-columns:1.2fr .8fr;gap:48px;align-items:start;margin-top:8px}
.cs-story p{color:var(--muted);font-size:17px;line-height:1.7;margin-bottom:18px}
.cs-story p strong{color:var(--text)}
.cs-steps{list-style:none;margin:0;padding:0;border-left:1px solid var(--line-strong)}
.cs-steps li{position:relative;padding:0 0 26px 26px}
.cs-steps li:last-child{padding-bottom:0}
.cs-steps li::before{content:"";position:absolute;left:-5px;top:7px;width:9px;height:9px;border-radius:50%;background:var(--ink)}
.cs-steps li:last-child::before{background:var(--accent)}
.cs-steps h3{font-family:var(--font-display);font-size:17px;margin:0 0 6px;color:var(--text)}
.cs-steps p{font-size:15px;color:var(--muted);margin:0;line-height:1.55}
.cs-hero{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr);gap:clamp(28px,5vw,64px);align-items:center;padding:clamp(28px,5vw,56px) 0 clamp(36px,5vw,56px)}
.cs-hero .bl-hero{padding:0}
.cs-founder{max-width:820px}
.cs-photo{position:relative;background:none}
.cs-photo img{display:block;width:100%;height:auto;border-radius:var(--radius);background:var(--mist)}
.cs-hero .cs-photo{max-width:420px;justify-self:end;width:100%}
.cs-photo figcaption{padding-top:14px;margin-top:14px;border-top:1px solid var(--line);font-size:17px;font-weight:600;color:var(--ink);line-height:1.3}
.cs-photo figcaption span{display:block;font-weight:400;font-size:15px;color:var(--muted);margin-top:2px}
.cs-name{font-family:var(--font-display);font-size:clamp(30px,4vw,44px);font-weight:700;letter-spacing:-.02em;line-height:1.05;margin:6px 0 6px}
.cs-role{color:var(--accent);font-weight:600;font-size:15px;letter-spacing:.04em;margin-bottom:22px}
.cs-founder p.bio{color:var(--muted);font-size:17px;line-height:1.7;margin-bottom:22px}
.cs-quote{margin:0;padding:18px 0 18px 22px;border-left:3px solid var(--ink);font-family:var(--font-display);font-size:clamp(18px,2.2vw,22px);line-height:1.4;color:var(--text)}
@media (max-width:860px){.cs-story,.cs-hero{grid-template-columns:1fr}.cs-hero .cs-photo{justify-self:start;max-width:340px}}
</style>`;

function pagina(lang) {
  const t = T[lang], u = UI[lang], P = x => pathFor(lang, x);
  const url = SITE.url + ALT[lang];
  const org = {
    '@type': 'Organization', '@id': SITE.url + '/#organization', name: 'Ovia', url: SITE.url, email: SITE.email,
    legalName: 'L3 Innovation Srl', vatID: 'IT02882330901',
    parentOrganization: { '@type': 'Organization', name: 'L3 Innovation Srl' },
    foundingLocation: { '@type': 'Place', name: 'Olbia, Italia' },
    founder: { '@id': SITE.url + '/chi-siamo.html#luca-lorenzo' },
    sameAs: ['https://www.linkedin.com/company/oviaitalia'],
  };
  const person = {
    '@type': 'Person', '@id': SITE.url + '/chi-siamo.html#luca-lorenzo', name: 'Luca Lorenzo',
    jobTitle: lang === 'en' ? 'Founder and CEO' : 'Fondatore e CEO', image: SITE.url + FOTO.jpg,
    worksFor: { '@id': SITE.url + '/#organization' },
  };
  const jsonld = [{ '@context': 'https://schema.org', '@graph': [
    { '@type': 'AboutPage', '@id': url + '#webpage', url, name: t.title.replace(/\s*\|\s*Ovia$/, ''), description: t.desc, inLanguage: lang === 'en' ? 'en' : 'it-IT', about: { '@id': SITE.url + '/#organization' } },
    org, person,
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: u.home, item: SITE.url + P('/') },
      { '@type': 'ListItem', position: 2, name: t.crumb, item: url } ] },
  ] }];

  const stats = t.stats.map(([b, d]) => `<div class="sv-stat rv"><div class="big">${esc(b)}</div><div class="desc">${esc(d)}</div></div>`).join('');
  const tappe = t.tappe.map(([h, p]) => `<li><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('');
  const valori = t.valori.map(([h, p, lab, w, tool], i) => `<div class="ov-card sv-pillar rv${tool ? ' is-tool' : ''}"><span class="num">0${i + 1}</span><h3>${esc(h)}</h3><p>${esc(p)}</p><div class="weight"><i data-weight="${w}"></i></div><div class="weight-label">${esc(lab)}</div></div>`).join('');

  return head({ title: t.title, description: t.desc, path: '/chi-siamo.html', lang, alt: ALT, type: 'website', jsonld, extra: CSS }) + header('chi-siamo', lang, ALT) + `
<main>
  <div class="ov-wrap">
    <nav class="ov-breadcrumb" aria-label="${u.breadcrumb}"><a href="${P('/')}">${u.home}</a><span>/</span>${t.crumb}</nav>
    <div class="cs-hero">
      <section class="bl-hero">
        <p class="ov-eyebrow">${t.ey}</p>
        <h1>${esc(t.h1)}</h1>
        <p class="ov-lead">${esc(t.lead)}</p>
      </section>
      <figure class="cs-photo" style="margin:0">
        <picture>
          <source srcset="${FOTO.webp}" type="image/webp">
          <img src="${FOTO.jpg}" alt="${esc(t.fotoAlt)}" width="${FOTO.w}" height="${FOTO.h}" fetchpriority="high" decoding="async">
        </picture>
        <figcaption>${esc(t.fondNome)}<span>${esc(t.fondRuolo)}</span></figcaption>
      </figure>
    </div>
    <div class="sv-stats">${stats}</div>
  </div>

  <section class="ov-section"><div class="ov-wrap">
    <div class="rv"><p class="ov-eyebrow">${t.storiaEy}</p><h2 class="ov-h2">${esc(t.storiaH)}</h2></div>
    <div class="cs-story">
      <div class="rv">${t.storia.map(p => `<p>${md(p)}</p>`).join('')}</div>
      <ol class="cs-steps rv">${tappe}</ol>
    </div>
  </div></section>

  <section class="ov-section" style="padding-top:0"><div class="ov-wrap">
    <div class="rv"><p class="ov-eyebrow">${t.valoriEy}</p><h2 class="ov-h2">${esc(t.valoriH)}</h2><p class="ov-lead">${esc(t.valoriLead)}</p></div>
    <div class="sv-pillars">${valori}</div>
  </div></section>

  <section class="ov-section" id="fondatore" style="padding-top:0"><div class="ov-wrap">
    <div class="cs-founder">
      <div class="rv">
        <p class="ov-eyebrow">${t.fondEy}</p>
        <h2 class="cs-name">${esc(t.fondNome)}</h2>
        <p class="cs-role">${esc(t.fondRuolo)}</p>
        ${t.fondBio.map(p => `<p class="bio">${md(p)}</p>`).join('')}
        <blockquote class="cs-quote">“${esc(t.citazione)}”</blockquote>
      </div>
    </div>
  </div></section>

  <section class="ov-section" style="padding-top:0"><div class="ov-narrow"><div class="ov-cta-band rv">
    <p class="ov-eyebrow">Ovia Process Check</p>
    <h2>${esc(t.ctaH)}</h2>
    <p>${esc(t.ctaP)}</p>
    ${calBtn(u.cta)}
    <p class="small">${esc(t.ctaS)}</p>
  </div></div></section>
</main>` + footer(lang);
}

export function buildChiSiamo() {
  mkdirSync(ROOT + 'en', { recursive: true });
  writeFileSync(ROOT + 'chi-siamo.html', pagina('it'));
  writeFileSync(ROOT + 'en/about.html', pagina('en'));
}
