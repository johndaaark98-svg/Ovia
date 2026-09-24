// =====================================================================
// Versioni inglesi delle pagine scritte a mano (homepage, landing siti,
// pagine legali), generate dagli originali italiani + dizionari in
// data/en/pagine-statiche.mjs. Aggiunge anche il selettore IT/EN e i link
// hreflang alle pagine italiane (in modo idempotente).
// =====================================================================
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { HOME, SITI_STUDI, SITI_LOCALI, PRIVACY, COOKIE, TERMINI } from '../data/en/pagine-statiche.mjs';
import { enPath } from './lib/i18n.mjs';
import { bloccoHome } from './build-faq.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const SITE = 'https://oviaitalia.it';

const PAGINE = [
  { file: 'index.html', itP: '/', dict: HOME, kind: 'home' },
  { file: 'siti-studi-professionali.html', itP: '/siti-studi-professionali.html', dict: SITI_STUDI, kind: 'lp', ld: { it: 'Siti web con assistente AI per studi professionali', en: 'AI-ready websites for professional firms', pubblico: { it: 'Studi professionali: commercialisti, avvocati, consulenti', en: 'Professional firms: accountants, lawyers, consultants' } } },
  { file: 'siti-attivita-locali.html', itP: '/siti-attivita-locali.html', dict: SITI_LOCALI, kind: 'lp', ld: { it: 'Siti web per attività locali con prenotazione e assistente AI', en: 'Websites for local businesses with booking and AI assistant', pubblico: { it: 'Attività locali: ristoranti, negozi, servizi', en: 'Local businesses: restaurants, shops, services' } } },
  { file: 'privacy.html', itP: '/privacy.html', dict: PRIVACY, kind: 'lp' },
  { file: 'cookie.html', itP: '/cookie.html', dict: COOKIE, kind: 'lp' },
  { file: 'termini.html', itP: '/termini.html', dict: TERMINI, kind: 'lp' },
];

const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ---- Selettore lingua + hreflang (stesso markup in IT e EN) ----
function langMarkup(kind, lang, itP) {
  const cls = kind === 'home' ? 'av-lang' : 'lp-lang';
  const it = itP, en = enPath(itP);
  return `<!-- LANG:INIZIO --><div class="${cls}" role="group" aria-label="${lang === 'en' ? 'Language' : 'Lingua'}"><a href="${it}" hreflang="it" lang="it"${lang === 'it' ? ' aria-current="true"' : ''}>IT</a><a href="${en}" hreflang="en" lang="en"${lang === 'en' ? ' aria-current="true"' : ''}>EN</a></div><!-- LANG:FINE -->`;
}
const LANG_CSS = `<style id="lang-css">
.av-lang,.lp-lang{display:inline-flex;padding:3px;border-radius:999px;border:1px solid rgba(148,170,220,.28);background:rgba(10,16,32,.7);flex-shrink:0}
.av-lang a,.lp-lang a{font-size:12.5px;font-weight:600;letter-spacing:.08em;padding:7px 11px;min-width:40px;min-height:36px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;color:#97a3bd;line-height:1;text-decoration:none}
.av-lang a[aria-current="true"],.lp-lang a[aria-current="true"]{background:#4c8dff;color:#fff}
.av-header-nav{gap:28px}
.av-nav-cta{white-space:nowrap}
@media (max-width:1100px){.av-nav-link{display:none}}
@media (max-width:767px){.av-header{gap:10px}.av-header-nav{gap:8px}.av-lang a,.lp-lang a{padding:9px 10px;min-width:38px;min-height:40px}.av-nav-cta{font-size:12.5px;letter-spacing:.02em;text-transform:none;padding:11px 14px}}
@media (max-width:420px){.av-header{left:14px!important;right:14px!important}.av-logo{font-size:20px;letter-spacing:.14em;gap:5px}.av-lang a{min-width:34px;padding:9px 8px}.av-nav-cta{padding:11px 11px;font-size:12px}}
@media (max-width:360px){.av-nav-cta{padding:10px 9px}.av-logo::after{display:none}}
.av-logo{min-height:40px;align-items:center}
@media (max-width:640px){.lp-nav{gap:12px}.lp-nav a:not(.lp-btn){display:none}.lp-nav .lp-lang a{display:inline-flex}}
.lp-nav a{min-height:40px;display:inline-flex;align-items:center}
.lp-breadcrumb a{display:inline-block;padding:12px 4px;margin:-12px -4px}
@media (max-width:480px){.legal-table th,.legal-table td{padding:10px 8px;font-size:14px;overflow-wrap:anywhere;hyphens:auto}}
</style>`;
function hreflang(itP) {
  return `<!-- HREFLANG:INIZIO --><link rel="alternate" hreflang="it" href="${SITE}${itP}" /><link rel="alternate" hreflang="en" href="${SITE}${enPath(itP)}" /><link rel="alternate" hreflang="x-default" href="${SITE}${itP}" /><!-- HREFLANG:FINE -->`;
}
function conSelettore(html, kind, lang, itP) {
  const sw = langMarkup(kind, lang, itP);
  if (/<!-- LANG:INIZIO -->[\s\S]*?<!-- LANG:FINE -->/.test(html)) html = html.replace(/<!-- LANG:INIZIO -->[\s\S]*?<!-- LANG:FINE -->/, () => sw);
  else if (kind === 'home') html = html.replace('<nav class="av-header-nav">', () => '<nav class="av-header-nav">\n        ' + sw);
  else html = html.replace(/<nav class="lp-nav">/, () => '<nav class="lp-nav">' + sw);
  if (html.includes('id="lang-css"')) html = html.replace(/<style id="lang-css">[\s\S]*?<\/style>/, () => LANG_CSS.trim());
  else html = html.replace('</head>', () => LANG_CSS + '\n</head>');
  const hl = hreflang(itP);
  if (/<!-- HREFLANG:INIZIO -->[\s\S]*?<!-- HREFLANG:FINE -->/.test(html)) html = html.replace(/<!-- HREFLANG:INIZIO -->[\s\S]*?<!-- HREFLANG:FINE -->/, () => hl);
  else html = html.replace(/(<link rel="canonical"[^>]*>)/, (m) => m + '\n    ' + hl);
  return html;
}


