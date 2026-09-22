// Rendering HTML del blog: articolo, indice, feed RSS, copertina SVG.
import { SITE, PRODOTTI, byId, urlOf } from '../../data/prodotti.mjs';
import { CATEGORIE } from './config.mjs';
import { head, header, footer, esc, calBtn, svgGlyph } from '../lib/layout.mjs';

export const catLabel = id => CATEGORIE.find(c => c.id === id)?.label || 'Strategia';
const dataIt = iso => new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Rome' }).format(new Date(iso));

// Testo con **grassetto** e [link](url). I link sono ammessi solo verso fonti
// dichiarate o pagine interne: tutto il resto diventa testo semplice.
export function inline(text, allowed) {
  let s = esc(text);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, rawUrl) => {
    const url = rawUrl.replace(/&amp;/g, '&');
    const interno = /^\/(servizi|blog)\/[a-z0-9\-/]*(\.html)?(#[a-z0-9-]+)?$/.test(url);
    if (interno) return `<a href="${esc(url)}">${label}</a>`;
    if (/^https?:\/\//.test(url) && allowed.has(url)) return `<a href="${esc(url)}" target="_blank" rel="noopener">${label}</a>`;
    return label;
  });
  return s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

// Copertina generativa: costellazione deterministica + glifo del prodotto principale.
function hash(str) { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
export function cover(slug, prodottoId, variant = 'wide') {
  let seed = hash(slug);
  const rnd = () => ((seed = Math.imul(seed ^ (seed >>> 15), 2246822507) ^ Math.imul(seed ^ (seed >>> 13), 3266489909)) >>> 0) / 4294967296;
  const W = 1600, H = variant === 'wide' ? 700 : 900;
  const pts = Array.from({ length: 34 }, () => [rnd() * W, rnd() * H]);
  let lines = '';
  pts.forEach((p, i) => pts.slice(i + 1).forEach(q => { const d = Math.hypot(p[0] - q[0], p[1] - q[1]); if (d < 230) lines += `<line x1="${p[0] | 0}" y1="${p[1] | 0}" x2="${q[0] | 0}" y2="${q[1] | 0}" stroke="rgba(130,150,255,${(0.28 * (1 - d / 230)).toFixed(2)})" stroke-width="1.2"/>`; }));
  const dots = pts.map(p => `<circle cx="${p[0] | 0}" cy="${p[1] | 0}" r="${(1.5 + rnd() * 2).toFixed(1)}" fill="rgba(170,190,255,.8)"/>`).join('');
  let grid = '';
  for (let x = 0; x <= W; x += 100) grid += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="rgba(148,170,220,.07)"/>`;
  for (let y = 0; y <= H; y += 100) grid += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="rgba(148,170,220,.07)"/>`;
  const hue = ['#4c8dff', '#8b5cf6', '#38bdf8'][hash(slug + 'c') % 3];
  const g = (byId[prodottoId] || PRODOTTI[0]).glyph.replace(/class="g-line"/g, 'fill="none" stroke="#9cb8ff" stroke-width="1.4"').replace(/class="g-node"/g, 'fill="#dbe6ff"').replace(/class="g-core"/g, 'fill="#a78bfa"');
  const id = 'g' + (hash(slug) % 100000);
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrazione" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="${id}" cx="50%" cy="50%" r="60%"><stop offset="0" stop-color="${hue}" stop-opacity=".45"/><stop offset=".55" stop-color="#1a1f5c" stop-opacity=".35"/><stop offset="1" stop-color="#070b1c" stop-opacity="1"/></radialGradient></defs><rect width="${W}" height="${H}" fill="#070b1c"/><rect width="${W}" height="${H}" fill="url(#${id})"/>${grid}${lines}${dots}<g transform="translate(${W / 2 - 110} ${H / 2 - 110}) scale(2.5)">${g}</g></svg>`;
}

function blocco(b, allowed) {
  if (!b) return '';
  const I = t => inline(t || '', allowed);
  if (b.tipo === 'compare') {
    const col = (c, good) => `<div class="col${good ? ' good' : ''}"><div class="head"><h3>${esc(c.titolo || '')}</h3>${c.badge ? `<span class="ov-pill">${esc(c.badge)}</span>` : ''}</div>${(c.righe || []).map(r => `<div class="row"><div class="l">${esc(r.etichetta)}</div>${I(r.valore)}</div>`).join('')}</div>`;
    return `<div class="ar-compare">${col(b.sinistra || {}, false)}${col(b.destra || {}, true)}</div>`;
  }
  if (b.tipo === 'steps') return `<div class="ar-steps">${(b.voci || []).map((v, i) => `<div class="ar-step"><div class="n">${i + 1}</div><div><h3>${esc(v.titolo || '')}${v.meta ? `<small>${esc(v.meta)}</small>` : ''}</h3><p>${I(v.testo)}</p></div></div>`).join('')}</div>`;
  if (b.tipo === 'checklist') return `${b.titolo ? `<p><strong>${esc(b.titolo)}</strong></p>` : ''}<ul class="ar-check">${(b.voci || []).map(v => `<li><span class="ic ${v.ok === false ? 'no' : 'ok'}">${v.ok === false ? '✕' : '✓'}</span><div>${esc(v.titolo || '')}${v.testo ? `<small>${I(v.testo)}</small>` : ''}</div></li>`).join('')}</ul>`;
  if (b.tipo === 'warning') return `<div class="ar-box warn"><div class="t">⚠ ${esc(b.titolo || 'Errori comuni da evitare')}</div><ul>${(b.voci || []).map(v => `<li>${I(v.testo || v.titolo)}</li>`).join('')}</ul></div>`;
  if (b.tipo === 'stats') return `<div class="ar-stats">${(b.voci || []).map(v => `<div><b>${esc(v.valore || '')}</b><span>${I(v.testo)}</span></div>`).join('')}</div>`;
  return '';
}

const slugify = s => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

export function renderArticolo(a, tutti) {
  const allowed = new Set((a.fonti || []).map(f => f.url));
  const I = t => inline(t, allowed);
  const path = `/blog/${a.slug}.html`;
  const prodotto0 = a.prodotti?.[0]?.id;
  const minuti = a.minuti || Math.max(3, Math.round((a.parole || 1200) / 200));
  const toc = a.sezioni.map(s => `<li><a href="#${slugify(s.h2)}">${esc(s.h2)}</a></li>`).join('');
  const sezioni = a.sezioni.map(s => `<section><h2 id="${slugify(s.h2)}">${esc(s.h2)}</h2>${s.paragrafi.map(p => `<p>${I(p)}</p>`).join('')}${blocco(s.blocco, allowed)}</section>`).join('');
  const faq = a.faq.map((f, i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(f.domanda)}</summary><div class="ans"><p>${I(f.risposta)}</p></div></details>`).join('');
  const prodotti = (a.prodotti || []).filter(p => byId[p.id]).map(p => { const P = byId[p.id]; return `<a class="ar-prod" href="${urlOf(P.id)}">${svgGlyph(P.glyph, '')}<span class="k">${esc(P.kicker)}</span><h3>${esc(P.name)}</h3><p>${esc(p.perche)}</p><span class="go">Scopri ${esc(P.short)} →</span></a>`; }).join('');
  const correlati = tutti.filter(x => x.slug !== a.slug)
    .sort((x, y) => (y.categoria === a.categoria) - (x.categoria === a.categoria) || y.data.localeCompare(x.data)).slice(0, 3);
  const fonti = (a.fonti || []).map(f => `<li><a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.titolo)}</a> — ${esc(f.fonte)}</li>`).join('');
  const jsonld = [
    { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: a.title, description: a.meta_description, datePublished: a.data, dateModified: a.aggiornato || a.data, inLanguage: 'it-IT', mainEntityOfPage: SITE.url + path, keywords: a.tags.join(', '), articleSection: catLabel(a.categoria), wordCount: a.parole, author: { '@type': 'Organization', name: a.autore || 'Redazione Ovia', url: SITE.url }, publisher: { '@type': 'Organization', name: 'Ovia', url: SITE.url }, citation: (a.fonti || []).map(f => f.url) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url + '/' }, { '@type': 'ListItem', position: 2, name: 'Blog', item: SITE.url + '/blog/' }, { '@type': 'ListItem', position: 3, name: a.title, item: SITE.url + path }] },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: a.faq.map(f => ({ '@type': 'Question', name: f.domanda, acceptedAnswer: { '@type': 'Answer', text: f.risposta.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*/g, '') } })) },
  ];
  const share = encodeURIComponent(SITE.url + path);
  return head({ title: `${a.title} | Blog Ovia`, description: a.meta_description, path, type: 'article', jsonld, extra: `<meta property="article:published_time" content="${a.data}">${a.tags.map(t => `<meta property="article:tag" content="${esc(t)}">`).join('')}` }) + header('blog') + `
<div class="ar-progress" aria-hidden="true"></div>
<main class="ar">
  <nav class="ov-breadcrumb" aria-label="Percorso"><a href="/">Home</a><span>/</span><a href="/blog/">Blog</a><span>/</span>${esc(a.title)}</nav>
  <div class="ar-cover">${cover(a.slug, prodotto0)}</div>
  <div class="ov-pills">${a.tags.map(t => `<span class="ov-pill">${esc(t)}</span>`).join('')}</div>
  <h1>${esc(a.title)}</h1>
  <p class="ar-lead">${esc(a.lead)}</p>
  <div class="ar-meta"><strong>${esc(a.autore || 'Redazione Ovia')}</strong><span class="dot">·</span><time datetime="${a.data}">${dataIt(a.data)}</time><span class="dot">·</span><span>${minuti} min di lettura</span><span class="dot">·</span><a href="/blog/?c=${a.categoria}" style="color:var(--accent)">${esc(catLabel(a.categoria))}</a></div>
  <article class="ar-body">
    ${a.intro.map(p => `<p>${I(p)}</p>`).join('')}
    <div class="ar-box"><div class="t">ⓘ Punti chiave</div><ul>${a.punti_chiave.map(p => `<li>${I(p)}</li>`).join('')}</ul></div>
    <details class="ar-toc"><summary>In questo articolo</summary><ol>${toc}<li><a href="#punto-di-vista-ovia">Il punto di vista Ovia</a></li><li><a href="#domande-frequenti">Domande frequenti</a></li></ol></details>
    ${sezioni}
    <h2 id="punto-di-vista-ovia">${esc(a.ovia_view.titolo)}</h2>
    <div class="ar-box ovia"><div class="t">✦ Il punto di vista Ovia: strategia e sicurezza prima dello strumento</div>${a.ovia_view.paragrafi.map(p => `<p>${I(p)}</p>`).join('')}</div>
    <h2 id="domande-frequenti">Domande frequenti</h2>
    <div class="ov-faq">${faq}</div>
    <h2>Conclusione</h2>
    ${a.conclusione.map(p => `<p>${I(p)}</p>`).join('')}
    <div class="ar-products">
      <h2>I sistemi Ovia per questo tema</h2>
      <p>Soluzioni costruite su misura che risolvono esattamente il problema di questo articolo.</p>
      <div class="grid">${prodotti}</div>
      <div class="ov-pills">${(a.prodotti || []).filter(p => byId[p.id]).map(p => `<a class="ov-pill" href="${urlOf(p.id)}">#${esc(byId[p.id].name)}</a>`).join('')}</div>
    </div>
    <div class="ar-share"><a href="https://www.linkedin.com/sharing/share-offsite/?url=${share}" target="_blank" rel="noopener">Condividi su LinkedIn</a><a href="https://wa.me/?text=${share}" target="_blank" rel="noopener">WhatsApp</a><button type="button" data-copy>Copia link</button></div>
    ${fonti ? `<div class="ov-sources"><h4>Fonti</h4><ol>${fonti}</ol></div>` : ''}
    <p class="ar-disclosure">Articolo della redazione Ovia, redatto con il supporto di strumenti di intelligenza artificiale a partire dalle fonti citate, che restano di proprietà dei rispettivi autori. Le informazioni hanno scopo divulgativo e non costituiscono consulenza legale o fiscale. Segnalazioni: <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
  </article>
  ${correlati.length ? `<section class="ar-related"><h2>Articoli correlati</h2><div class="bl-grid">${correlati.map(c => card(c)).join('')}</div></section>` : ''}
  <section class="ov-section"><div class="ov-cta-band">
    <p class="ov-eyebrow">Ovia Process Check</p>
    <h2>Trasforma questo articolo in un risultato misurabile.</h2>
    <p>Trenta minuti sul tuo flusso di lavoro reale: dove va il tempo, cosa si può automatizzare in sicurezza e da dove conviene partire.</p>
    ${calBtn()}
    <p class="small">Nessun impegno. Lavoriamo con pochi clienti alla volta.</p>
  </div></section>
</main>` + footer();
}

export function card(a, featured = false) {
  const search = esc([a.title, a.lead, ...(a.tags || [])].join(' ').toLowerCase());
  const Tag = featured ? 'h2' : 'h3';
  return `<a class="ov-card bl-card${featured ? ' featured' : ''}" href="/blog/${a.slug}.html" data-cat="${a.categoria}" data-search="${search}"><div class="cover">${cover(a.slug, a.prodotti?.[0]?.id, featured ? 'wide' : 'card')}</div><div class="body"><div class="ov-pills">${(a.tags || []).slice(0, 2).map(t => `<span class="ov-pill">${esc(t)}</span>`).join('')}</div><${Tag}>${esc(a.title)}</${Tag}><p>${esc(a.lead)}</p><span class="meta">${dataIt(a.data)} · ${a.minuti || 6} min · ${esc(catLabel(a.categoria))}</span></div></a>`;
}

export function renderIndice(tutti) {
  const ord = [...tutti].sort((x, y) => y.data.localeCompare(x.data));
  const usate = new Set(ord.map(a => a.categoria));
  const filtri = `<button data-f="tutti" aria-pressed="true">Tutti</button>` + CATEGORIE.filter(c => usate.has(c.id)).map(c => `<button data-f="${c.id}" aria-pressed="false">${esc(c.label)}</button>`).join('');
  const jsonld = [{ '@context': 'https://schema.org', '@type': 'Blog', name: 'Blog Ovia', url: SITE.url + '/blog/', inLanguage: 'it-IT', publisher: { '@type': 'Organization', name: 'Ovia', url: SITE.url }, blogPost: ord.slice(0, 20).map(a => ({ '@type': 'BlogPosting', headline: a.title, url: `${SITE.url}/blog/${a.slug}.html`, datePublished: a.data })) }];
  return head({ title: 'Blog Ovia — AI, automazione e sicurezza per studi professionali e PMI', description: 'Ogni giorno una guida pratica su intelligenza artificiale, automazione, normativa e sicurezza per studi professionali e PMI italiane. Strategia prima dello strumento.', path: '/blog/', jsonld }) + header('blog') + `
<main><div class="ov-wrap">
  <nav class="ov-breadcrumb" aria-label="Percorso"><a href="/">Home</a><span>/</span>Blog</nav>
  <section class="bl-hero">
    <p class="ov-eyebrow">Il blog Ovia · un articolo al giorno</p>
    <h1>L’AI spiegata a chi deve usarla davvero.</h1>
    <p class="ov-lead">Ogni giorno analizziamo le novità del mondo AI e le traduciamo in cosa cambia per uno studio professionale o una PMI italiana: opportunità, rischi, obblighi e passi concreti. ${esc(SITE.positioning)}</p>
  </section>
  <div class="bl-tools"><div class="bl-filters" role="group" aria-label="Filtra per categoria">${filtri}</div><input class="bl-search" type="search" placeholder="Cerca un argomento…" aria-label="Cerca negli articoli"></div>
  <div class="bl-grid" data-blog-list>${ord.map((a, i) => card(a, i === 0)).join('')}</div>
  <p class="bl-empty">Nessun articolo trovato. Prova con un’altra parola.</p>
  <section class="ov-section"><div class="ov-cta-band"><p class="ov-eyebrow">Ovia Process Check</p><h2>Leggere è il primo passo. Il secondo è misurare.</h2><p>Scopri in trenta minuti dove il tuo studio perde tempo e cosa si può automatizzare in sicurezza.</p>${calBtn()}</div></section>
</div></main>
` + footer();
}

export function renderFeed(tutti) {
  const ord = [...tutti].sort((x, y) => y.data.localeCompare(x.data)).slice(0, 30);
  const x = s => esc(s);
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>Blog Ovia</title>
<link>${SITE.url}/blog/</link>
<atom:link href="${SITE.url}/blog/feed.xml" rel="self" type="application/rss+xml"/>
<description>AI, automazione e sicurezza per studi professionali e PMI italiane.</description>
<language>it-it</language>
${ord.map(a => `<item><title>${x(a.title)}</title><link>${SITE.url}/blog/${a.slug}.html</link><guid isPermaLink="true">${SITE.url}/blog/${a.slug}.html</guid><pubDate>${new Date(a.data).toUTCString()}</pubDate><category>${x(catLabel(a.categoria))}</category><description>${x(a.meta_description)}</description></item>`).join('\n')}
</channel>
</rss>`;
}
