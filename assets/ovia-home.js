/* =====================================================================
   OVIA — Homepage interattiva.
   Il pallino blu del logo significa "in attesa": ogni sistema Ovia prepara
   il lavoro e poi si ferma finché una persona non approva.
   1. Coda di approvazione (hero): tieni premuto il pallino per approvare.
   2. Monta il tuo sistema: percorso guidato in cinque pezzi, il pallino indica cosa fare.
   Pallino di chiusura e manifesto sono in ovia-pages.js (condivisi).
   Testi e scenari arrivano dal JSON #hx-data (generato da scripts/build-home.mjs).
   ===================================================================== */
const ovHome = () => {
  const src = document.getElementById('hx-data');
  if (!src) return;
  let D;
  try { D = JSON.parse(src.textContent); } catch { return; }

  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(r => setTimeout(r, RM ? Math.min(ms, 40) : ms));
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };

  const holdToApprove = window.ovHold;
  if (!holdToApprove) return;

  /* ---------- 0. Campo di puntini dietro l'apertura ----------
     Una griglia di puntini quasi invisibile. Il pallino "respira": ogni 3,2 secondi
     un'onda leggera parte da lui e attraversa la griglia. Il puntatore illumina i
     puntini vicini. Quando il visitatore approva, l'onda è blu.
     Si ferma fuori schermo e con le animazioni ridotte resta una griglia statica. */
  const field = (() => {
    const sec = document.querySelector('.hx'), cv = sec && sec.querySelector('.hx-field');
    const origin = sec && sec.querySelector('[data-hx-dot]');
    if (!cv || !origin || !cv.getContext) return { pulse() {} };
    const ctx = cv.getContext('2d');
    const GAP = 26, SPEED = 300, SIGMA = 44, PERIOD = 3200, HALO = 120;
    const css = getComputedStyle(sec);
    const FIELD = (css.getPropertyValue('--field-rgb') || '11,12,16').trim(), WAVE = (css.getPropertyValue('--wave-rgb') || '0,51,255').trim();
    const onBlue = FIELD.startsWith('255');
    let W = 0, H = 0, pts = new Float32Array(0), ox = 0, oy = 0, maxR = 1;
    let mx = -1e4, my = -1e4, mI = 0, mTarget = 0, waves = [], raf = 0, onScreen = true, lastAmbient = 0;
    const size = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1), r = sec.getBoundingClientRect();
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const list = [], offx = (W % GAP) / 2, offy = (H % GAP) / 2;
      for (let y = offy; y <= H; y += GAP) for (let x = offx; x <= W; x += GAP) list.push(x, y);
      pts = new Float32Array(list);
      const d = origin.getBoundingClientRect();
      ox = d.left + d.width / 2 - r.left; oy = d.top + d.height / 2 - r.top;
      maxR = Math.hypot(Math.max(ox, W - ox), Math.max(oy, H - oy)) + SIGMA * 2;
    };
    const draw = now => {
      ctx.clearRect(0, 0, W, H);
      mI += (mTarget - mI) * 0.08;
      const live = [];
      for (const w of waves) { const rr = (now - w.t0) / 1000 * SPEED; if (rr < maxR) live.push([rr, w.a * (1 - rr / maxR), w.blue]); }
      waves = waves.filter(w => (now - w.t0) / 1000 * SPEED < maxR);
      const s2 = 2 * SIGMA * SIGMA, h2 = 2 * HALO * HALO;
      for (let i = 0; i < pts.length; i += 2) {
        const x = pts[i], y = pts[i + 1];
        const d = Math.hypot(x - ox, y - oy);
        let I = 0, B = 0;
        for (let k = 0; k < live.length; k++) {
          const dd = d - live[k][0];
          if (dd > 3 * SIGMA || dd < -3 * SIGMA) continue;
          const g = Math.exp(-dd * dd / s2) * live[k][1];
          I += g; if (live[k][2]) B += g;
        }
        if (mI > 0.01) { const mdx = x - mx, mdy = y - my; I += Math.exp(-(mdx * mdx + mdy * mdy) / h2) * 0.7 * mI; }
        if (I > 1) I = 1;
        const rad = 0.85 + 1.15 * I;
        if (B > 0.04) {
          ctx.fillStyle = 'rgba(' + WAVE + ',' + Math.min(0.95, 0.25 + B).toFixed(3) + ')';
        } else {
          ctx.fillStyle = 'rgba(' + FIELD + ',' + ((onBlue ? 0.16 : 0.08) + (onBlue ? 0.5 : 0.34) * I).toFixed(3) + ')';
        }
        ctx.beginPath(); ctx.arc(x, y, rad, 0, 6.2832); ctx.fill();
      }
    };
    const loop = now => {
      raf = 0;
      if (!onScreen || document.hidden) return;
      if (now - lastAmbient > PERIOD) { waves.push({ t0: now, a: 0.55, blue: false }); lastAmbient = now; }
      draw(now);
      raf = requestAnimationFrame(loop);
    };
    const start = () => { if (!raf && !RM) raf = requestAnimationFrame(loop); };
    size();
    if (RM) { draw(performance.now()); }
    addEventListener('resize', () => { size(); if (RM) draw(performance.now()); });
    if ('ResizeObserver' in window) new ResizeObserver(() => { size(); if (RM) draw(performance.now()); }).observe(sec);
    if (!RM) {
      sec.addEventListener('pointermove', e => {
        if (e.pointerType !== 'mouse') return;
        const r = sec.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; mTarget = 1;
      });
      sec.addEventListener('pointerleave', () => { mTarget = 0; });
      document.addEventListener('visibilitychange', start);
      // parte quando il browser è libero, così non pesa sul caricamento
      (window.requestIdleCallback || (f => setTimeout(f, 400)))(() => {
        if ('IntersectionObserver' in window) new IntersectionObserver(es => { onScreen = es[0].isIntersecting; start(); }).observe(sec);
        start();
      }, { timeout: 1500 });
      draw(performance.now());
    }
    return { pulse() { if (RM) return; waves.push({ t0: performance.now(), a: 1, blue: true }); start(); } };
  })();


  /* ---------- Video "come funziona" (finestra modale) ---------- */
  const film = document.getElementById('ov-film'), filmBtn = document.querySelector('[data-film]');
  if (film && filmBtn && film.showModal) {
    const v = film.querySelector('video');
    filmBtn.addEventListener('click', () => { film.showModal(); v.currentTime = 0; const pr = v.play(); if (pr) pr.catch(() => {}); });
    film.addEventListener('close', () => { v.pause(); filmBtn.focus({ preventScroll: true }); });
    film.querySelector('[data-film-close]').addEventListener('click', () => film.close());
    film.addEventListener('click', e => { if (e.target === film) film.close(); });
    v.addEventListener('ended', () => setTimeout(() => film.open && film.close(), 600));
  } else if (filmBtn) filmBtn.hidden = true;

  /* ---------- La mattina di uno studio (racconto guidato dallo scroll) ----------
     Lo sfondo mostra il lavoro reale dello studio: arriva tutto insieme (forme = canali),
     Ovia lo collega ai clienti, lo trasforma in bozze, poi le mette in coda accanto al
     pallino. Nell'ultimo passo le bozze vengono approvate una alla volta mentre si scorre.
     Tutto dipende dalla posizione di scroll: avanti e indietro, il racconto si riavvolge. */
  (() => {
    const sec = document.querySelector('[data-story]');
    if (!sec || !D.story) return;
    const pin = sec.querySelector('.st-pin'), cv = sec.querySelector('.st-cv');
    if (!cv.getContext) return;
    const ctx = cv.getContext('2d');
    const lis = [...sec.querySelectorAll('.st-steps li')], bars = [...sec.querySelectorAll('.st-bar i')];
    const S = D.story, NC = 4, N = 136;
    const INK = '11,12,16', BLUE = '0,51,255';
    let rnd = 7;
    const rand = () => { rnd = (rnd * 16807) % 2147483647; return (rnd - 1) / 2147483646; };
    const P = Array.from({ length: N }, (_, i) => ({ c: i % NC, type: Math.floor(rand() * 4), seed: rand() * 6.28, j: Math.floor(i / NC) }));
    const perC = Math.ceil(N / NC);
    let W = 0, H = 0, R = null, T0 = [], T1 = [], T2 = [], T3 = [], cards2 = [], cards3 = [], dotP = null, mobile = false;
    const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const lines = (box, j) => {
      // le bozze sono "testo": righe di puntini di lunghezza decrescente
      const pad = 14, top = box.y + 38, gap = 7.5, cols = Math.max(6, Math.min(15, Math.floor((box.w - pad * 2) / gap)));
      const widths = [1, .86, .62, .9, .4];
      let k = j, row = 0;
      while (row < 8) { const n = Math.max(3, Math.floor(cols * widths[row % widths.length])); if (k < n) return [box.x + pad + k * gap + 3, top + row * 11]; k -= n; row++; }
      return [box.x + pad, top];
    };
    const layout = () => {
      const r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height; mobile = W < 861;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const wrap = Math.min(1200, W) , left = (W - wrap) / 2 + (mobile ? 16 : 40);
      R = RM ? { x: mobile ? 16 : left, y: H * .06, w: Math.min(W - (mobile ? 32 : left * 2), 860), h: H * .88 } : mobile ? { x: 16, y: H * .44, w: W - 32, h: H * .52 } : { x: left + 470, y: H * .1, w: Math.min(W - (left + 470) - 24, 700), h: H * .8 };
      rnd = 11;
      T0 = P.map(() => [R.x + rand() * R.w, R.y + rand() * R.h]);
      const cx = [R.x + R.w * .26, R.x + R.w * .74, R.x + R.w * .26, R.x + R.w * .74], cy = [R.y + R.h * .28, R.y + R.h * .28, R.y + R.h * .74, R.y + R.h * .74];
      T1 = P.map(p => { const a = p.j * 2.39996, rr = 5.2 * Math.sqrt(p.j + 1); return [cx[p.c] + Math.cos(a) * rr, cy[p.c] + Math.sin(a) * rr]; });
      const cw = R.w * .44, ch = Math.min(118, R.h * .36);
      cards2 = cx.map((x, i) => ({ x: x - cw / 2, y: cy[i] - ch / 2, w: cw, h: ch }));
      T2 = P.map(p => lines(cards2[p.c], p.j));
      const qw = R.w * (mobile ? .64 : .6), qh = Math.min(mobile ? 88 : 90, (R.h - 3 * 12) / 4), qx = R.x, qy = R.y + (R.h - (4 * qh + 3 * 12)) / 2;
      cards3 = [0, 1, 2, 3].map(i => ({ x: qx, y: qy + i * (qh + 12), w: qw, h: qh }));
      T3 = P.map(p => lines(cards3[p.c], p.j));
      const dr = mobile ? Math.min((R.w - qw) * .26, 34) : Math.min(R.w * .13, 58);
      dotP = { x: R.x + qw + (R.w - qw) / 2, y: R.y + R.h / 2, r: dr };
    };
    const progress = () => {
      const r = sec.getBoundingClientRect(), top = pin.offsetTop === 0 ? 0 : 0;
      const head = mobile ? 64 : 72, total = sec.offsetHeight - pin.offsetHeight;
      return clamp((head - r.top) / Math.max(1, total), 0, 1);
    };
    const seg = (p, s) => ease(clamp((p - (s + .55) / 5) / (.45 / 5), 0, 1));
    const fit = (t, mw) => { if (ctx.measureText(t).width <= mw) return t; while (t.length > 1 && ctx.measureText(t + '…').width > mw) t = t.slice(0, -1); return t.trimEnd() + '…'; };
    const roundRect = (x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
    const shape = (type, x, y, s) => {
      ctx.beginPath();
      if (type === 0) ctx.arc(x, y, s, 0, 6.2832);
      else if (type === 1) ctx.rect(x - s, y - s, s * 2, s * 2);
      else if (type === 2) { ctx.moveTo(x, y - s * 1.2); ctx.lineTo(x + s * 1.1, y + s * .9); ctx.lineTo(x - s * 1.1, y + s * .9); ctx.closePath(); }
      else { ctx.moveTo(x, y - s * 1.25); ctx.lineTo(x + s * 1.25, y); ctx.lineTo(x, y + s * 1.25); ctx.lineTo(x - s * 1.25, y); ctx.closePath(); }
      ctx.fill();
    };
    let lastStep = -1;
    const draw = now => {
      const p = RM ? .9 : progress(), tm = now / 1000;
      const step = Math.min(4, Math.floor(p * 5));
      if (step !== lastStep) { lis.forEach((li, i) => li.classList.toggle('is-on', i === step)); lastStep = step; }
      bars.forEach((b, i) => b.style.setProperty('--f', clamp(p * 5 - i, 0, 1).toFixed(3)));
      const a1 = seg(p, 0), a2 = seg(p, 1), a3 = seg(p, 2);
      const appr = clamp((p - .82) / .15, 0, 1) * 4; // bozze approvate (0..4)
      ctx.clearRect(0, 0, W, H);
      // carte (bozze), poi coda
      const cardAlpha = a2 * (1 - 0) ;
      if (a2 > .01) {
        for (let i = 0; i < NC; i++) {
          const A = cards2[i], B = cards3[i];
          const x = A.x + (B.x - A.x) * a3, y = A.y + (B.y - A.y) * a3, w = A.w + (B.w - A.w) * a3, h = A.h + (B.h - A.h) * a3;
          const done = appr > i + .5;
          ctx.globalAlpha = a2;
          roundRect(x, y, w, h, 8); ctx.fillStyle = '#fff'; ctx.fill();
          ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(' + INK + ',' + (done ? .1 : .16) + ')'; ctx.stroke();
          ctx.fillStyle = 'rgba(' + INK + ',.92)'; ctx.font = (mobile ? '600 12px' : '600 13px') + ' "Instrument Sans", sans-serif'; ctx.textBaseline = 'alphabetic';
          ctx.fillText(fit(S.cards[i], w - 28 - (mobile ? 78 : 96) * a3), x + 14, y + 24);
          if (a3 > .02) {
            const lab = done ? S.ok : S.wait; ctx.font = '600 11.5px "Instrument Sans", sans-serif';
            const tw = ctx.measureText(lab).width + 26, px = x + w - tw - 10, py = y + 10;
            ctx.globalAlpha = a2 * a3;
            roundRect(px, py, tw, 20, 10); ctx.fillStyle = done ? 'rgba(' + INK + ',1)' : 'rgba(' + BLUE + ',.1)'; ctx.fill();
            ctx.fillStyle = done ? '#fff' : 'rgba(' + BLUE + ',1)';
            ctx.beginPath(); ctx.arc(px + 10, py + 10, 3, 0, 6.2832); ctx.fill();
            ctx.fillText(lab, px + 18, py + 14);
            // filo tra la bozza e il pallino
            if (!done) { ctx.globalAlpha = a2 * a3 * .5; ctx.setLineDash([3, 4]); ctx.strokeStyle = 'rgba(' + BLUE + ',1)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + w, y + h / 2); ctx.lineTo(dotP.x - dotP.r - 8, dotP.y); ctx.stroke(); ctx.setLineDash([]); }
          }
          ctx.globalAlpha = 1;
        }
      }
      // nomi dei clienti mentre il lavoro si raggruppa
      const lab1 = a1 * (1 - a2);
      if (lab1 > .01) {
        ctx.globalAlpha = lab1; ctx.fillStyle = 'rgba(' + INK + ',.85)'; ctx.font = '600 13px "Instrument Sans", sans-serif'; ctx.textAlign = 'center';
        for (let i = 0; i < NC; i++) { const c = cards2[i]; ctx.fillText(S.clients[i], c.x + c.w / 2, c.y - 8); }
        ctx.textAlign = 'left'; ctx.globalAlpha = 1;
      }
      // il pallino
      if (a3 > .01) {
        const calm = clamp(appr - 3, 0, 1), pr = dotP.r * (.6 + .4 * a3) * (1 - .45 * calm);
        const all = appr >= 3.99;
        ctx.globalAlpha = a3;
        if (!RM && calm < 1) for (let k = 0; k < 2; k++) { const ph = ((tm * .31 + k * .5) % 1); ctx.beginPath(); ctx.arc(dotP.x, dotP.y, pr * (1 + ph * .5), 0, 6.2832); ctx.strokeStyle = 'rgba(' + BLUE + ',' + (.4 * (1 - ph) * (1 - calm)).toFixed(3) + ')'; ctx.lineWidth = 1; ctx.stroke(); }
        ctx.beginPath(); ctx.arc(dotP.x, dotP.y, pr, 0, 6.2832); ctx.fillStyle = 'rgba(' + BLUE + ',1)'; ctx.fill();
        ctx.fillStyle = 'rgba(' + INK + ',.75)'; ctx.font = (mobile ? '600 11.5px' : '600 13px') + ' "Instrument Sans", sans-serif'; ctx.textAlign = 'center';
        const cnt = S.count.replace('{n}', Math.floor(appr + .0001)), ty = dotP.y + dotP.r * 1.5 + 18;
        if (mobile) { const [a, b] = cnt.split(/ (?=appr)/); ctx.fillText(a, dotP.x, ty); if (b) ctx.fillText(b, dotP.x, ty + 15); } else ctx.fillText(cnt, dotP.x, ty);
        ctx.textAlign = 'left'; ctx.globalAlpha = 1;
        if (!all) {}
      }
      // il lavoro: forme = canali
      for (let i = 0; i < N; i++) {
        const q = P[i];
        let x = T0[i][0], y = T0[i][1];
        const wob = (1 - a1);
        x += Math.sin(tm * .9 + q.seed) * 7 * wob; y += Math.cos(tm * .7 + q.seed * 1.3) * 5 * wob;
        x += (T1[i][0] - x) * a1; y += (T1[i][1] - y) * a1;
        x += (T2[i][0] - x) * a2; y += (T2[i][1] - y) * a2;
        x += (T3[i][0] - x) * a3; y += (T3[i][1] - y) * a3;
        const done = appr > q.c + .5;
        const s = 2.6 - a2 * 0.8;
        if (a3 > .3 && !done) ctx.fillStyle = 'rgba(' + BLUE + ',' + (.55 + .35 * a3).toFixed(3) + ')';
        else ctx.fillStyle = 'rgba(' + INK + ',' + (done ? .28 : .78 - .25 * a2).toFixed(3) + ')';
        if (a2 > .6) { ctx.beginPath(); ctx.arc(x, y, 1.8, 0, 6.2832); ctx.fill(); }
        else shape(q.type, x, y, s);
      }
    };
    let raf = 0, on = false;
    const loop = now => { raf = 0; if (!on) return; draw(now); raf = requestAnimationFrame(loop); };
    const start = () => { if (!raf && on) raf = requestAnimationFrame(loop); };
    const go = () => { layout(); draw(performance.now()); };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(go);
    go();
    addEventListener('resize', go);
    if (RM) return;
    if ('IntersectionObserver' in window) new IntersectionObserver(es => { on = es[0].isIntersecting; start(); }).observe(sec);
    else { on = true; start(); }
  })();

  /* ---------- 1. Coda di approvazione ---------- */
  const stage = document.querySelector('[data-hx-stage]');
  if (stage) {
    const Q = D.q;
    const queue = stage.querySelector('[data-hx-queue]');
    const dot = stage.querySelector('[data-hx-dot]');
    const press = dot.parentElement;
    const ring = dot.querySelector('circle');
    const nEl = stage.querySelector('[data-hx-n]');
    const cEl = stage.querySelector('[data-hx-count]');
    const C = 2 * Math.PI * 57;
    let next = 3, approved = 0, refill = 0;

    ring.style.strokeDasharray = C;
    ring.style.strokeDashoffset = C;
    queue.dataset.empty = Q.empty;

    const live = () => [...queue.querySelectorAll('.hx-card:not(.is-done)')];
    const layout = () => {
      const cs = live();
      cs.forEach((c, i) => {
        c.style.setProperty('--i', i);
        c.classList.toggle('is-top', i === 0);
        c.setAttribute('aria-hidden', i ? 'true' : 'false');
      });
      nEl.textContent = cs.length;
      stage.classList.toggle('is-empty', cs.length === 0);
      dot.setAttribute('aria-disabled', cs.length ? 'false' : 'true');
    };
    const card = ([k, t, m]) => {
      const li = el('li', 'hx-card is-in');
      li.append(el('span', 'k', `${Q.by} · ${k}`), el('strong', '', t), el('span', 'm', m), el('em', 'st', Q.pending));
      return li;
    };
    const add = () => {
      refill = 0;
      if (live().length >= 3) return;
      const li = card(Q.pool[next++ % Q.pool.length]);
      li.style.setProperty('--i', live().length);
      queue.append(li);
      requestAnimationFrame(() => requestAnimationFrame(() => { li.classList.remove('is-in'); layout(); }));
      if (live().length < 3) refill = setTimeout(add, 2600);
    };
    const burst = () => {
      if (RM) return;
      const b = el('span', 'hx-burst');
      press.append(b);
      setTimeout(() => b.remove(), 1000);
    };

    layout();
    holdToApprove(dot, {
      ms: 850,
      onProgress: p => { ring.style.strokeDashoffset = C * (1 - p); },
      onDone: () => {
        const top = live()[0];
        ring.style.strokeDashoffset = C;
        if (!top) return;
        top.classList.add('is-done', 'is-ok');
        top.querySelector('.st').textContent = Q.ok;
        nEl.textContent = live().length;
        setTimeout(() => { top.classList.add('is-out'); top.setAttribute('aria-hidden', 'true'); setTimeout(layout, RM ? 0 : 220); }, RM ? 0 : 480);
        setTimeout(() => top.remove(), RM ? 50 : 1100);
        burst();
        field.pulse();
        dot.classList.remove('is-go'); void dot.offsetWidth; dot.classList.add('is-go');
        approved++;
        cEl.textContent = approved === 1 ? Q.count1 : Q.countN.replace('{n}', approved);
        if (!refill) refill = setTimeout(add, live().length ? 2200 : 1400);
      },
    });

    // Il pallino segue appena il puntatore (solo mouse).
    if (!RM && matchMedia('(hover: hover)').matches) {
      let raf = 0, mx = 0, my = 0;
      stage.addEventListener('pointermove', e => {
        if (e.pointerType !== 'mouse' || dot.classList.contains('is-holding')) return;
        const r = press.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy) || 1, k = Math.min(10, d * .05) / d;
        mx = dx * k; my = dy * k;
        if (!raf) raf = requestAnimationFrame(() => { raf = 0; dot.style.setProperty('--mx', mx + 'px'); dot.style.setProperty('--my', my + 'px'); });
      });
      stage.addEventListener('pointerleave', () => { dot.style.setProperty('--mx', '0px'); dot.style.setProperty('--my', '0px'); });
    }
  }

  /* ---------- 2. Monta il tuo sistema (percorso guidato) ----------
     Cinque pezzi, montati dal visitatore uno alla volta: studio, arriva, legge,
     prepara, decidi tu. Il pallino blu (la "guida") si posa sempre su ciò che
     tocca fare adesso: è lo stesso significato del logo, "in attesa di te".
     Ogni pezzo montato si incastra nella barra in alto, come in un modellino. */
  const kit = document.querySelector('[data-kit]');
  if (kit && D.kit) {
    const K = D.kit;
    const parts = [...kit.querySelectorAll('.kit-parts > li:not(.kit-line)')];
    const gN = kit.querySelector('[data-kit-n]'), gH = kit.querySelector('[data-kit-h]'), gP = kit.querySelector('[data-kit-p]');
    const reset = kit.querySelector('[data-kit-reset]');
    const bench = kit.querySelector('[data-kit-bench]');
    const HOVER = matchMedia('(hover: hover) and (pointer: fine)').matches;
    bench.textContent = '';
    const stage = el('div', 'kit-stage'), cue = el('span', 'kit-cue');
    cue.setAttribute('aria-hidden', 'true'); cue.hidden = true;
    bench.append(stage, cue);
    let run = 0, st = null, t0 = 0, kb = false, cueOn = null, demoOn = null;
    addEventListener('keydown', e => { if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ') kb = true; }, true);
    addEventListener('pointerdown', () => { kb = false; }, true);

    const guide = (i, h, p) => {
      gN.textContent = i < 5 ? K.piece.replace('{n}', i + 1) : K.doneTag;
      gH.textContent = h; gP.textContent = p;
      reset.hidden = i === 0;
      parts.forEach((li, j) => li.classList.toggle('is-cur', j === i));
    };
    const mount = i => {
      parts[i].classList.remove('is-cur');
      parts[i].classList.add('is-on');
      kit.style.setProperty('--kf', (i / 4).toFixed(3));
    };
    // la guida: un pallino che si posa sull'angolo di ciò che tocca fare
    const place = () => {
      if (demoOn) return demo(...demoOn);
      if (!cueOn || !cueOn.isConnected) { cue.hidden = true; return; }
      const B = bench.getBoundingClientRect(), r = cueOn.getBoundingClientRect();
      cue.hidden = false;
      cue.style.transform = `translate(${Math.round(r.right - B.left - 9)}px, ${Math.round(r.top - B.top - 5)}px)`;
    };
    const point = target => { demoOn = null; cue.classList.remove('is-drag'); cueOn = target; place(); };
    const hideCue = () => { cueOn = null; demoOn = null; cue.classList.remove('is-drag'); cue.hidden = true; };
    // mostra il gesto da fare: il pallino va dall'email fino a Ovia, e ricomincia
    const demo = (a, b) => {
      demoOn = [a, b]; cueOn = null;
      if (!a.isConnected) { hideCue(); return; }
      const B = bench.getBoundingClientRect(), r1 = a.getBoundingClientRect(), r2 = b.getBoundingClientRect();
      cue.hidden = false;
      if (RM) { cue.style.transform = `translate(${Math.round(r1.right - B.left - 9)}px, ${Math.round(r1.top - B.top - 5)}px)`; return; }
      cue.style.setProperty('--x0', Math.round(r1.left + r1.width / 2 - B.left - 7) + 'px');
      cue.style.setProperty('--y0', Math.round(r1.top + r1.height / 2 - B.top - 7) + 'px');
      cue.style.setProperty('--x1', Math.round(r2.left + r2.width / 2 - B.left - 7) + 'px');
      cue.style.setProperty('--y1', Math.round(r2.top + r2.height / 2 - B.top - 7) + 'px');
      if (!cue.classList.contains('is-drag')) cue.classList.add('is-drag');
    };
    addEventListener('resize', () => requestAnimationFrame(place));
    const clear = () => { stage.textContent = ''; hideCue(); };
    // Dopo ogni gesto il passo successivo deve essere sotto gli occhi: sul telefono
    // la guida va in cima allo schermo, altrimenti si scorre solo quanto serve.
    const NARROW = matchMedia('(max-width: 900px)');
    const show = target => {
      if (!target || !target.isConnected) return;
      const head = innerWidth <= 760 ? 64 : 72, r = target.getBoundingClientRect();
      if (r.top >= head + 8 && r.bottom <= innerHeight - 16) return;
      const g = kit.querySelector('.kit-guide').getBoundingClientRect();
      let dy = NARROW.matches ? g.top - head - 8 : r.bottom - innerHeight + 32;
      if (r.top - dy < head + 8) dy = r.top - head - 16;
      scrollBy({ top: dy, behavior: RM ? 'auto' : 'smooth' });
      setTimeout(place, RM ? 0 : 520);
    };
    const focusFirst = () => { if (!kb) return; const f = stage.querySelector('button:not([disabled])'); if (f) f.focus({ preventScroll: true }); };
    const typeWords = async (node, text, alive) => {
      node.classList.add('is-typing');
      if (RM) { node.textContent = text; node.classList.remove('is-typing'); return; }
      const words = text.split(' ');
      node.textContent = '';
      for (let k = 0; k < words.length; k++) {
        if (!alive()) return;
        node.textContent += (k ? ' ' : '') + words[k];
        await wait(18 + Math.random() * 22);
      }
      node.classList.remove('is-typing');
    };

    // Pezzo 1: che studio hai?
    function s0() {
      const id = ++run; st = null;
      parts.forEach(li => li.classList.remove('is-on', 'is-cur'));
      kit.classList.remove('is-wait', 'is-done'); kit.style.setProperty('--kf', 0);
      clear(); guide(0, K.s0.h, K.s0.p);
      const box = el('div', 'kit-choices');
      K.studios.forEach(sd => {
        const b = el('button', 'kit-choice'); b.type = 'button';
        b.append(el('strong', '', sd.name), el('span', '', sd.sub));
        b.addEventListener('click', () => {
          if (id !== run || st) return;
          st = sd; t0 = performance.now();
          b.classList.add('is-pick'); box.classList.add('is-picked'); hideCue();
          mount(0);
          setTimeout(() => s1(id), RM ? 0 : 450);
        });
        box.append(b);
      });
      stage.append(box);
      point(box.firstChild); focusFirst();
    }

    // Pezzo 2: arriva. Trascina l'email dentro Ovia (o toccala).
    function s1(id) {
      if (id !== run) return;
      clear(); guide(1, HOVER ? K.s1.h : K.s1.hTouch, K.s1.p);
      const m = st.mail;
      const wrap = el('div', 'kit-drop');
      const card = el('button', 'kit-mail'); card.type = 'button'; card.setAttribute('aria-label', K.s1.sr);
      const top = el('span', 'kit-mail-top'); top.append(el('b', '', m.ch), el('span', '', m.time));
      card.append(top, el('strong', '', m.from), el('span', 'kit-mail-t', m.text.map(x => typeof x === 'string' ? x : x[0]).join('')));
      const drop = el('div', 'kit-in');
      drop.append(el('span', 'kit-in-o', 'ovia'), el('span', 'kit-in-t', K.s1.drop));
      wrap.append(card, drop); stage.append(wrap);
      show(drop);
      requestAnimationFrame(() => { if (id === run) demo(card, drop); });
      if (kb) card.focus({ preventScroll: true });

      let done = false, drag = false, dx = 0, dy = 0, x0 = 0, y0 = 0, moved = 0;
      const over = e => { const r = drop.getBoundingClientRect(); return e.clientX > r.left - 24 && e.clientX < r.right + 24 && e.clientY > r.top - 24 && e.clientY < r.bottom + 24; };
      const accept = () => {
        if (done || id !== run) return;
        done = true; hideCue();
        const a = card.getBoundingClientRect(), b = drop.getBoundingClientRect();
        const tx = dx + (b.left + b.width / 2) - (a.left + a.width / 2), ty = dy + (b.top + b.height / 2) - (a.top + a.height / 2);
        card.classList.add('is-in');
        card.style.transition = RM ? 'none' : 'transform .5s cubic-bezier(.4,0,.2,1), opacity .45s .1s';
        card.style.transform = `translate(${tx}px, ${ty}px) scale(.18)`;
        card.style.opacity = '0';
        drop.classList.add('is-got');
        drop.querySelector('.kit-in-t').textContent = K.s1.got;
        setTimeout(() => { if (id !== run) return; mount(1); setTimeout(() => s2(id), RM ? 0 : 520); }, RM ? 0 : 420);
      };
      card.addEventListener('pointerdown', e => {
        if (done || e.button > 0) return;
        drag = true; moved = 0; x0 = e.clientX; y0 = e.clientY;
        try { card.setPointerCapture(e.pointerId); } catch (x) {}
        card.style.transition = 'none'; card.classList.add('is-drag'); hideCue();
      });
      card.addEventListener('pointermove', e => {
        if (!drag) return;
        dx = e.clientX - x0; dy = e.clientY - y0; moved = Math.max(moved, Math.hypot(dx, dy));
        card.style.transform = `translate(${dx}px, ${dy}px) rotate(${Math.max(-3, Math.min(3, dx / 50)).toFixed(2)}deg) scale(.86)`;
        drop.classList.toggle('is-over', over(e));
      });
      const up = e => {
        if (!drag) return;
        drag = false; card.classList.remove('is-drag'); drop.classList.remove('is-over');
        if (moved < 8 || over(e)) return accept();
        card.style.transition = 'transform .45s cubic-bezier(.2,.7,.2,1)'; card.style.transform = ''; dx = dy = 0;
        setTimeout(() => { if (!done && id === run) demo(card, drop); }, 480);
      };
      card.addEventListener('pointerup', up);
      card.addEventListener('pointercancel', () => { drag = false; card.classList.remove('is-drag'); card.style.transform = ''; dx = dy = 0; });
      card.addEventListener('click', e => { if (e.detail === 0) accept(); });
    }

    // Pezzo 3: legge. Le parole sottolineate rivelano cosa capisce Ovia.
    function s2(id) {
      if (id !== run) return;
      clear(); guide(2, HOVER ? K.s2.h : K.s2.hTouch, K.s2.p);
      const g = el('div', 'kit-read'), left = el('div', 'kit-read-l'), msg = el('p', 'kit-text'), words = [];
      const head = el('p', 'kit-mhead'); head.append(el('b', '', st.mail.ch), el('span', '', `${st.mail.from} · ${st.mail.time}`));
      st.mail.text.forEach(x => {
        if (typeof x === 'string') { msg.append(x); return; }
        const w = el('button', 'kit-w', x[0]); w.type = 'button'; w.dataset.f = x[1];
        words.push(w); msg.append(w);
      });
      const dl = el('dl', 'kit-fields');
      const rows = st.fields.map(([k]) => { const r = el('div'); r.append(el('dt', '', k), el('dd')); dl.append(r); return r; });
      left.append(head, msg); g.append(left, dl); stage.append(g);
      let finished = false;
      const hit = w => {
        if (id !== run || finished || w.classList.contains('is-hit')) return;
        const f = +w.dataset.f, r = rows[f];
        w.classList.add('is-hit'); r.classList.add('is-hit');
        r.querySelector('dd').textContent = st.fields[f][1];
        const next = words.find(x => !x.classList.contains('is-hit'));
        if (next) { point(next); if (kb && document.activeElement === w) next.focus({ preventScroll: true }); return; }
        finished = true; hideCue();
        left.append(el('p', 'kit-ok is-new', K.s2.linked));
        mount(2);
        setTimeout(() => s3(id), RM ? 0 : 1200);
      };
      words.forEach(w => {
        w.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hit(w); });
        w.addEventListener('click', () => hit(w));
      });
      show(dl); point(words[0]); if (kb) words[0].focus({ preventScroll: true });
    }

    // Pezzo 4: prepara. Il visitatore sceglie il tono, Ovia scrive.
    function s3(id) {
      if (id !== run) return;
      clear(); guide(3, K.s3.h, K.s3.p);
      const w = el('div', 'kit-write');
      const tone = el('div', 'kit-tone'); tone.setAttribute('role', 'radiogroup'); tone.setAttribute('aria-label', K.s3.toneLabel);
      const draft = el('p', 'kit-draft'); draft.dataset.empty = K.s3.empty;
      let typing = 0, ready = false;
      const btns = K.s3.tones.map((t, j) => {
        const b = el('button', '', t); b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', 'false');
        b.addEventListener('click', () => pick(j));
        tone.append(b); return b;
      });
      w.append(el('p', 'kit-ctx', st.ctx), tone, draft); stage.append(w);
      const pick = async j => {
        if (id !== run || kit.classList.contains('is-done')) return;
        btns.forEach((b, k) => b.setAttribute('aria-checked', String(k === j)));
        draft.setAttribute('contenteditable', 'false');
        if (!ready) hideCue();
        const my = ++typing;
        await typeWords(draft, st.drafts[j], () => my === typing && id === run);
        if (my !== typing || id !== run || ready) return;
        ready = true; mount(3);
        await wait(450); if (id === run) s4(id, w, draft);
      };
      show(draft); point(btns[0]); focusFirst();
    }

    // Pezzo 5: decidi tu. Il sistema si ferma e aspetta il pallino.
    function s4(id, w, draft) {
      guide(4, K.s4.h, K.s4.p);
      kit.classList.add('is-wait');
      const act = el('div', 'kit-act is-new');
      const hb = el('button', 'kit-hold'); hb.type = 'button';
      hb.innerHTML = '<span class="kit-hold-dot"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22.5"/></svg></span>';
      hb.append(el('span', 'kit-hold-t', K.s4.hold));
      const eb = el('button', 'kit-link', K.s4.edit); eb.type = 'button';
      act.append(hb, eb); w.append(act);
      const ring = hb.querySelector('circle'), C = 2 * Math.PI * 22.5;
      ring.style.strokeDasharray = C; ring.style.strokeDashoffset = C;
      eb.addEventListener('click', () => {
        const on = draft.getAttribute('contenteditable') !== 'true';
        draft.setAttribute('contenteditable', on ? 'true' : 'false');
        eb.textContent = on ? K.s4.editDone : K.s4.edit;
        if (on) { draft.focus(); const r = document.createRange(); r.selectNodeContents(draft); r.collapse(false); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
      });
      holdToApprove(hb, {
        ms: 800,
        onProgress: p => { ring.style.strokeDashoffset = C * (1 - p); },
        onDone: () => {
          ring.style.strokeDashoffset = C;
          if (id !== run || draft.classList.contains('is-typing')) return;
          s5(id, w, draft, act, act.contains(document.activeElement));
        },
      });
      show(act);
      if (kb) hb.focus({ preventScroll: true });
    }

    // Fatto: il sistema lavora, il visitatore vede cosa è successo e quanto ci ha messo.
    async function s5(id, w, draft, act, hadFocus) {
      act.remove();
      draft.setAttribute('contenteditable', 'false');
      w.querySelectorAll('.kit-tone button').forEach(b => { b.disabled = true; });
      draft.classList.add('is-ok');
      draft.before(el('p', 'kit-okpill is-new', K.s4.approved));
      kit.classList.remove('is-wait');
      mount(4); kit.classList.add('is-done');
      const secs = Math.max(1, Math.round((performance.now() - t0) / 1000));
      guide(5, K.s5.h, K.s5.p);
      const log = el('ul', 'kit-log');
      w.append(log);
      show(log);
      for (const line of st.done) { await wait(300); if (id !== run) return; log.append(el('li', 'is-new', line)); }
      await wait(320); if (id !== run) return;
      const out = el('div', 'kit-out is-new');
      out.append(el('p', '', K.s5.you.replace('{s}', secs)));
      const row = el('div', 'kit-out-row');
      const tmp = document.createElement('div'); tmp.innerHTML = K.cal;
      const cb = tmp.firstElementChild;
      try { const cfg = JSON.parse(cb.getAttribute('data-cal-config') || '{}'); cfg.notes = K.s5.calNote.replace('{studio}', st.kind); cb.setAttribute('data-cal-config', JSON.stringify(cfg)); } catch (x) {}
      const again = el('button', 'sx-btn2', K.s5.again); again.type = 'button';
      again.addEventListener('click', () => { s0(); show(stage.firstChild); });
      const link = el('a', 'hm-link', `${K.s5.discover} ${st.svcName}`); link.href = st.svcHref;
      row.append(cb, again, link); out.append(row); w.append(out);
      show(row);
      if (hadFocus || kb) cb.focus({ preventScroll: true });
    }

    reset.addEventListener('click', () => { s0(); show(stage); if (kb) { const f = stage.querySelector('button'); if (f) f.focus({ preventScroll: true }); } });
    s0();
  }
};
// ovia-pages.js (che definisce window.ovHold) viene eseguito dopo questo file: si parte al DOMContentLoaded.
if (window.ovHold) ovHome(); else document.addEventListener('DOMContentLoaded', ovHome);
