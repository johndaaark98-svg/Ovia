// Rendering HTML del blog: articolo, indice, feed RSS, copertina SVG.
import { SITE, PRODOTTI, byId, byIdIn } from '../../data/prodotti.mjs';
import { CATEGORIE } from './config.mjs';
import { head, header, footer, esc, calBtn, svgGlyph, urlIn } from '../lib/layout.mjs';
import { UI } from '../lib/i18n.mjs';

const CAT_EN = { 'normativa-sicurezza': 'Regulation and security', 'automazione': 'Automation', 'ai-search-marketing': 'AI search and marketing', 'strumenti-ai': 'AI tools', 'strategia': 'Strategy' };
export const catLabel = (id, lang = 'it') => lang === 'en' ? (CAT_EN[id] || 'Strategy') : (CATEGORIE.find(c => c.id === id)?.label || 'Strategia');
const dataIt = (iso, lang = 'it') => new Intl.DateTimeFormat(UI[lang].dateLocale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Rome' }).format(new Date(iso));

// Testo con **grassetto** e [link](url). I link sono ammessi solo verso fonti
// dichiarate o pagine interne: tutto il resto diventa testo semplice.
export function inline(text, allowed) {
  let s = esc(text);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, rawUrl) => {
    const url = rawUrl.replace(/&amp;/g, '&');
    const interno = /^\/(en\/)?(servizi|services|blog)\/[a-z0-9\-/]*(\.html)?(#[a-z0-9-]+)?$/.test(url);
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

function blocco(b, allowed, lang = 'it') {
  if (!b) return '';
  const I = t => inline(t || '', allowed);
  if (b.tipo === 'compare') {
    const col = (c, good) => `<div class="col${good ? ' good' : ''}"><div class="head"><h3>${esc(c.titolo || '')}</h3>${c.badge ? `<span class="ov-pill">${esc(c.badge)}</span>` : ''}</div>${(c.righe || []).map(r => `<div class="row"><div class="l">${esc(r.etichetta)}</div>${I(r.valore)}</div>`).join('')}</div>`;
    return `<div class="ar-compare">${col(b.sinistra || {}, false)}${col(b.destra || {}, true)}</div>`;
  }
  if (b.tipo === 'steps') return `<div class="ar-steps">${(b.voci || []).map((v, i) => `<div class="ar-step"><div class="n">${i + 1}</div><div><h3>${esc(v.titolo || '')}${v.meta ? `<small>${esc(v.meta)}</small>` : ''}</h3><p>${I(v.testo)}</p></div></div>`).join('')}</div>`;
  if (b.tipo === 'checklist') return `${b.titolo ? `<p><strong>${esc(b.titolo)}</strong></p>` : ''}<ul class="ar-check">${(b.voci || []).map(v => `<li><span class="ic ${v.ok === false ? 'no' : 'ok'}">${v.ok === false ? '✕' : '✓'}</span><div>${esc(v.titolo || '')}${v.testo ? `<small>${I(v.testo)}</small>` : ''}</div></li>`).join('')}</ul>`;
  if (b.tipo === 'warning') return `<div class="ar-box warn"><div class="t">⚠ ${esc(b.titolo || (lang === 'en' ? 'Common mistakes to avoid' : 'Errori comuni da evitare'))}</div><ul>${(b.voci || []).map(v => `<li>${I(v.testo || v.titolo)}</li>`).join('')}</ul></div>`;
  if (b.tipo === 'stats') return `<div class="ar-stats">${(b.voci || []).map(v => `<div><b>${esc(v.valore || '')}</b><span>${I(v.testo)}</span></div>`).join('')}</div>`;
  return '';
}

const slugify = s => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

const T = {
  it: { crumb: 'Blog', read: m => `${m} min di lettura`, key: 'Punti chiave', toc: 'In questo articolo', view: 'Il punto di vista Ovia', viewBox: 'Il punto di vista Ovia: strategia e sicurezza prima dello strumento', faq: 'Domande frequenti', concl: 'Conclusione', prodH: 'I sistemi Ovia per questo tema', prodP: 'Soluzioni costruite su misura che risolvono esattamente il problema di questo articolo.', discover: s => `Scopri ${s} →`, share: 'Condividi su LinkedIn', copy: 'Copia link', sources: 'Fonti',
    disclosure: e => `Articolo della redazione Ovia, redatto con il supporto di strumenti di intelligenza artificiale a partire dalle fonti citate, che restano di proprietà dei rispettivi autori. Le informazioni hanno scopo divulgativo e non costituiscono consulenza legale o fiscale. Segnalazioni: <a href="mailto:${e}">${e}</a>.`,
    related: 'Articoli correlati', ctaH: 'Trasforma questo articolo in un risultato misurabile.', ctaP: 'Trenta minuti sul tuo flusso di lavoro reale: dove va il tempo, cosa si può automatizzare in sicurezza e da dove conviene partire.', ctaS: 'Nessun impegno. Lavoriamo con pochi clienti alla volta.',
    idxTitle: 'Blog Ovia — AI, automazione e sicurezza per studi professionali e PMI', idxDesc: 'Ogni giorno una guida pratica su intelligenza artificiale, automazione, normativa e sicurezza per studi professionali e PMI italiane. Strategia prima dello strumento.', idxEy: 'Il blog Ovia · un articolo al giorno', idxH1: 'L’AI spiegata a chi deve usarla davvero.', idxLead: 'Ogni giorno analizziamo le novità del mondo AI e le traduciamo in cosa cambia per uno studio professionale o una PMI italiana: opportunità, rischi, obblighi e passi concreti.', all: 'Tutti', filterL: 'Filtra per categoria', search: 'Cerca un argomento…', searchL: 'Cerca negli articoli', empty: 'Nessun articolo trovato. Prova con un’altra parola.', idxCtaH: 'Leggere è il primo passo. Il secondo è misurare.', idxCtaP: 'Scopri in trenta minuti dove il tuo studio perde tempo e cosa si può automatizzare in sicurezza.', feedDesc: 'AI, automazione e sicurezza per studi professionali e PMI italiane.', inLang: 'it-IT', feedLang: 'it-it', author: 'Redazione Ovia' },
  en: { crumb: 'Blog', read: m => `${m} min read`, key: 'Key takeaways', toc: 'In this article', view: 'The Ovia view', viewBox: 'The Ovia view: strategy and security before the tool', faq: 'Frequently asked questions', concl: 'Conclusion', prodH: 'Ovia systems for this topic', prodP: 'Tailor-made solutions that solve exactly the problem discussed in this article.', discover: s => `Discover ${s} →`, share: 'Share on LinkedIn', copy: 'Copy link', sources: 'Sources',
    disclosure: e => `An article by the Ovia editorial team, written with the support of artificial intelligence tools from the sources cited, which remain the property of their respective authors. Translated from the Italian original. This information is for general guidance and does not constitute legal or tax advice. Corrections: <a href="mailto:${e}">${e}</a>.`,
    related: 'Related articles', ctaH: 'Turn this article into a measurable result.', ctaP: 'Thirty minutes on your real workflow: where the time goes, what can be safely automated and where it’s best to start.', ctaS: 'No obligation. We work with a few clients at a time.',
    idxTitle: 'Ovia Blog — AI, automation and security for professional firms and SMEs', idxDesc: 'A practical guide every day on artificial intelligence, automation, regulation and security for professional firms and SMEs in Italy. Strategy before the tool.', idxEy: 'The Ovia blog · one article a day', idxH1: 'AI explained for people who actually have to use it.', idxLead: 'Every day we analyse what’s new in AI and translate it into what changes for a professional firm or SME in Italy: opportunities, risks, obligations and concrete steps.', all: 'All', filterL: 'Filter by category', search: 'Search a topic…', searchL: 'Search articles', empty: 'No articles found. Try another word.', idxCtaH: 'Reading is the first step. The second is measuring.', idxCtaP: 'Find out in thirty minutes where your firm loses time and what can be safely automated.', feedDesc: 'AI, automation and security for professional firms and SMEs in Italy.', inLang: 'en', feedLang: 'en', author: 'Ovia editorial team' },
};

// Vista di un articolo nella lingua richiesta (EN = campi di a.en sopra l'originale)
export function loc(a, lang) {
  if (lang !== 'en') return { ...a, _it: a.slug, _en: a.en?.slug || null };
  if (!a.en) return null;
  return { ...a, ...a.en, _it: a.slug, _en: a.en.slug, fonti: a.fonti, data: a.data, categoria: a.categoria, minuti: a.en.minuti || a.minuti, parole: a.en.parole || a.parole };
}
const artPath = (a, lang) => lang === 'en' ? `/en/blog/${a._en}.html` : `/blog/${a._it}.html`;
const altOf = a => ({ it: `/blog/${a._it}.html`, en: a._en ? `/en/blog/${a._en}.html` : null });

// a = articolo già localizzato con loc(); tutti = articoli localizzati nella stessa lingua
export function renderArticolo(a, tutti, lang = 'it') {
  const t = T[lang], u = UI[lang], byL = byIdIn(lang);
  const allowed = new Set((a.fonti || []).map(f => f.url));
  const I = x => inline(x, allowed);
  const path = artPath(a, lang), alt = altOf(a);
  const blogHome = lang === 'en' ? '/en/blog/' : '/blog/', home = lang === 'en' ? '/en/' : '/';
  const prodotto0 = a.prodotti?.[0]?.id;
  const minuti = a.minuti || Math.max(3, Math.round((a.parole || 1200) / 200));
  const toc = a.sezioni.map(s => `<li><a href="#${slugify(s.h2)}">${esc(s.h2)}</a></li>`).join('');
  const sezioni = a.sezioni.map(s => `<section><h2 id="${slugify(s.h2)}">${esc(s.h2)}</h2>${s.paragrafi.map(p => `<p>${I(p)}</p>`).join('')}${blocco(s.blocco, allowed, lang)}</section>`).join('');
  const faq = a.faq.map((f, i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(f.domanda)}</summary><div class="ans"><p>${I(f.risposta)}</p></div></details>`).join('');
  const prods = (a.prodotti || []).filter(p => byL[p.id]);
  const prodotti = prods.map(p => { const P = byL[p.id]; return `<a class="ar-prod" href="${urlIn(lang, P.id)}">${svgGlyph(P.glyph, '')}<span class="k">${esc(P.kicker)}</span><h3>${esc(P.name)}</h3><p>${esc(p.perche)}</p><span class="go">${esc(t.discover(P.short))}</span></a>`; }).join('');
  const correlati = tutti.filter(x => x._it !== a._it)
    .sort((x, y) => (y.categoria === a.categoria) - (x.categoria === a.categoria) || y.data.localeCompare(x.data)).slice(0, 3);
  const fonti = (a.fonti || []).map(f => `<li><a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.titolo)}</a> — ${esc(f.fonte)}</li>`).join('');
  const author = lang === 'en' ? t.author : (a.autore || t.author);
  const jsonld = [
    { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: a.title, description: a.meta_description, datePublished: a.data, dateModified: a.aggiornato || a.data, inLanguage: t.inLang, mainEntityOfPage: SITE.url + path, keywords: a.tags.join(', '), articleSection: catLabel(a.categoria, lang), wordCount: a.parole, author: { '@type': 'Organization', name: author, url: SITE.url }, publisher: { '@type': 'Organization', name: 'Ovia', url: SITE.url }, citation: (a.fonti || []).map(f => f.url) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: u.home, item: SITE.url + home }, { '@type': 'ListItem', position: 2, name: 'Blog', item: SITE.url + blogHome }, { '@type': 'ListItem', position: 3, name: a.title, item: SITE.url + path }] },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: a.faq.map(f => ({ '@type': 'Question', name: f.domanda, acceptedAnswer: { '@type': 'Answer', text: f.risposta.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*/g, '') } })) },
  ];
  const share = encodeURIComponent(SITE.url + path);
  return head({ title: `${a.title} | Blog Ovia`, description: a.meta_description, path: alt.it, lang, alt, type: 'article', jsonld, extra: `<meta property="article:published_time" content="${a.data}">${a.tags.map(x => `<meta property="article:tag" content="${esc(x)}">`).join('')}` }) + header('blog', lang, alt.en ? alt : { it: alt.it, en: '/en/blog/' }) + `
<div class="ar-progress" aria-hidden="true"></div>
<main class="ar">
  <nav class="ov-breadcrumb" aria-label="${u.breadcrumb}"><a href="${home}">${u.home}</a><span>/</span><a href="${blogHome}">Blog</a><span>/</span>${esc(a.title)}</nav>
  <div class="ar-cover">${cover(a._it, prodotto0)}</div>
  <div class="ov-pills">${a.tags.map(x => `<span class="ov-pill">${esc(x)}</span>`).join('')}</div>
  <h1>${esc(a.title)}</h1>
  <p class="ar-lead">${esc(a.lead)}</p>
  <div class="ar-meta"><strong>${esc(author)}</strong><span class="dot">·</span><time datetime="${a.data}">${dataIt(a.data, lang)}</time><span class="dot">·</span><span>${t.read(minuti)}</span><span class="dot">·</span><a href="${blogHome}?c=${a.categoria}" style="color:var(--accent)">${esc(catLabel(a.categoria, lang))}</a></div>
  <article class="ar-body">
    ${a.intro.map(p => `<p>${I(p)}</p>`).join('')}
    <div class="ar-box"><div class="t">ⓘ ${t.key}</div><ul>${a.punti_chiave.map(p => `<li>${I(p)}</li>`).join('')}</ul></div>
    <details class="ar-toc"><summary>${t.toc}</summary><ol>${toc}<li><a href="#punto-di-vista-ovia">${t.view}</a></li><li><a href="#domande-frequenti">${t.faq}</a></li></ol></details>
    ${sezioni}
    <h2 id="punto-di-vista-ovia">${esc(a.ovia_view.titolo)}</h2>
    <div class="ar-box ovia"><div class="t">✦ ${t.viewBox}</div>${a.ovia_view.paragrafi.map(p => `<p>${I(p)}</p>`).join('')}</div>
    <h2 id="domande-frequenti">${t.faq}</h2>
    <div class="ov-faq">${faq}</div>
    <h2>${t.concl}</h2>
    ${a.conclusione.map(p => `<p>${I(p)}</p>`).join('')}
    <div class="ar-products">
      <h2>${t.prodH}</h2>
      <p>${t.prodP}</p>
      <div class="grid">${prodotti}</div>
      <div class="ov-pills">${prods.map(p => `<a class="ov-pill" href="${urlIn(lang, p.id)}">#${esc(byL[p.id].name)}</a>`).join('')}</div>
    </div>
    <div class="ar-share"><a href="https://www.linkedin.com/sharing/share-offsite/?url=${share}" target="_blank" rel="noopener">${t.share}</a><a href="https://wa.me/?text=${share}" target="_blank" rel="noopener">WhatsApp</a><button type="button" data-copy>${t.copy}</button></div>
    ${fonti ? `<div class="ov-sources"><h4>${t.sources}</h4><ol>${fonti}</ol></div>` : ''}
    <p class="ar-disclosure">${t.disclosure(SITE.email)}</p>
  </article>
  ${correlati.length ? `<section class="ar-related"><h2>${t.related}</h2><div class="bl-grid">${correlati.map(c => card(c, false, lang)).join('')}</div></section>` : ''}
  <section class="ov-section"><div class="ov-cta-band">
    <p class="ov-eyebrow">Ovia Process Check</p>
    <h2>${t.ctaH}</h2>
    <p>${t.ctaP}</p>
    ${calBtn(u.cta)}
    <p class="small">${t.ctaS}</p>
  </div></section>
</main>` + footer(lang);
}

export function card(a, featured = false, lang = 'it') {
  const search = esc([a.title, a.lead, ...(a.tags || [])].join(' ').toLowerCase());
  const Tag = featured ? 'h2' : 'h3';
  return `<a class="ov-card bl-card${featured ? ' featured' : ''}" href="${artPath(a, lang)}" data-cat="${a.categoria}" data-search="${search}"><div class="cover">${cover(a._it, a.prodotti?.[0]?.id, featured ? 'wide' : 'card')}</div><div class="body"><div class="ov-pills">${(a.tags || []).slice(0, 2).map(x => `<span class="ov-pill">${esc(x)}</span>`).join('')}</div><${Tag}>${esc(a.title)}</${Tag}><p>${esc(a.lead)}</p><span class="meta">${dataIt(a.data, lang)} · ${a.minuti || 6} min · ${esc(catLabel(a.categoria, lang))}</span></div></a>`;
}

export function renderIndice(tutti, lang = 'it') {
  const t = T[lang], u = UI[lang];
  const ord = [...tutti].sort((x, y) => y.data.localeCompare(x.data));
  const usate = new Set(ord.map(a => a.categoria));
  const blogHome = lang === 'en' ? '/en/blog/' : '/blog/', home = lang === 'en' ? '/en/' : '/';
  const filtri = `<button data-f="tutti" aria-pressed="true">${t.all}</button>` + CATEGORIE.filter(c => usate.has(c.id)).map(c => `<button data-f="${c.id}" aria-pressed="false">${esc(catLabel(c.id, lang))}</button>`).join('');
  const jsonld = [{ '@context': 'https://schema.org', '@type': 'Blog', name: 'Blog Ovia', url: SITE.url + blogHome, inLanguage: t.inLang, publisher: { '@type': 'Organization', name: 'Ovia', url: SITE.url }, blogPost: ord.slice(0, 20).map(a => ({ '@type': 'BlogPosting', headline: a.title, url: SITE.url + artPath(a, lang), datePublished: a.data })) }];
  const alt = { it: '/blog/', en: '/en/blog/' };
  return head({ title: t.idxTitle, description: t.idxDesc, path: '/blog/', lang, alt, jsonld }) + header('blog', lang, alt) + `
<main><div class="ov-wrap">
  <nav class="ov-breadcrumb" aria-label="${u.breadcrumb}"><a href="${home}">${u.home}</a><span>/</span>Blog</nav>
  <section class="bl-hero">
    <p class="ov-eyebrow">${t.idxEy}</p>
    <h1>${t.idxH1}</h1>
    <p class="ov-lead">${t.idxLead} ${esc(u.positioning)}</p>
  </section>
  <div class="bl-tools"><div class="bl-filters" role="group" aria-label="${t.filterL}">${filtri}</div><input class="bl-search" type="search" placeholder="${t.search}" aria-label="${t.searchL}"></div>
  <div class="bl-grid" data-blog-list>${ord.map((a, i) => card(a, i === 0, lang)).join('')}</div>
  <p class="bl-empty">${t.empty}</p>
  <section class="ov-section"><div class="ov-cta-band"><p class="ov-eyebrow">Ovia Process Check</p><h2>${t.idxCtaH}</h2><p>${t.idxCtaP}</p>${calBtn(u.cta)}</div></section>
</div></main>
` + footer(lang);
}

export function renderFeed(tutti, lang = 'it') {
  const t = T[lang], blogHome = lang === 'en' ? '/en/blog/' : '/blog/';
  const ord = [...tutti].sort((x, y) => y.data.localeCompare(x.data)).slice(0, 30);
  const x = s => esc(s);
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>Blog Ovia</title>
<link>${SITE.url}${blogHome}</link>
<atom:link href="${SITE.url}${blogHome}feed.xml" rel="self" type="application/rss+xml"/>
<description>${t.feedDesc}</description>
<language>${t.feedLang}</language>
${ord.map(a => `<item><title>${x(a.title)}</title><link>${SITE.url}${artPath(a, lang)}</link><guid isPermaLink="true">${SITE.url}${artPath(a, lang)}</guid><pubDate>${new Date(a.data).toUTCString()}</pubDate><category>${x(catLabel(a.categoria, lang))}</category><description>${x(a.meta_description)}</description></item>`).join('\n')}
</channel>
</rss>`;
}
