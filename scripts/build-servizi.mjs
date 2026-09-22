// Genera /servizi/<id>.html e /servizi/index.html dai dati in /data.
import { writeFileSync, mkdirSync } from 'node:fs';
import { SITE, PRODOTTI, byId, urlOf } from '../data/prodotti.mjs';
import { SERVIZI, PILASTRI_BASE } from '../data/servizi.mjs';
import { FONTI } from '../data/fonti.mjs';
import { head, header, footer, esc, rich, calBtn, svgGlyph } from './lib/layout.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
mkdirSync(ROOT + 'servizi', { recursive: true });

function page(p, s) {
  const refs = [];
  const R = t => rich(t, refs);
  // registra prima le fonti delle statistiche, così la numerazione segue la lettura
  const statRef = k => k ? R(`[[${k}]]`) : '';

  const stats = s.stats.map(st => `<div class="sv-stat rv"><div class="big">${esc(st.big)}</div><div class="desc">${esc(st.desc)}${statRef(st.ref)}</div></div>`).join('');

  const problem = s.problem.paras.map(x => `<p class="ov-lead" style="margin-bottom:18px;max-width:none">${R(x)}</p>`).join('');

  const pillars = [
    ['01', 'Strategia', s.pillars.strategia, PILASTRI_BASE.strategia, 'Da dove partiamo'],
    ['02', 'Sicurezza', s.pillars.sicurezza, PILASTRI_BASE.sicurezza, 'Non negoziabile'],
    ['03', 'Intelligenza artificiale', s.pillars.ai, PILASTRI_BASE.ai, 'Lo strumento, non il fine'],
  ].map(([n, h, t, w, l], i) => `<div class="ov-card sv-pillar rv${i === 2 ? ' is-tool' : ''}"><span class="num">${n}</span><h3>${h}</h3><p>${R(t)}</p><div class="weight"><i data-weight="${w}"></i></div><div class="weight-label">${l}</div></div>`).join('');

  const flowSteps = s.flow.map((f, i) => `<button class="sv-flow-step" role="tab" id="fs-${i}" aria-controls="fp-${i}" aria-selected="${i === 0}"><span class="n">${i + 1}</span>${esc(f.t)}</button>`).join('');
  const flowPanels = s.flow.map((f, i) => `<div data-flow-panel id="fp-${i}" role="tabpanel" aria-labelledby="fs-${i}"${i ? ' hidden' : ''}><div class="tag">Passo ${i + 1} di ${s.flow.length} · ${esc(f.t)}</div><h3>${esc(f.h)}</h3><p>${R(f.p)}</p>${f.human ? `<span class="human">✓ ${esc(f.human)}</span>` : ''}</div>`).join('');

  const inputs = s.calc.inputs.map(inp => {
    const id = `c-${p.id}-${inp.name}`;
    return `<div class="sv-field"><label for="${id}">${esc(inp.label)} <output for="${id}"></output></label><input class="sv-range" type="range" id="${id}" name="${inp.name}" min="${inp.min}" max="${inp.max}" step="${inp.step}" value="${inp.value}"${inp.prefix ? ` data-prefix="${esc(inp.prefix)}"` : ''}${inp.suffix ? ` data-suffix="${esc(inp.suffix)}"` : ''}>${inp.hint ? `<div class="hint">${esc(inp.hint)}</div>` : ''}</div>`;
  }).join('');

  const ba = s.before.map((b, i) => `<li data-prima="${esc(b)}" data-dopo="${esc(s.after[i])}">${esc(b)}</li>`).join('');
  const sec = s.security.map(x => `<div class="sv-sec-item rv"><span class="ic">✓</span><div><h4>${esc(x.h)}</h4><p>${R(x.p)}</p></div></div>`).join('');
  const tabs = s.audiences.map((a, i) => `<button role="tab" aria-selected="${i === 0}" aria-controls="tp-${i}" id="tt-${i}">${esc(a.tab)}</button>`).join('');
  const tabPanels = s.audiences.map((a, i) => `<div class="ov-card sv-tabpanel" role="tabpanel" id="tp-${i}" aria-labelledby="tt-${i}"${i ? ' hidden' : ''}><h3>${esc(a.h)}</h3><p>${esc(a.p)}</p><ul>${a.items.map(x => `<li>${esc(x)}</li>`).join('')}</ul>${a.link ? `<p style="margin:18px 0 0"><a class="ov-btn-ghost" href="${a.link.href}">${esc(a.link.label)}</a></p>` : ''}</div>`).join('');
  const tl = s.timeline.map(t => `<div class="sv-tl rv"><div class="when">${esc(t.when)}</div><h4>${esc(t.h)}</h4><p>${esc(t.p)}</p></div>`).join('');
  const faq = s.faq.map((f, i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(f.q)}</summary><div class="ans"><p>${esc(f.a)}</p></div></details>`).join('');

  const others = PRODOTTI.filter(o => o.id !== p.id).map(o => `<a class="ov-card ov-svc-card rv" href="${urlOf(o.id)}">${svgGlyph(o.glyph)}<span class="k">${esc(o.kicker)}</span><h3>${esc(o.name)}</h3><p>${esc(o.pitch)}</p><span class="go">Scopri →</span></a>`).join('');

  // fonti: tutte quelle citate, nell'ordine di citazione, più eventuali extra dichiarate
  (s.sources || []).forEach(k => { if (!refs.includes(k)) refs.push(k); });
  const sources = refs.map((k, i) => `<li id="fonte-${i + 1}"><a href="${esc(FONTI[k].u)}" target="_blank" rel="noopener">${esc(FONTI[k].t)}</a></li>`).join('');

  const jsonld = [
    { '@context': 'https://schema.org', '@type': 'Service', name: p.name, serviceType: p.short, description: s.metaDesc, url: SITE.url + urlOf(p.id), areaServed: 'IT', provider: { '@type': 'Organization', name: 'Ovia', url: SITE.url, email: SITE.email } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url + '/' },
      { '@type': 'ListItem', position: 2, name: 'Servizi', item: SITE.url + '/servizi/' },
      { '@type': 'ListItem', position: 3, name: p.name, item: SITE.url + urlOf(p.id) } ] },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: s.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ];

  const idx = PRODOTTI.findIndex(o => o.id === p.id);

  return head({ title: s.metaTitle, description: s.metaDesc, path: urlOf(p.id), jsonld }) + header(p.id) + `
<main>
  <div class="ov-wrap">
    <nav class="ov-breadcrumb" aria-label="Percorso"><a href="/">Home</a><span>/</span><a href="/servizi/">Servizi</a><span>/</span>${esc(p.name)}</nav>
    <section class="sv-hero">
      <div>
        <p class="ov-eyebrow">${idx === 0 ? '★ ' : String(idx).padStart(2, '0') + ' — '}${esc(p.kicker)}</p>
        <h1>${esc(p.name)}</h1>
        <p class="claim">${esc(s.claim)}</p>
        <p class="sub">${esc(s.sub)}</p>
        <div class="sv-hero-ctas">${calBtn()}<a class="ov-btn-ghost" href="#come-funziona">Come funziona ↓</a></div>
      </div>
      <div class="sv-hero-visual" aria-hidden="true"><div class="halo"></div>${svgGlyph(p.glyph)}</div>
    </section>
    <div class="sv-stats">${stats}</div>
  </div>

  <section class="ov-section"><div class="ov-narrow rv">
    <p class="ov-eyebrow">Il problema</p>
    <h2 class="ov-h2">${esc(s.problem.title)}</h2>
    ${problem}
  </div></section>

  <section class="ov-section" style="padding-top:0"><div class="ov-wrap">
    <div class="ov-center rv"><p class="ov-eyebrow">Cosa ci distingue</p>
    <h2 class="ov-h2">Strategia e sicurezza fanno guadagnare.<br>L’AI è lo strumento.</h2>
    <p class="ov-lead">Chiunque oggi può comprare un abbonamento a un tool AI. Il valore sta nel decidere cosa automatizzare, come proteggere i dati dei tuoi clienti e come misurare il risultato. È da lì che partiamo, sempre.</p></div>
    <div class="sv-pillars">${pillars}</div>
  </div></section>

  <section class="ov-section" id="come-funziona" style="padding-top:0"><div class="ov-wrap">
    <div class="rv"><p class="ov-eyebrow">Come funziona</p><h2 class="ov-h2">${esc(p.tagline)}</h2><p class="ov-lead">Clicca ogni passaggio per vedere cosa succede. Il sistema propone, tu decidi.</p></div>
    <div class="sv-flow" data-flow>
      <div class="sv-flow-steps" role="tablist" aria-label="Passaggi">${flowSteps}</div>
      <div class="ov-card sv-flow-panel">${flowPanels}<div class="sv-flow-progress"><i></i></div></div>
    </div>
  </div></section>

  <section class="ov-section" style="padding-top:0"><div class="ov-wrap">
    <div class="rv"><p class="ov-eyebrow">Calcolatore</p><h2 class="ov-h2">${esc(s.calc.title)}</h2><p class="ov-lead">${esc(s.calc.intro)}</p></div>
    <div class="sv-calc" data-calc="${p.id}">
      <div class="ov-card">${inputs}</div>
      <div class="ov-card sv-result" aria-live="polite"><div data-calc-out></div><p class="note">Stima indicativa basata su 220 giorni lavorativi e ipotesi prudenti. Nel Process Check la sostituiamo con i numeri reali del tuo flusso.</p>${calBtn('Verifica i tuoi numeri nel Process Check', '', true)}</div>
    </div>
  </div></section>

  <section class="ov-section" style="padding-top:0"><div class="ov-wrap sv-ba" data-state="prima">
    <div class="rv"><p class="ov-eyebrow">Prima e dopo</p><h2 class="ov-h2">La stessa giornata, due modi di viverla.</h2></div>
    <div class="sv-toggle" role="group" aria-label="Confronto"><button data-state="prima" aria-pressed="true">Oggi</button><button data-state="dopo" aria-pressed="false">Con ${esc(p.name)}</button></div>
    <ul class="sv-ba-list">${ba}</ul>
  </div></section>

  <section class="ov-section" style="padding-top:0"><div class="ov-wrap">
    <div class="rv"><p class="ov-eyebrow">Sicurezza</p><h2 class="ov-h2">Il segreto professionale non è negoziabile.</h2><p class="ov-lead">Le misure che applichiamo a ${esc(p.name)} fin dal primo giorno, non come aggiunta finale.</p></div>
    <div class="sv-sec">${sec}</div>
  </div></section>

  <section class="ov-section" style="padding-top:0"><div class="ov-wrap" data-tabs>
    <div class="rv"><p class="ov-eyebrow">Per chi è</p><h2 class="ov-h2">Costruito sul tuo modo di lavorare.</h2></div>
    <div class="sv-tabs" role="tablist" aria-label="Settori">${tabs}</div>
    ${tabPanels}
  </div></section>

  <section class="ov-section" style="padding-top:0"><div class="ov-wrap">
    <div class="rv"><p class="ov-eyebrow">Il percorso</p><h2 class="ov-h2">Dal Process Check al primo risultato misurabile.</h2><p class="ov-lead">Un’area alla volta, sotto il tuo controllo. Nessuna trasformazione improvvisa.</p></div>
    <div class="sv-timeline">${tl}</div>
  </div></section>

  <section class="ov-section" style="padding-top:0"><div class="ov-narrow">
    <div class="rv"><p class="ov-eyebrow">Domande frequenti</p><h2 class="ov-h2">Le domande che ci fanno davvero.</h2></div>
    <div class="ov-faq">${faq}</div>
  </div></section>

  <section class="ov-section" style="padding-top:0"><div class="ov-wrap">
    <div class="ov-cta-band rv">
      <p class="ov-eyebrow">Ovia Process Check</p>
      <h2>Trenta minuti sul tuo flusso reale.<br>Poi decidi tu.</h2>
      <p>Ti mostriamo dove va il tempo, cosa si può automatizzare in sicurezza e da dove conviene partire con ${esc(p.name)}. Nessun impegno, nessun gergo tecnico.</p>
      ${calBtn()}
      <p class="small">Lavoriamo con pochi clienti alla volta. Rispondiamo entro 24 ore.</p>
    </div>
  </div></section>

  <section class="ov-section" style="padding-top:0"><div class="ov-wrap">
    <div class="rv"><p class="ov-eyebrow">Gli altri sistemi Ovia</p><h2 class="ov-h2">Ogni sistema ne alimenta un altro.</h2></div>
    <div class="ov-grid-3" style="margin-top:28px">${others}</div>
    <div class="ov-sources"><h4>Fonti</h4><ol>${sources}</ol></div>
  </div></section>
</main>` + footer();
}

function hub() {
  const cards = PRODOTTI.map((p, i) => `<a class="ov-card ov-svc-card rv" href="${urlOf(p.id)}">${svgGlyph(p.glyph)}<span class="k">${i === 0 ? '★ ' : String(i).padStart(2, '0') + ' — '}${esc(p.kicker)}</span><h3>${esc(p.name)}</h3><p>${esc(p.pitch)}</p><span class="go">Scopri ${esc(p.short)} →</span></a>`).join('');
  const jsonld = [{ '@context': 'https://schema.org', '@type': 'ItemList', name: 'Servizi Ovia', itemListElement: PRODOTTI.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: SITE.url + urlOf(p.id), name: p.name })) }];
  return head({ title: 'Servizi Ovia — sistemi AI su misura, progettati su strategia e sicurezza', description: 'Second Brain, Inbox, Lead Generation, Chiamate, Documenti, Siti Web per le AI e CRM: sette sistemi su misura per studi professionali e PMI.', path: '/servizi/', jsonld }) + header('servizi') + `
<main><div class="ov-wrap">
  <nav class="ov-breadcrumb" aria-label="Percorso"><a href="/">Home</a><span>/</span>Servizi</nav>
  <section class="bl-hero">
    <p class="ov-eyebrow">I servizi Ovia</p>
    <h1>Sette sistemi. Un solo principio.</h1>
    <p class="ov-lead">${esc(SITE.positioning)} Ogni sistema Ovia nasce da una strategia scritta con te e da regole di sicurezza chiare. Poi, e solo poi, l’intelligenza artificiale lo mette al lavoro.</p>
    <div style="margin-top:28px">${calBtn()}</div>
  </section>
  <div class="ov-grid-3">${cards}</div>
  <section class="ov-section"><div class="ov-cta-band rv"><p class="ov-eyebrow">Da dove partire</p><h2>Non sai quale sistema ti serve? È normale.</h2><p>Il Process Check serve proprio a questo: capire qual è il problema che ti costa di più e se possiamo darti un risultato misurabile.</p>${calBtn()}</div></section>
</div></main>` + footer();
}

for (const p of PRODOTTI) {
  const s = SERVIZI[p.id];
  if (!s) throw new Error('Contenuto mancante per ' + p.id);
  writeFileSync(`${ROOT}servizi/${p.id}.html`, page(p, s));
}
writeFileSync(`${ROOT}servizi/index.html`, hub());
console.log(`✓ ${PRODOTTI.length} pagine servizio + hub generate`);
