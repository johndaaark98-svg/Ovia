// Layout condiviso (head, header, footer) per pagine servizio e blog.
import { SITE, PRODOTTI, urlOf } from '../../data/prodotti.mjs';

export const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export const svgGlyph = (glyph, cls = '') => `<svg viewBox="0 0 88 88" aria-hidden="true" class="${cls}">${glyph}</svg>`;

export const calBtn = (label = SITE.cta, extra = '', sm = false) =>
  `<button type="button" class="ov-btn${sm ? ' sm' : ''} ${extra}" data-cal-link="${SITE.calLink}" data-cal-namespace="${SITE.calNamespace}" data-cal-config='{"layout":"month_view","theme":"dark"}'><span>${esc(label)}</span><span class="circ" aria-hidden="true">→</span></button>`;

export function head({ title, description, path, type = 'website', jsonld = [], extra = '' }) {
  const url = SITE.url + path;
  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(url)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta name="theme-color" content="#04070f">
<meta property="og:type" content="${type}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:locale" content="it_IT">
<meta property="og:site_name" content="Ovia">
<meta name="twitter:card" content="summary_large_image">
<link rel="alternate" type="application/rss+xml" title="Blog Ovia" href="/blog/feed.xml">
<link rel="stylesheet" href="/assets/ovia-pages.css">
${jsonld.map(j => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`).join('\n')}
${extra}
</head>
<body>
<canvas id="ov-constellation" aria-hidden="true"></canvas>
<div class="ov-page">`;
}

export function header(current = '') {
  const items = PRODOTTI.map(p => `<a href="${urlOf(p.id)}"${current === p.id ? ' aria-current="page"' : ''}>${esc(p.name)}<small>${esc(p.tagline)}</small></a>`).join('');
  return `<header class="ov-header">
  <a href="/" class="ov-logo" aria-label="Ovia, home">OVIA</a>
  <button class="ov-burger" aria-label="Apri il menu" aria-expanded="false">☰</button>
  <nav class="ov-nav" aria-label="Principale">
    <div class="ov-dd"><button aria-expanded="false" aria-haspopup="true">Servizi ▾</button><div class="ov-dd-menu">${items}<a href="/servizi/"><strong>Tutti i servizi →</strong></a></div></div>
    <a href="/#sicurezza">Sicurezza</a>
    <a href="/#metodo">Metodo</a>
    <a href="/blog/"${current === 'blog' ? ' aria-current="page"' : ''}>Blog</a>
    <a href="/faq.html"${current === 'faq' ? ' aria-current="page"' : ''}>FAQ</a>
    ${calBtn(SITE.cta, '', true)}
  </nav>
</header>`;
}

export function footer() {
  const svc = PRODOTTI.map(p => `<a href="${urlOf(p.id)}">${esc(p.name)}</a>`).join('');
  return `<footer class="ov-footer">
  <div class="ov-wrap">
    <div class="cols">
      <div>
        <a href="/" class="ov-logo" aria-label="Ovia">OVIA</a>
        <p style="margin-top:14px;max-width:320px">${esc(SITE.positioning)} Sistemi su misura per studi professionali e PMI, progettati partendo da strategia e sicurezza.</p>
        <p style="margin-top:14px"><a href="mailto:${SITE.email}">${SITE.email}</a></p>
      </div>
      <div><h5>Servizi</h5>${svc}</div>
      <div><h5>Ovia</h5><a href="/#metodo">Il metodo</a><a href="/#sicurezza">Sicurezza</a><a href="/blog/">Blog</a><a href="/faq.html">Domande frequenti</a><a href="/servizi/">Tutti i servizi</a><a href="/blog/feed.xml">Feed RSS</a></div>
      <div><h5>Legale</h5><a href="/privacy.html">Privacy Policy</a><a href="/cookie.html">Cookie Policy</a><a href="/termini.html">Termini di servizio</a></div>
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
export function rich(text, refs = []) {
  let s = esc(text);
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\[\[([a-z0-9-]+)\]\]/g, (_, k) => {
    let i = refs.indexOf(k);
    if (i < 0) { refs.push(k); i = refs.length - 1; }
    return `<sup class="ov-ref"><a href="#fonte-${i + 1}" aria-label="Fonte ${i + 1}">[${i + 1}]</a></sup>`;
  });
  return s;
}
