// Layout condiviso (head, header, footer) per pagine servizio, FAQ e blog — IT e EN.
// Tutte le funzioni ricevono il percorso ITALIANO della pagina (itP) e la lingua:
// il percorso inglese e i link hreflang vengono calcolati da scripts/lib/i18n.mjs.
import { SITE, prodottiIn, urlOf } from '../../data/prodotti.mjs';
import { UI, pathFor, enPath } from './i18n.mjs';

export const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export const svgGlyph = (glyph, cls = '') => `<svg viewBox="0 0 88 88" aria-hidden="true" class="${cls}">${glyph}</svg>`;

export const urlIn = (lang, id) => pathFor(lang, urlOf(id));

export const calBtn = (label = SITE.cta, extra = '', sm = false) =>
  `<button type="button" class="ov-btn${sm ? ' sm' : ''} ${extra}" data-cal-link="${SITE.calLink}" data-cal-namespace="${SITE.calNamespace}" data-cal-config='{"layout":"month_view","theme":"dark"}'><span>${esc(label)}</span><span class="circ" aria-hidden="true">→</span></button>`;
export const ctaIn = lang => UI[lang].cta;

// altIt / altEn: percorsi delle due versioni (null = versione non disponibile)
export function head({ title, description, path, lang = 'it', type = 'website', jsonld = [], extra = '', alt }) {
  const u = UI[lang];
  const itP = alt ? alt.it : path;
  const enP = alt ? alt.en : enPath(path);
  const self = lang === 'en' ? enP : itP;
  const alts = [itP && `<link rel="alternate" hreflang="it" href="${SITE.url}${itP}">`, enP && `<link rel="alternate" hreflang="en" href="${SITE.url}${enP}">`, itP && `<link rel="alternate" hreflang="x-default" href="${SITE.url}${itP}">`].filter(Boolean).join('\n');
  return `<!doctype html>
<html lang="${u.htmlLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(SITE.url + self)}">
${itP && enP ? alts : ''}
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta name="theme-color" content="#04070f">
<meta property="og:type" content="${type}">
<meta property="og:url" content="${esc(SITE.url + self)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:locale" content="${u.locale}">
<meta property="og:site_name" content="Ovia">
<meta name="twitter:card" content="summary_large_image">
<link rel="alternate" type="application/rss+xml" title="Blog Ovia" href="${lang === 'en' ? '/en/blog/feed.xml' : '/blog/feed.xml'}">
<link rel="stylesheet" href="/assets/ovia-pages.css">
${jsonld.map(j => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`).join('\n')}
${extra}
</head>
<body>
<canvas id="ov-constellation" aria-hidden="true"></canvas>
<div class="ov-page">`;
}

// Selettore lingua: link alla stessa pagina nell'altra lingua (o alla home se non esiste)
export function langSwitch(lang, alt) {
  const itHref = alt?.it || '/', enHref = alt?.en || '/en/';
  return `<div class="ov-lang" role="group" aria-label="${UI[lang].switchLabel}"><a href="${itHref}" hreflang="it" lang="it"${lang === 'it' ? ' aria-current="true"' : ''}>IT</a><a href="${enHref}" hreflang="en" lang="en"${lang === 'en' ? ' aria-current="true"' : ''}>EN</a></div>`;
}

export function header(current = '', lang = 'it', alt) {
  const u = UI[lang], P = p => pathFor(lang, p);
  const items = prodottiIn(lang).map(p => `<a href="${urlIn(lang, p.id)}"${current === p.id ? ' aria-current="page"' : ''}>${esc(p.name)}<small>${esc(p.tagline)}</small></a>`).join('');
  const home = P('/');
  return `<header class="ov-header">
  <a href="${home}" class="ov-logo" aria-label="Ovia, ${u.home}">OVIA</a>
  <div class="ov-header-right">
  ${langSwitch(lang, alt)}
  <button class="ov-burger" aria-label="${u.nav.menu}" aria-expanded="false">☰</button>
  </div>
  <nav class="ov-nav" aria-label="${u.nav.main}">
    <div class="ov-dd"><button aria-expanded="false" aria-haspopup="true">${u.nav.services} ▾</button><div class="ov-dd-menu">${items}<a href="${P('/servizi/')}"><strong>${u.nav.allServices}</strong></a></div></div>
    <a href="${home}#sicurezza">${u.nav.security}</a>
    <a href="${home}#metodo">${u.nav.method}</a>
    <a href="${P('/blog/')}"${current === 'blog' ? ' aria-current="page"' : ''}>${u.nav.blog}</a>
    <a href="${P('/faq.html')}"${current === 'faq' ? ' aria-current="page"' : ''}>${u.nav.faq}</a>
    ${calBtn(u.cta, '', true)}
  </nav>
</header>`;
}

export function footer(lang = 'it') {
  const u = UI[lang], f = u.footer, P = p => pathFor(lang, p), home = P('/');
  const svc = prodottiIn(lang).map(p => `<a href="${urlIn(lang, p.id)}">${esc(p.name)}</a>`).join('');
  return `<footer class="ov-footer">
  <div class="ov-wrap">
    <div class="cols">
      <div>
        <a href="${home}" class="ov-logo" aria-label="Ovia">OVIA</a>
        <p style="margin-top:14px;max-width:320px">${esc(u.positioning)} ${esc(f.about)}</p>
        <p style="margin-top:14px"><a href="mailto:${SITE.email}">${SITE.email}</a></p>
      </div>
      <div><h5>${f.services}</h5>${svc}</div>
      <div><h5>${f.ovia}</h5><a href="${home}#metodo">${f.method}</a><a href="${home}#sicurezza">${f.security}</a><a href="${P('/blog/')}">${f.blog}</a><a href="${P('/faq.html')}">${f.faq}</a><a href="${P('/servizi/')}">${f.all}</a><a href="${P('/blog/feed.xml')}">${f.rss}</a></div>
      <div><h5>${f.legal}</h5><a href="${P('/privacy.html')}">${f.privacy}</a><a href="${P('/cookie.html')}">${f.cookie}</a><a href="${P('/termini.html')}">${f.terms}</a></div>
    </div>
    <p class="legal">${esc(SITE.legal)} · © Ovia ${new Date().getFullYear()}</p>
  </div>
</footer>
</div>
<script src="/assets/ovia-pages.js" defer></script>
</body>
</html>`;
}

// Testo con **grassetto** e [[fonte]] → <sup> numerato (refs = array ordinato di chiavi)
export function rich(text, refs = [], lang = 'it') {
  let s = esc(text);
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\[\[([a-z0-9-]+)\]\]/g, (_, k) => {
    let i = refs.indexOf(k);
    if (i < 0) { refs.push(k); i = refs.length - 1; }
    return `<sup class="ov-ref"><a href="#fonte-${i + 1}" aria-label="${lang === 'en' ? 'Source' : 'Fonte'} ${i + 1}">[${i + 1}]</a></sup>`;
  });
  return s;
}