// ---- Dati strutturati schema.org per le landing (Service + FAQPage + BreadcrumbList) ----
const deHtml = t => t.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&rsquo;/g, '’').replace(/\s+/g, ' ').trim();
function conJsonLd(html, lang, itP, ld) {
  const url = SITE + (lang === 'en' ? enPath(itP) : itP);
  const home = SITE + (lang === 'en' ? '/en/' : '/');
  const titolo = deHtml((html.match(/<title>([^<]*)<\/title>/) || [])[1] || ld[lang]).replace(/\s*\|\s*Ovia$/, '');
  const descr = deHtml((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
  const faq = [...html.matchAll(/<div class="lp-faq-item">\s*<button class="lp-faq-q">([\s\S]*?)<span class="plus">[\s\S]*?<\/button>\s*<div class="lp-faq-a">([\s\S]*?)<\/div>/g)]
    .map(m => ({ '@type': 'Question', name: deHtml(m[1]), acceptedAnswer: { '@type': 'Answer', text: deHtml(m[2]) } }));
  const provider = { '@type': 'Organization', '@id': SITE + '/#organization', name: 'Ovia', legalName: 'L3 Innovation Srl', url: SITE };
  const grafo = [
    { '@type': 'WebPage', '@id': url + '#webpage', url, name: titolo, description: descr, inLanguage: lang === 'en' ? 'en' : 'it-IT', isPartOf: { '@type': 'WebSite', url: SITE, name: 'Ovia' } },
    { '@type': 'Service', '@id': url + '#service', name: ld[lang], serviceType: ld[lang], description: descr, url, provider, areaServed: { '@type': 'Country', name: lang === 'en' ? 'Italy' : 'Italia' }, audience: { '@type': 'BusinessAudience', audienceType: ld.pubblico[lang] } },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: home },
      { '@type': 'ListItem', position: 2, name: titolo, item: url } ] },
  ];
  if (faq.length) grafo.push({ '@type': 'FAQPage', '@id': url + '#faq', mainEntity: faq });
  const blocco = `<!-- JSONLD:INIZIO --><script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': grafo }).replace(/</g, '\\u003c')}</script><!-- JSONLD:FINE -->`;
  if (/<!-- JSONLD:INIZIO -->[\s\S]*?<!-- JSONLD:FINE -->/.test(html)) return html.replace(/<!-- JSONLD:INIZIO -->[\s\S]*?<!-- JSONLD:FINE -->/, () => blocco);
  return html.replace('</head>', () => blocco + '\n</head>');
}

