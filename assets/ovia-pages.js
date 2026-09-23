/* OVIA — interazioni condivise per pagine servizio e blog. Nessuna dipendenza. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sfondo a costellazione ---------- */
  var cv = document.getElementById('ov-constellation');
  if (cv && cv.getContext) {
    var ctx = cv.getContext('2d'), pts = [], W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var size = function () {
      W = window.innerWidth; H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(90, (W * H) / 16000));
      pts = [];
      for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .12, vy: (Math.random() - .5) * .12, r: Math.random() * 1.3 + .5 });
    };
    var draw = function () {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        if (!reduce) { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1; }
        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
          if (d < 16000) { ctx.strokeStyle = 'rgba(120,140,255,' + (0.14 * (1 - d / 16000)) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
        }
        ctx.fillStyle = 'rgba(140,160,255,0.75)'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      }
      if (!reduce) requestAnimationFrame(draw);
    };
    size(); draw(); window.addEventListener('resize', size);
  }

  /* ---------- Menu mobile + dropdown ---------- */
  var burger = document.querySelector('.ov-burger'), nav = document.querySelector('.ov-nav');
  if (burger && nav) burger.addEventListener('click', function () { var o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o); });
  document.querySelectorAll('.ov-dd > button').forEach(function (b) {
    b.addEventListener('click', function () { var o = b.parentNode.classList.toggle('open'); b.setAttribute('aria-expanded', o); });
  });

  /* ---------- Reveal on scroll ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll('[data-weight]').forEach(function (w) { w.style.width = w.getAttribute('data-weight') + '%'; });
      io.unobserve(e.target);
    });
  }, { threshold: .12 }) : null;
  document.querySelectorAll('.rv').forEach(function (el) { if (io) io.observe(el); else el.classList.add('in'); });
  if (!io) document.querySelectorAll('[data-weight]').forEach(function (w) { w.style.width = w.getAttribute('data-weight') + '%'; });

  /* ---------- Flow a step ---------- */
  document.querySelectorAll('[data-flow]').forEach(function (root) {
    var steps = [].slice.call(root.querySelectorAll('.sv-flow-step')), panels = [].slice.call(root.querySelectorAll('[data-flow-panel]'));
    var bar = root.querySelector('.sv-flow-progress i'), cur = 0, timer = null, touched = false;
    var show = function (i) {
      cur = i;
      steps.forEach(function (s, k) { s.setAttribute('aria-selected', k === i ? 'true' : 'false'); s.tabIndex = k === i ? 0 : -1; });
      panels.forEach(function (p, k) { p.hidden = k !== i; if (k === i) { p.classList.remove('fade'); void p.offsetWidth; p.classList.add('fade'); } });
      if (bar) bar.style.width = ((i + 1) / steps.length * 100) + '%';
    };
    steps.forEach(function (s, i) {
      s.addEventListener('click', function () { touched = true; clearInterval(timer); show(i); });
      s.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); touched = true; clearInterval(timer); show((cur + 1) % steps.length); steps[cur].focus(); }
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); touched = true; clearInterval(timer); show((cur - 1 + steps.length) % steps.length); steps[cur].focus(); }
      });
    });
    show(0);
    if (!reduce && io) {
      var o2 = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          clearInterval(timer);
          if (e.isIntersecting && !touched) timer = setInterval(function () { show((cur + 1) % steps.length); }, 4200);
        });
      }, { threshold: .4 });
      o2.observe(root);
    }
  });

  /* ---------- Prima / Dopo ---------- */
  document.querySelectorAll('.sv-ba').forEach(function (root) {
    var btns = root.querySelectorAll('.sv-toggle button'), items = root.querySelectorAll('.sv-ba-list li');
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var st = b.getAttribute('data-state'); root.setAttribute('data-state', st);
        btns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        items.forEach(function (li) { li.textContent = li.getAttribute('data-' + st); });
      });
    });
  });

  /* ---------- Tabs ---------- */
  document.querySelectorAll('[data-tabs]').forEach(function (root) {
    var tabs = root.querySelectorAll('[role=tab]'), panels = root.querySelectorAll('[role=tabpanel]');
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () {
        tabs.forEach(function (x, k) { x.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
        panels.forEach(function (p, k) { p.hidden = k !== i; });
      });
    });
  });

  /* ---------- Calcolatori (IT/EN) ---------- */
  var EN = (document.documentElement.lang || 'it').slice(0, 2) === 'en';
  var LOC = EN ? 'en-GB' : 'it-IT';
  var eur = function (n) { return new Intl.NumberFormat(LOC, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(n)); };
  var num = function (n, d) { return new Intl.NumberFormat(LOC, { maximumFractionDigits: d || 0 }).format(n); };
  var L = function (it, en) { return EN ? en : it; };
  var GIORNI = 220; // giorni lavorativi/anno
  var CALCS = {
    'second-brain': function (v) {
      var ore = v.persone * v.minuti / 60 * GIORNI, costo = ore * v.costo;
      return [[L('Ore/anno spese a cercare e ricostruire informazioni', 'Hours/year spent searching for and reconstructing information'), num(ore) + ' h'], [L('Costo annuo di quelle ore', 'Annual cost of those hours'), eur(costo)], [L('Recuperabile (stima prudente 40%)', 'Recoverable (conservative estimate 40%)'), eur(costo * .4), 1]];
    },
    'inbox': function (v) {
      var ore = v.persone * v.email * v.minuti / 60 * GIORNI, costo = ore * v.costo;
      return [[L('Ore/anno dedicate a leggere, smistare e rispondere', 'Hours/year spent reading, sorting and replying'), num(ore) + ' h'], [L('Costo annuo della casella', 'Annual cost of your inbox'), eur(costo)], [L('Recuperabile (stima prudente 35%)', 'Recoverable (conservative estimate 35%)'), eur(costo * .35), 1]];
    },
    'lead-generation': function (v) {
      var lead = v.lead * 12, oggi = lead * v.conv / 100, uplift = v.ore > 1 ? .3 : (v.ore > .25 ? .12 : .05);
      var extra = oggi * uplift;
      return [[L('Clienti acquisiti oggi in un anno', 'Clients won per year today'), num(oggi, 1)], [L('Clienti in più con risposta in minuti (stima prudente +', 'Extra clients with replies in minutes (conservative estimate +') + Math.round(uplift * 100) + '%)', '+' + num(extra, 1)], [L('Fatturato aggiuntivo stimato/anno', 'Estimated extra revenue/year'), eur(extra * v.valore), 1]];
    },
    'chiamate': function (v) {
      var ore = v.persone * v.chiamate * v.minuti / 60 * GIORNI, costo = ore * v.costo;
      return [[L('Ore/anno di note, riepiloghi e aggiornamenti post-chiamata', 'Hours/year of notes, summaries and post-call updates'), num(ore) + ' h'], [L('Costo annuo del lavoro post-chiamata', 'Annual cost of post-call work'), eur(costo)], [L('Recuperabile (stima prudente 60%)', 'Recoverable (conservative estimate 60%)'), eur(costo * .6), 1]];
    },
    'documenti': function (v) {
      var ore = v.clienti * v.solleciti * v.minuti / 60, costo = ore * v.costo;
      return [[L('Ore/anno spese a sollecitare e controllare documenti', 'Hours/year spent chasing and checking documents'), num(ore) + ' h'], [L('Costo annuo dei solleciti manuali', 'Annual cost of manual reminders'), eur(costo)], [L('Recuperabile (stima prudente 65%)', 'Recoverable (conservative estimate 65%)'), eur(costo * .65), 1]];
    },
    'siti-web-ai': function (v) {
      var persi = v.visite * v.quota / 100 * .58, contatti = persi * v.conv / 100 * 12;
      return [[L('Visite/mese a rischio per le risposte AI (−58% CTR, Ahrefs)', 'Visits/month at risk from AI answers (−58% CTR, Ahrefs)'), num(persi)], [L('Contatti/anno che rischi di non vedere', 'Contacts/year you risk never seeing'), num(contatti, 1)], [L('Valore potenziale in gioco/anno', 'Potential value at stake/year'), eur(contatti * v.chiusura / 100 * v.valore), 1]];
    },
    'crm': function (v) {
      var ore = v.persone * v.ore * 46, costo = ore * v.costo, persi = v.opp * 12 * v.valore * .1;
      return [[L('Ore/anno tra inserimento dati, fogli e aggiornamenti', 'Hours/year on data entry, spreadsheets and updates'), num(ore) + ' h'], [L('Costo annuo di quelle ore', 'Annual cost of those hours'), eur(costo)], [L('+ valore opportunità dimenticate (10%)', '+ value of forgotten opportunities (10%)'), eur(persi)], [L('Totale in gioco/anno', 'Total at stake/year'), eur(costo * .4 + persi), 1]];
    }
  };
  document.querySelectorAll('[data-calc]').forEach(function (root) {
    var id = root.getAttribute('data-calc'), fn = CALCS[id], out = root.querySelector('[data-calc-out]');
    if (!fn || !out) return;
    var inputs = root.querySelectorAll('input[type=range]');
    var run = function () {
      var v = {};
      inputs.forEach(function (i) {
        v[i.name] = parseFloat(i.value);
        var o = root.querySelector('output[for="' + i.id + '"]');
        if (o) o.textContent = (i.getAttribute('data-prefix') || '') + num(parseFloat(i.value), 2) + (i.getAttribute('data-suffix') || '');
      });
      var rows = fn(v), html = '';
      rows.forEach(function (r) { html += '<div class="row' + (r[2] ? ' hero' : '') + '"><span>' + r[0] + '</span><strong>' + r[1] + '</strong></div>'; });
      out.innerHTML = html;
    };
    inputs.forEach(function (i) { i.addEventListener('input', run); });
    run();
  });

  /* ---------- Blog: filtri e ricerca ---------- */
  var list = document.querySelector('[data-blog-list]');
  if (list) {
    var cards = [].slice.call(list.querySelectorAll('[data-cat]')), fBtns = document.querySelectorAll('.bl-filters button'), q = document.querySelector('.bl-search'), empty = document.querySelector('.bl-empty');
    var cat = 'tutti';
    var apply = function () {
      var term = (q && q.value || '').trim().toLowerCase(), shown = 0;
      cards.forEach(function (c) {
        var ok = (cat === 'tutti' || c.getAttribute('data-cat') === cat) && (!term || c.getAttribute('data-search').indexOf(term) > -1);
        c.style.display = ok ? '' : 'none'; if (ok) shown++;
      });
      if (empty) empty.style.display = shown ? 'none' : 'block';
    };
    fBtns.forEach(function (b) { b.addEventListener('click', function () { cat = b.getAttribute('data-f'); fBtns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); apply(); }); });
    if (q) q.addEventListener('input', apply);
    var pre = new URLSearchParams(location.search).get('c');
    if (pre) { var pb = document.querySelector('.bl-filters [data-f="' + pre + '"]'); if (pb) pb.click(); }
  }


  /* ---------- FAQ: ricerca e filtri ---------- */
  document.querySelectorAll('[data-faq]').forEach(function (root) {
    var qi = root.querySelector('.fq-search'), btns = root.querySelectorAll('.fq-filters button'), groups = root.querySelectorAll('.fq-group'), empty = root.querySelector('.bl-empty'), cat = 'tutti';
    var apply = function () {
      var term = (qi && qi.value || '').trim().toLowerCase(), shown = 0;
      groups.forEach(function (g) {
        var inCat = cat === 'tutti' || g.getAttribute('data-cat') === cat, n = 0;
        g.querySelectorAll('details').forEach(function (d) {
          var ok = inCat && (!term || d.getAttribute('data-search').indexOf(term) > -1);
          d.style.display = ok ? '' : 'none'; if (ok) n++;
          if (term && ok) d.open = true;
        });
        g.style.display = n ? '' : 'none'; shown += n;
      });
      if (empty) empty.style.display = shown ? 'none' : 'block';
    };
    btns.forEach(function (b) { b.addEventListener('click', function () { cat = b.getAttribute('data-f'); btns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); apply(); }); });
    if (qi) qi.addEventListener('input', apply);
    if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t && t.tagName === 'DETAILS') t.open = true; }
  });

  /* ---------- Articolo: barra di lettura + copia link ---------- */
  var prog = document.querySelector('.ar-progress');
  if (prog) {
    var art = document.querySelector('.ar-body');
    var upd = function () {
      var r = art.getBoundingClientRect(), total = r.height - window.innerHeight;
      prog.style.width = Math.max(0, Math.min(100, (-r.top) / Math.max(total, 1) * 100)) + '%';
    };
    window.addEventListener('scroll', upd, { passive: true }); upd();
  }
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(function () { b.textContent = EN ? 'Link copied ✓' : 'Link copiato ✓'; });
    });
  });
})();

/* ---------- Cal.com: popup "Prenota il tuo Process Check" ---------- */
(function (C, A, L) {
  var p = function (a, ar) { a.q.push(ar); }; var d = C.document;
  C.Cal = C.Cal || function () {
    var cal = C.Cal; var ar = arguments;
    if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement('script')).src = A; cal.loaded = true; }
    if (ar[0] === L) { var api = function () { p(api, arguments); }; var namespace = ar[1]; api.q = api.q || [];
      if (typeof namespace === 'string') { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ['initNamespace', namespace]); } else p(cal, ar); return; }
    p(cal, ar);
  };
})(window, 'https://app.cal.com/embed/embed.js', 'init');
Cal('init', 'ovia-check-process', { origin: 'https://cal.com' });
Cal.ns['ovia-check-process']('ui', { theme: 'dark', hideEventTypeDetails: false, layout: 'month_view' });
