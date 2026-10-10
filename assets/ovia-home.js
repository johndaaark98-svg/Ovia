/* =====================================================================
   OVIA — Homepage interattiva.
   Il pallino blu del logo significa "in attesa": ogni sistema Ovia prepara
   il lavoro e poi si ferma finché una persona non approva.
   1. Coda di approvazione (hero): tieni premuto il pallino per approvare.
   2. Simulatore: arriva qualcosa → Ovia legge → prepara → tu decidi → fatto.
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

  /* ---------- 3. Simulatore ---------- */
  const sx = document.querySelector('[data-sx]');
  if (sx) {
    const S = D.sim;
    const tabs = [...sx.querySelectorAll('[data-sx-tab]')];
    const track = sx.querySelector('[data-sx-track]');
    const stations = [...track.querySelectorAll('li:not(.sx-fill)')];
    const fill = track.querySelector('.sx-fill');
    const panel = sx.querySelector('[data-sx-panel]');
    const say = sx.querySelector('[data-sx-live]');
    let run = 0, cur = 0;

    const setStage = (k, done = false) => {
      stations.forEach((s, i) => {
        s.classList.toggle('on', i < k || (done && i === k));
        s.classList.toggle('cur', i === k && !done);
      });
      fill.style.setProperty('--f', k / (stations.length - 1));
      if (say) say.textContent = S.stages[k];
    };
    const block = (title, cls) => {
      const b = el('div', 'sx-block is-new ' + (cls || ''));
      b.append(el('p', 'sx-h', title));
      return b;
    };
    const typeWords = async (node, text, alive) => {
      if (RM) { node.textContent = text; return; }
      const words = text.split(' ');
      node.textContent = '';
      node.classList.add('is-typing');
      for (let k = 0; k < words.length; k++) {
        if (!alive()) return;
        node.textContent += (k ? ' ' : '') + words[k];
        await wait(22 + Math.random() * 26);
      }
      node.classList.remove('is-typing');
    };

    async function play(i, focusTab = false) {
      const id = ++run, alive = () => id === run, sc = S.scen[i];
      cur = i;
      tabs.forEach((t, j) => { t.setAttribute('aria-selected', String(j === i)); t.tabIndex = j === i ? 0 : -1; });
      if (focusTab) tabs[i].focus();
      sx.classList.remove('is-wait', 'is-stopped', 'is-done');
      panel.innerHTML = '';
      const left = el('div', 'sx-in'), right = el('div', 'sx-work');
      panel.append(left, right);

      // Arriva
      setStage(0);
      const b0 = el('div', 'sx-block');
      b0.append(el('p', 'sx-h', S.arrived), el('p', 'sx-src', sc.src), el('p', 'sx-msg is-new', sc.input));
      left.append(b0);
      await wait(900); if (!alive()) return;

      // Ovia legge
      setStage(1);
      const b1 = block(S.understood);
      const dl = el('dl', 'sx-fields');
      b1.append(dl); left.append(b1);
      for (const [k, v] of sc.fields) {
        await wait(320); if (!alive()) return;
        const row = el('div', 'is-new');
        row.append(el('dt', '', k), el('dd', '', v));
        dl.append(row);
      }
      await wait(600); if (!alive()) return;

      // Ovia prepara
      setStage(2);
      const b2 = block(S.drafted);
      const draft = el('p', 'sx-draft');
      b2.append(draft); right.append(b2);
      await typeWords(draft, sc.draft, alive); if (!alive()) return;
      await wait(350); if (!alive()) return;

      // Tu decidi: il sistema si ferma e aspetta.
      setStage(3);
      sx.classList.add('is-wait');
      const act = el('div', 'sx-actions is-new');
      const hb = el('button', 'sx-hold'); hb.type = 'button';
      hb.append(el('i'), el('span', '', S.approve));
      const eb = el('button', 'sx-btn2', S.edit); eb.type = 'button';
      const rb = el('button', 'sx-btn2', S.reject); rb.type = 'button';
      act.append(hb, eb, rb);
      b2.append(act);

      eb.addEventListener('click', () => {
        const on = draft.getAttribute('contenteditable') !== 'true';
        draft.setAttribute('contenteditable', on ? 'true' : 'false');
        eb.textContent = on ? S.editDone : S.edit;
        if (on) {
          draft.focus();
          const r = document.createRange(); r.selectNodeContents(draft); r.collapse(false);
          const s = getSelection(); s.removeAllRanges(); s.addRange(r);
        }
      });
      rb.addEventListener('click', () => {
        if (!alive()) return;
        run++;
        sx.classList.remove('is-wait'); sx.classList.add('is-stopped');
        draft.setAttribute('contenteditable', 'false');
        act.remove();
        const stop = el('div', 'sx-stop is-new');
        const again = el('button', 'sx-btn2', S.restart); again.type = 'button';
        again.addEventListener('click', () => play(i));
        stop.append(el('p', '', S.rejected), again);
        b2.append(stop);
        again.focus({ preventScroll: true });
        if (say) say.textContent = S.rejected;
      });
      holdToApprove(hb, {
        ms: 800,
        onProgress: p => hb.style.setProperty('--p', p),
        onDone: async () => {
          if (!alive()) return;
          const hadFocus = act.contains(document.activeElement);
          draft.setAttribute('contenteditable', 'false');
          act.remove();
          sx.classList.remove('is-wait'); sx.classList.add('is-done');
          setStage(4, true);
          const b3 = block(S.result, 'sx-result');
          const log = el('ul', 'sx-log');
          b3.append(log); right.append(b3);
          for (const line of sc.done) {
            await wait(260); if (!alive()) return;
            log.append(el('li', 'is-new', line));
          }
          await wait(300); if (!alive()) return;
          const out = el('div', 'sx-out is-new');
          const link = el('a', 'hm-link', `${S.discover} ${sc.name}`); link.href = sc.href;
          const nx = el('button', 'sx-btn2', S.again); nx.type = 'button';
          nx.addEventListener('click', () => play((i + 1) % S.scen.length));
          out.append(el('p', '', S.yourPart), link, nx);
          b3.append(out);
          if (hadFocus) nx.focus({ preventScroll: true });
        },
      });
    }

    tabs.forEach((t, j) => {
      t.addEventListener('click', () => play(j));
      t.addEventListener('keydown', e => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        play((cur + d + tabs.length) % tabs.length, true);
      });
    });

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => {
        if (es.some(e => e.isIntersecting)) { io.disconnect(); play(0); }
      }, { threshold: .3 });
      io.observe(sx);
    } else play(0);
  }
};
// ovia-pages.js (che definisce window.ovHold) viene eseguito dopo questo file: si parte al DOMContentLoaded.
if (window.ovHold) ovHome(); else document.addEventListener('DOMContentLoaded', ovHome);