// ---- Traduzione ----
function traduci(html, dict) {
  const pairs = [...dict.text].sort((a, b) => b[0].length - a[0].length);
  // separa gli script (dove si applicano solo le coppie js) dal markup
  const parts = html.split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>)/);
  for (let i = 0; i < parts.length; i += 2) {
    let p = parts[i];
    for (const [it, en] of pairs) {
      if (it === en) continue;
      const e = reEsc(it);
      p = p.replace(new RegExp(`(>\\s*)${e}(\\s*<)`, 'g'), (_, a, b) => a + en + b);
      p = p.replace(new RegExp(`(="\\s*)${e}(\\s*")`, 'g'), (_, a, b) => a + en.replace(/"/g, '&quot;') + b);
    }
    parts[i] = p;
  }
  let out = parts.join('');
  const mancanti = [];
  for (const [it, en] of dict.js || []) {
    if (!out.includes(it)) { mancanti.push(it.slice(0, 70)); continue; }
    out = out.split(it).join(en);
  }
  return { out, mancanti };
}

// Link relativi: pagine → versione inglese, risorse → percorso assoluto
function sistemaPercorsi(html) {
  const pagina = u => {
    const [p, h = ''] = u.split('#');
    if (p === '' ) return u;
    if (p === 'index.html') return '/en/' + (h ? '#' + h : '');
    return enPath('/' + p) + (h ? '#' + h : '');
  };
  html = html.replace(/(href|src)="(?!https?:|\/|#|mailto:|tel:|data:|javascript:)([^"]+)"/g, (m, attr, u) => {
    if (/\.(png|jpe?g|svg|webp|gif|mp4|css|js|ico|woff2?)$/i.test(u.split('#')[0])) return `${attr}="/${u}"`;
    return `${attr}="${pagina(u)}"`;
  });
  html = html.replace(/"ovia-hero\.mp4"/g, '"/ovia-hero.mp4"');
  html = html.replace(/'servizi\/([a-z0-9-]+\.html)'/g, "'/en/services/$1'");
  html = html.replace(/href="#"(\s+class="av-logo")/, 'href="/en/"$1');
  return html;
}

function residuiItaliani(html, dict) {
  const body = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '');
  const itSet = new Set(dict.text.filter(([it, en]) => it !== en).map(([it]) => it));
  const out = [];
  for (const t of body.match(/>([^<>]+)</g) || []) {
    const s = t.slice(1, -1).trim();
    if (s.length > 18 && (s.match(/\b(il|la|che|per|del|della|con|sono|tuo|tua|dei|delle|gli|nel)\b/g) || []).length > 1 && !/\b(the|and|your|you|with|for)\b/.test(s)) out.push(s.slice(0, 80));
    else if (itSet.has(s) && s.length > 3 && !/^(Ovia|OVIA|Home|Blog|FAQ|LinkedIn|Email \*)/.test(s)) out.push(s.slice(0, 80));
  }
  return [...new Set(out)];
}

export async function buildEnStatic({ log = console.log } = {}) {
  mkdirSync(ROOT + 'en', { recursive: true });
  for (const pg of PAGINE) {
    const src = ROOT + pg.file;
    let it = readFileSync(src, 'utf8');
    it = conSelettore(it, pg.kind, 'it', pg.itP);
    if (pg.ld) it = conJsonLd(it, 'it', pg.itP, pg.ld);
    writeFileSync(src, it);

    let en = it;
    if (pg.kind === 'home') en = en.replace(/<!-- FAQ:INIZIO[\s\S]*?<!-- FAQ:FINE -->/, () => bloccoHome('en'));
    const { out, mancanti } = traduci(en, pg.dict);
    en = out;
    en = sistemaPercorsi(en);
    en = conSelettore(en, pg.kind, 'en', pg.itP);
    const enP = enPath(pg.itP);
    en = en.replace('<html lang="it">', '<html lang="en">')
      .replace(/(<link rel="canonical" href=")[^"]+(")/, `$1${SITE}${enP}$2`)
      .replace(/(<meta property="og:url" content=")[^"]+(")/, `$1${SITE}${enP}$2`)
      .replace(/(<meta property="og:locale" content=")it_IT(")/, '$1en_GB$2');
    if (pg.ld) en = conJsonLd(en, 'en', pg.itP, pg.ld);
    if (pg.dict.note) en = en.replace(/(<a [^>]*class="legal-back"[^>]*>[\s\S]*?<\/a>)/, `$1\n    <p class="legal-box" style="margin:0 0 24px">${pg.dict.note}</p>`);
    writeFileSync(ROOT + (enP.endsWith('/') ? enP.slice(1) + 'index.html' : enP.slice(1)), en);
    const residui = residuiItaliani(en, pg.dict);
    if (mancanti.length || residui.length) {
      log(`  ⚠ ${enP}: ${mancanti.length} stringhe JS non trovate, ${residui.length} testi forse non tradotti`);
      mancanti.forEach(m => log('     JS  › ' + m));
      residui.slice(0, 12).forEach(r => log('     TXT › ' + r));
    }
  }
  log('✓ Pagine statiche EN generate (home, landing, legali)');
}

if (import.meta.url === `file://${process.argv[1]}`) await buildEnStatic();
