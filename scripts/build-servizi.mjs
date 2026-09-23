// Genera le pagine servizio in italiano (/servizi/) e in inglese (/en/services/).
import { writeFileSync, mkdirSync } from 'node:fs';
import { SITE, prodottiIn, urlOf } from '../data/prodotti.mjs';
import { SERVIZI, PILASTRI_BASE } from '../data/servizi.mjs';
import { SERVIZI_EN } from '../data/en/servizi.mjs';
import { FONTI } from '../data/fonti.mjs';
import { FONTI_EN } from '../data/en/fonti.mjs';
import { head, header, footer, esc, rich, calBtn, svgGlyph, urlIn } from './lib/layout.mjs';
import { UI, pathFor } from './lib/i18n.mjs';

const ROOT = new URL('..', import.meta.url).pathname;

const T = {
  it: {
    services: 'Servizi', flagship: '★ ', pillars: [['Strategia', 'Da dove partiamo'], ['Sicurezza', 'Non negoziabile'], ['Intelligenza artificiale', 'Lo strumento, non il fine']],
    how: 'Come funziona ↓', problem: 'Il problema', distinct: 'Cosa ci distingue', distinctH: 'Strategia e sicurezza fanno guadagnare.<br>L’AI è lo strumento.',
    distinctP: 'Chiunque oggi può comprare un abbonamento a un tool AI. Il valore sta nel decidere cosa automatizzare, come proteggere i dati dei tuoi clienti e come misurare il risultato. È da lì che partiamo, sempre.',
    howEy: 'Come funziona', howP: 'Clicca ogni passaggio per vedere cosa succede. Il sistema propone, tu decidi.', step: (i, n) => `Passo ${i} di ${n}`, steps: 'Passaggi',
    calcEy: 'Calcolatore', calcNote: 'Stima indicativa basata su 220 giorni lavorativi e ipotesi prudenti. Nel Process Check la sostituiamo con i numeri reali del tuo flusso.', calcBtn: 'Verifica i tuoi numeri nel Process Check',
    baEy: 'Prima e dopo', baH: 'La stessa giornata, due modi di viverla.', today: 'Oggi', with: n => `Con ${n}`, compare: 'Confronto',
    secEy: 'Sicurezza', secH: 'Il segreto professionale non è negoziabile.', secP: n => `Le misure che applichiamo a ${n} fin dal primo giorno, non come aggiunta finale.`,
    forEy: 'Per chi è', forH: 'Costruito sul tuo modo di lavorare.', sectors: 'Settori',
    pathEy: 'Il percorso', pathH: 'Dal Process Check al primo risultato misurabile.', pathP: 'Un’area alla volta, sotto il tuo controllo. Nessuna trasformazione improvvisa.',
    faqEy: 'Domande frequenti', faqH: 'Le domande che ci fanno davvero.',
    ctaH: 'Trenta minuti sul tuo flusso reale.<br>Poi decidi tu.', ctaP: n => `Ti mostriamo dove va il tempo, cosa si può automatizzare in sicurezza e da dove conviene partire con ${n}. Nessun impegno, nessun gergo tecnico.`, ctaSmall: 'Lavoriamo con pochi clienti alla volta. Rispondiamo entro 24 ore.',
    othersEy: 'Gli altri sistemi Ovia', othersH: 'Ogni sistema ne alimenta un altro.', discover: 'Scopri →', discoverN: s => `Scopri ${s} →`, sources: 'Fonti',
    hub: { title: 'Servizi Ovia — sistemi AI su misura, progettati su strategia e sicurezza', desc: 'Second Brain, Inbox, Lead Generation, Chiamate, Documenti, Siti Web per le AI e CRM: sette sistemi su misura per studi professionali e PMI.', ey: 'I servizi Ovia', h1: 'Sette sistemi. Un solo principio.', lead: 'Ogni sistema Ovia nasce da una strategia scritta con te e da regole di sicurezza chiare. Poi, e solo poi, l’intelligenza artificiale lo mette al lavoro.', startEy: 'Da dove partire', startH: 'Non sai quale sistema ti serve? È normale.', startP: 'Il Process Check serve proprio a questo: capire qual è il problema che ti costa di più e se possiamo darti un risultato misurabile.', list: 'Servizi Ovia' },
  },
  en: {
    services: 'Services', flagship: '★ ', pillars: [['Strategy', 'Where we start'], ['Security', 'Non-negotiable'], ['Artificial intelligence', 'The tool, not the goal']],
    how: 'How it works ↓', problem: 'The problem', distinct: 'What sets us apart', distinctH: 'Strategy and security make the money.<br>AI is the tool.',
    distinctP: 'Anyone today can buy a subscription to an AI tool. The value lies in deciding what to automate, how to protect your clients’ data and how to measure the result. That’s where we always start.',
    howEy: 'How it works', howP: 'Click each step to see what happens. The system proposes, you decide.', step: (i, n) => `Step ${i} of ${n}`, steps: 'Steps',
    calcEy: 'Calculator', calcNote: 'Indicative estimate based on 220 working days and conservative assumptions. In the Process Check we replace it with your real numbers.', calcBtn: 'Check your numbers in the Process Check',
    baEy: 'Before and after', baH: 'The same day, two ways to live it.', today: 'Today', with: n => `With ${n}`, compare: 'Comparison',
    secEy: 'Security', secH: 'Professional secrecy is not negotiable.', secP: n => `The measures we apply to ${n} from day one, not as an afterthought.`,
    forEy: 'Who it’s for', forH: 'Built around the way you work.', sectors: 'Sectors',
    pathEy: 'The path', pathH: 'From Process Check to the first measurable result.', pathP: 'One area at a time, under your control. No sudden transformations.',
    faqEy: 'FAQ', faqH: 'The questions people really ask us.',
    ctaH: 'Thirty minutes on your real workflow.<br>Then you decide.', ctaP: n => `We show you where the time goes, what can be safely automated and where it’s best to start with ${n}. No obligation, no jargon.`, ctaSmall: 'We work with a few clients at a time. We reply within 24 hours.',
    othersEy: 'The other Ovia systems', othersH: 'Each system feeds another.', discover: 'Learn more →', discoverN: s => `Discover ${s} →`, sources: 'Sources',
    hub: { title: 'Ovia services — tailor-made AI systems built on strategy and security', desc: 'Second Brain, Inbox, Lead Generation, Calls, Documents, AI-Ready Websites and CRM: seven tailor-made systems for professional firms and SMEs.', ey: 'Ovia services', h1: 'Seven systems. One principle.', lead: 'Every Ovia system starts from a strategy written with you and clear security rules. Then, and only then, artificial intelligence puts it to work.', startEy: 'Where to start', startH: 'Not sure which system you need? That’s normal.', startP: 'That’s exactly what the Process Check is for: finding out which problem costs you most and whether we can deliver a measurable result.', list: 'Ovia services' },
  },
};

