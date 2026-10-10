// Blocchi condivisi del linguaggio "pallino in attesa", usati da tutte le pagine generate.
// Il pallino blu segna sempre e solo il punto in cui decide una persona.
// L'interattività è in assets/ovia-pages.js (data-hx-cta, data-mf, data-pipe).
import { prodottiIn } from '../../data/prodotti.mjs';
import { SERVIZI } from '../../data/servizi.mjs';
import { SERVIZI_EN } from '../../data/en/servizi.mjs';
import { esc, calBtn, urlIn } from './layout.mjs';
import { UI, pathFor } from './i18n.mjs';

// Il primo passaggio con "human" nei contenuti del servizio: dove interviene la persona.
export const humanOf = (lang, id) => {
  const d = (lang === 'en' ? SERVIZI_EN : SERVIZI)[id];
  const m = d && JSON.stringify(d).match(/"human":"((?:[^"\\]|\\.)*)"/);
  return m ? JSON.parse(`"${m[1]}"`) : '';
};

// Banda di chiusura: il pallino aspetta il visitatore (tienilo premuto per prenotare).
// h e p arrivano già pronti in HTML (possono contenere <br>): il chiamante li escapa.
export function ctaBand(lang, { h, p, small = '', tag = '', ghost = true, id = '' }) {
  const u = UI[lang];
  return `<div class="ov-cta-band hx-cta"${id ? ` id="${id}"` : ''}>
    <div class="hx-cta-side"><button type="button" class="hx-cta-dot" data-hx-cta aria-label="${esc(u.cta)}"></button><p>${esc(u.ctaHold)}</p></div>
    <div>
      <p class="hx-cta-tag">${esc(tag || u.ctaTag)}</p>
      <h2>${h}</h2>
      <p>${p}</p>
      <div class="hm-ctas">${calBtn(u.cta)}${ghost ? `<button type="button" class="ov-btn-ghost js-concierge">${esc(u.talk)}</button>` : ''}</div>
      ${small ? `<p class="small">${small}</p>` : ''}
    </div>
  </div>`;
}

// Manifesto: frase grande che si "accende" parola per parola con lo scroll.
// {dot} = il pallino del logo; _parola_ = parola in blu.
export function manifesto(text, sub = '', label = '') {
  // parole _così_ consecutive diventano un'unica etichetta ("in attesa")
  const toks = [];
  for (const w of text.split(' ')) {
    const em = /^_.+_$/.test(w), last = toks[toks.length - 1];
    if (em && last && last.em) last.t += ' ' + w.slice(1, -1);
    else toks.push({ t: em ? w.slice(1, -1) : w, em });
  }
  const words = toks.map(({ t, em }) => t === '{dot}'
    ? '<span class="mf-dot" aria-hidden="true"></span>'
    : `<span class="mf-w${em ? ' mf-em' : ''}">${esc(t)}</span>`).join(' ');
  return `<section class="mf is-blue" data-mf${label ? ` aria-label="${esc(label)}"` : ''}><div class="ov-wrap">
    <p class="mf-text">${words}</p>
    ${sub ? `<p class="mf-sub">${esc(sub)}</p>` : ''}
  </div></section>`;
}

// I servizi in due colonne (Marketing / Automazione), ognuno con il suo punto di controllo umano.
const MARKETING = ['siti-web-ai', 'lead-generation'];
const AUTOMAZIONE = ['second-brain', 'inbox', 'chiamate', 'documenti', 'crm'];
const SYS = {
  it: { mkH: 'Marketing', mkGoal: 'Portare nuovi clienti, in modo misurabile.', auH: 'Automazione', auGoal: 'Togliere il lavoro ripetitivo e riprendere il controllo.', open: 'Scopri',
    landings: [['/siti-studi-professionali.html', 'Siti per studi professionali', 'Il sito che porta consulenze e prenota al posto tuo.'], ['/siti-attivita-locali.html', 'Siti per attività locali', 'Il sito che porta tavoli, clienti e prenotazioni.']] },
  en: { mkH: 'Marketing', mkGoal: 'Bring in new clients, measurably.', auH: 'Automation', auGoal: 'Remove repetitive work and take back control.', open: 'Explore',
    landings: [['/siti-studi-professionali.html', 'Websites for professional firms', 'The website that brings in consultations and books them for you.'], ['/siti-attivita-locali.html', 'Websites for local businesses', 'The website that brings in tables, clients and bookings.']] },
};
export function sistemi(lang, { exclude = '', landings = true } = {}) {
  const t = SYS[lang], byId = Object.fromEntries(prodottiIn(lang).map(p => [p.id, p]));
  const check = id => { const h = humanOf(lang, id); return h ? `<small class="hx-check">${esc(h)}</small>` : ''; };
  const svc = ids => ids.filter(id => id !== exclude).map(id => byId[id]).map(p => `<li><a href="${urlIn(lang, p.id)}"><strong>${esc(p.name)}</strong><span>${esc(p.tagline)}</span>${check(p.id)}<em>${t.open}</em></a></li>`).join('');
  const land = landings ? t.landings.map(([path, n, d]) => `<li><a href="${pathFor(lang, path)}"><strong>${esc(n)}</strong><span>${esc(d)}</span><em>${t.open}</em></a></li>`).join('') : '';
  return `<div class="hm-sys">
      <div id="siti-web"><h3>${esc(t.mkH)}</h3><p class="goal">${esc(t.mkGoal)}</p><ul class="hm-svc">${svc(MARKETING)}${land}</ul></div>
      <div><h3>${esc(t.auH)}</h3><p class="goal">${esc(t.auGoal)}</p><ul class="hm-svc">${svc(AUTOMAZIONE)}</ul></div>
    </div>`;
}

// Il flusso di un servizio come pipeline verticale: scorre da solo e si ferma sul pallino.
export function pipeline(lang, name, flow) {
  const u = UI[lang];
  const me = flow.find(f => f.human);
  return `<div class="hx-stage pp" data-pipe aria-label="${esc(name)}">
    <div class="hx-bar"><span>${esc(name)}</span><span class="hx-n" data-pipe-st data-run="${esc(u.pipeRun)}" data-wait="${esc(u.pipeWait)}" data-done="${esc(u.pipeDone)}">${esc(u.pipeWait)}</span></div>
    <ol class="pp-list">${flow.map(f => `<li${f.human ? ' class="me"' : ''}><i></i><div><strong>${esc(f.t)}</strong><span>${esc(f.h)}</span></div></li>`).join('')}</ol>
    <div class="pp-foot">${me ? `<small class="hx-check">${esc(me.human)}</small>` : ''}<button type="button" class="sx-hold" data-pipe-hold hidden><i></i><span>${esc(u.approve)}</span></button></div>
  </div>`;
}