function page(p, s, lang) {
  const t = T[lang], u = UI[lang], refs = [], P = x => pathFor(lang, x);
  const R = x => rich(x, refs, lang);
  const fontiT = k => (lang === 'en' ? FONTI_EN[k] : FONTI[k].t);
  const statRef = k => k ? R(`[[${k}]]`) : '';
  const prods = prodottiIn(lang);
  const idx = prods.findIndex(o => o.id === p.id);
  const itP = urlOf(p.id), alt = { it: itP, en: pathFor('en', itP) };

  const stats = s.stats.map(st => `<div class="sv-stat rv"><div class="big">${esc(st.big)}</div><div class="desc">${esc(st.desc)}${statRef(st.ref)}</div></div>`).join('');
  const problem = s.problem.paras.map(x => `<p class="ov-lead" style="margin-bottom:18px;max-width:none">${R(x)}</p>`).join('');
  const pillars = [[s.pillars.strategia, PILASTRI_BASE.strategia], [s.pillars.sicurezza, PILASTRI_BASE.sicurezza], [s.pillars.ai, PILASTRI_BASE.ai]]
    .map(([txt, w], i) => `<div class="ov-card sv-pillar rv${i === 2 ? ' is-tool' : ''}"><span class="num">0${i + 1}</span><h3>${t.pillars[i][0]}</h3><p>${R(txt)}</p><div class="weight"><i data-weight="${w}"></i></div><div class="weight-label">${t.pillars[i][1]}</div></div>`).join('');
  const flowSteps = s.flow.map((f, i) => `<button class="sv-flow-step" role="tab" id="fs-${i}" aria-controls="fp-${i}" aria-selected="${i === 0}"><span class="n">${i + 1}</span>${esc(f.t)}</button>`).join('');
  const flowPanels = s.flow.map((f, i) => `<div data-flow-panel id="fp-${i}" role="tabpanel" aria-labelledby="fs-${i}"${i ? ' hidden' : ''}><div class="tag">${t.step(i + 1, s.flow.length)} · ${esc(f.t)}</div><h3>${esc(f.h)}</h3><p>${R(f.p)}</p>${f.human ? `<span class="human">✓ ${esc(f.human)}</span>` : ''}</div>`).join('');
  const inputs = s.calc.inputs.map(inp => {
    const id = `c-${p.id}-${inp.name}`;
    return `<div class="sv-field"><label for="${id}">${esc(inp.label)} <output for="${id}"></output></label><input class="sv-range" type="range" id="${id}" name="${inp.name}" min="${inp.min}" max="${inp.max}" step="${inp.step}" value="${inp.value}"${inp.prefix ? ` data-prefix="${esc(inp.prefix)}"` : ''}${inp.suffix ? ` data-suffix="${esc(inp.suffix)}"` : ''}>${inp.hint ? `<div class="hint">${esc(inp.hint)}</div>` : ''}</div>`;
  }).join('');
  const ba = s.before.map((b, i) => `<li data-prima="${esc(b)}" data-dopo="${esc(s.after[i])}">${esc(b)}</li>`).join('');
  const sec = s.security.map(x => `<div class="sv-sec-item rv"><span class="ic">✓</span><div><h4>${esc(x.h)}</h4><p>${R(x.p)}</p></div></div>`).join('');
  const tabs = s.audiences.map((a, i) => `<button role="tab" aria-selected="${i === 0}" aria-controls="tp-${i}" id="tt-${i}">${esc(a.tab)}</button>`).join('');
  const tabPanels = s.audiences.map((a, i) => `<div class="ov-card sv-tabpanel" role="tabpanel" id="tp-${i}" aria-labelledby="tt-${i}"${i ? ' hidden' : ''}><h3>${esc(a.h)}</h3><p>${esc(a.p)}</p><ul>${a.items.map(x => `<li>${esc(x)}</li>`).join('')}</ul>${a.link ? `<p style="margin:18px 0 0"><a class="ov-btn-ghost" href="${a.link.href}">${esc(a.link.label)}</a></p>` : ''}</div>`).join('');
  const tl = s.timeline.map(x => `<div class="sv-tl rv"><div class="when">${esc(x.when)}</div><h4>${esc(x.h)}</h4><p>${esc(x.p)}</p></div>`).join('');
  const faq = s.faq.map((f, i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(f.q)}</summary><div class="ans"><p>${esc(f.a)}</p></div></details>`).join('');
  const others = prods.filter(o => o.id !== p.id).map(o => `<a class="ov-card ov-svc-card rv" href="${urlIn(lang, o.id)}">${svgGlyph(o.glyph)}<span class="k">${esc(o.kicker)}</span><h3>${esc(o.name)}</h3><p>${esc(o.pitch)}</p><span class="go">${t.discover}</span></a>`).join('');
  (s.sources || []).forEach(k => { if (!refs.includes(k)) refs.push(k); });
  const sources = refs.map((k, i) => `<li id="fonte-${i + 1}"><a href="${esc(FONTI[k].u)}" target="_blank" rel="noopener">${esc(fontiT(k))}</a></li>`).join('');
  const self = SITE.url + P(itP);
  const jsonld = [
    { '@context': 'https://schema.org', '@type': 'Service', name: p.name, serviceType: p.short, description: s.metaDesc, url: self, areaServed: 'IT', inLanguage: lang, provider: { '@type': 'Organization', name: 'Ovia', url: SITE.url, email: SITE.email } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: u.home, item: SITE.url + P('/') },
      { '@type': 'ListItem', position: 2, name: t.services, item: SITE.url + P('/servizi/') },
      { '@type': 'ListItem', position: 3, name: p.name, item: self }] },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: s.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ];

  return head({ title: s.metaTitle, description: s.metaDesc, path: itP, lang, alt, jsonld }) + header(p.id, lang, alt) + `
<main>
  <div class="ov-wrap">
    <nav class="ov-breadcrumb" aria-label="${u.breadcrumb}"><a href="${P('/')}">${u.home}</a><span>/</span><a href="${P('/servizi/')}">${t.services}</a><span>/</span>${esc(p.name)}</nav>
    <section class="sv-hero">
      <div>
        <p class="ov-eyebrow">${idx === 0 ? t.flagship : String(idx).padStart(2, '0') + ' — '}${esc(p.kicker)}</p>
        <h1>${esc(p.name)}</h1>
        <p class="claim">${esc(s.claim)}</p>
        <p class="sub">${esc(s.sub)}</p>
        <div class="sv-hero-ctas">${calBtn(u.cta)}<a class="ov-btn-ghost" href="#come-funziona">${t.how}</a></div>
      </div>
      <div class="sv-hero-visual" aria-hidden="true"><div class="halo"></div>${svgGlyph(p.glyph)}</div>
    </section>
    <div class="sv-stats">${stats}</div>
  </div>

  <section class="ov-section"><div class="ov-narrow rv">
    <p class="ov-eyebrow">${t.problem}</p>
    <h2 class="ov-h2">${esc(s.problem.title)}</h2>
    ${problem}
  </div></section>

  <section class="ov-section" style="padding-top:0"><div class="ov-wrap">
    <div class="ov-center rv"><p class="ov-eyebrow">${t.distinct}</p>
    <h2 class="ov-h2">${t.distinctH}</h2>
    <p class="ov-lead">${t.distinctP}</p></div>
    <div class="sv-pillars">${pillars}</div>
  </div></section>

  <section class="ov-section" id="come-funziona" style="padding-top:0"><div class="ov-wrap">
    <div class="rv"><p class="ov-eyebrow">${t.howEy}</p><h2 class="ov-h2">${esc(p.tagline)}</h2><p class="ov-lead">${t.howP}</p></div>
    <div class="sv-flow" data-flow>
      <div class="sv-flow-steps" role="tablist" aria-label="${t.steps}">${flowSteps}</div>
      <div class="ov-card sv-flow-panel">${flowPanels}<div class="sv-flow-progress"><i></i></div></div>
    </div>
  </div></section>

  <section class="ov-section" style="padding-top:0"><div class="ov-wrap">
    <div class="rv"><p class="ov-eyebrow">${t.calcEy}</p><h2 class="ov-h2">${esc(s.calc.title)}</h2><p class="ov-lead">${esc(s.calc.intro)}</p></div>
    <div class="sv-calc" data-calc="${p.id}">
      <div class="ov-card">${inputs}</div>
      <div class="ov-card sv-result" aria-live="polite"><div data-calc-out></div><p class="note">${t.calcNote}</p>${calBtn(t.calcBtn, '', true)}</div>
    </div>
  </div></section>

  <section class="ov-section" style="padding-top:0"><div class="ov-wrap sv-ba" data-state="prima">
    <div class="rv"><p class="ov-eyebrow">${t.baEy}</p><h2 class="ov-h2">${t.baH}</h2></div>
    <div class="sv-toggle" role="group" aria-label="${t.compare}"><button data-state="prima" aria-pressed="true">${t.today}</button><button data-state="dopo" aria-pressed="false">${esc(t.with(p.name))}</button></div>
    <ul class="sv-ba-list">${ba}</ul>
  </div></section>

  <section class="ov-section" style="padding-top:0"><div class="ov-wrap">
    <div class="rv"><p class="ov-eyebrow">${t.secEy}</p><h2 class="ov-h2">${t.secH}</h2><p class="ov-lead">${esc(t.secP(p.name))}</p></div>
    <div class="sv-sec">${sec}</div>
  </div></section>

  <section class="ov-section" style="padding-top:0"><div class="ov-wrap" data-tabs>
    <div class="rv"><p class="ov-eyebrow">${t.forEy}</p><h2 class="ov-h2">${t.forH}</h2></div>
    <div class="sv-tabs" role="tablist" aria-label="${t.sectors}">${tabs}</div>
    ${tabPanels}
  </div></section>

  <section class="ov-section" style="padding-top:0"><div class="ov-wrap">
    <div class="rv"><p class="ov-eyebrow">${t.pathEy}</p><h2 class="ov-h2">${t.pathH}</h2><p class="ov-lead">${t.pathP}</p></div>
    <div class="sv-timeline">${tl}</div>
  </div></section>

  <section class="ov-section" style="padding-top:0"><div class="ov-narrow">
    <div class="rv"><p class="ov-eyebrow">${t.faqEy}</p><h2 class="ov-h2">${t.faqH}</h2></div>
    <div class="ov-faq">${faq}</div>
  </div></section>

  <section class="ov-section" style="padding-top:0"><div class="ov-wrap">
    <div class="ov-cta-band rv">
      <p class="ov-eyebrow">Ovia Process Check</p>
      <h2>${t.ctaH}</h2>
      <p>${esc(t.ctaP(p.name))}</p>
      ${calBtn(u.cta)}
      <p class="small">${t.ctaSmall}</p>
    </div>
  </div></section>

  <section class="ov-section" style="padding-top:0"><div class="ov-wrap">
    <div class="rv"><p class="ov-eyebrow">${t.othersEy}</p><h2 class="ov-h2">${t.othersH}</h2></div>
    <div class="ov-grid-3" style="margin-top:28px">${others}</div>
    <div class="ov-sources"><h4>${t.sources}</h4><ol>${sources}</ol></div>
  </div></section>
</main>` + footer(lang);
}

function hub(lang) {
  const t = T[lang], h = t.hub, u = UI[lang], P = x => pathFor(lang, x), prods = prodottiIn(lang);
  const alt = { it: '/servizi/', en: pathFor('en', '/servizi/') };
  const cards = prods.map((p, i) => `<a class="ov-card ov-svc-card rv" href="${urlIn(lang, p.id)}">${svgGlyph(p.glyph)}<span class="k">${i === 0 ? '★ ' : String(i).padStart(2, '0') + ' — '}${esc(p.kicker)}</span><h3>${esc(p.name)}</h3><p>${esc(p.pitch)}</p><span class="go">${esc(t.discoverN(p.short))}</span></a>`).join('');
  const jsonld = [{ '@context': 'https://schema.org', '@type': 'ItemList', name: h.list, itemListElement: prods.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: SITE.url + urlIn(lang, p.id), name: p.name })) }];
  return head({ title: h.title, description: h.desc, path: '/servizi/', lang, alt, jsonld }) + header('servizi', lang, alt) + `
<main><div class="ov-wrap">
  <nav class="ov-breadcrumb" aria-label="${u.breadcrumb}"><a href="${P('/')}">${u.home}</a><span>/</span>${t.services}</nav>
  <section class="bl-hero">
    <p class="ov-eyebrow">${h.ey}</p>
    <h1>${h.h1}</h1>
    <p class="ov-lead">${esc(u.positioning)} ${h.lead}</p>
    <div style="margin-top:28px">${calBtn(u.cta)}</div>
  </section>
  <div class="ov-grid-3">${cards}</div>
  <section class="ov-section"><div class="ov-cta-band rv"><p class="ov-eyebrow">${h.startEy}</p><h2>${h.startH}</h2><p>${h.startP}</p>${calBtn(u.cta)}</div></section>
</div></main>` + footer(lang);
}

for (const lang of ['it', 'en']) {
  const dir = ROOT + (lang === 'en' ? 'en/services/' : 'servizi/');
  mkdirSync(dir, { recursive: true });
  const data = lang === 'en' ? SERVIZI_EN : SERVIZI;
  for (const p of prodottiIn(lang)) {
    if (!data[p.id]) throw new Error(`Contenuto ${lang} mancante per ${p.id}`);
    writeFileSync(`${dir}${p.id}.html`, page(p, data[p.id], lang));
  }
  writeFileSync(dir + 'index.html', hub(lang));
}
console.log('✓ Pagine servizio IT + EN generate');
