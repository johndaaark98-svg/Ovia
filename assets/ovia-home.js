/* =====================================================================
   OVIA — Homepage interattiva.
   Il pallino blu del logo significa "in attesa": ogni sistema Ovia prepara
   il lavoro e poi si ferma finché una persona non approva.
   1. Coda di approvazione (hero): tieni premuto il pallino per approvare.
   2. Monta il tuo sistema: il flusso reale in cinque pezzi, il pallino indica cosa fare.
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
    // Nessuna zona morta: le fasi si sovrappongono, così ogni scatto della rotella muove qualcosa.
    const span = (p, a, b) => ease(clamp((p - a) / (b - a), 0, 1));
    const STEP_AT = [0, .17, .38, .58, .72];       // quando cambia il testo a sinistra
    let shown = 0;                                  // progresso mostrato, insegue quello reale (movimento fluido)
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
      const target = RM ? .9 : progress(), tm = now / 1000;
      shown += (target - shown) * (Math.abs(target - shown) < .0005 ? 1 : .14);
      const p = shown;
      let step = 0; for (let k = 0; k < 5; k++) if (p >= STEP_AT[k]) step = k;
      sec.classList.toggle('is-started', p > .03);
      if (step !== lastStep) { lis.forEach((li, i) => li.classList.toggle('is-on', i === step)); lastStep = step; }
      bars.forEach((b, i) => b.style.setProperty('--f', clamp((p - STEP_AT[i]) / ((STEP_AT[i + 1] || 1) - STEP_AT[i]), 0, 1).toFixed(3)));
      const a1 = span(p, .02, .3), a2 = span(p, .26, .5), a3 = span(p, .46, .7);
      const appr = clamp((p - .72) / .24, 0, 1) * 4; // bozze approvate (0..4)
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
          const done0 = appr > i + .5; ctx.font = '600 11.5px "Instrument Sans", sans-serif';
          const pillW = ctx.measureText(done0 ? S.ok : S.wait).width + 26 + 14;
          ctx.font = (mobile ? '600 12px' : '600 13px') + ' "Instrument Sans", sans-serif';
          ctx.fillText(fit(S.cards[i], w - 24 - (a3 > .02 ? pillW : 0)), x + 14, y + 24);
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
     Il flusso reale di Ovia in cinque pezzi, montati dal visitatore uno alla volta:
     studio, ascolta (la chiamata), capisce (la scheda, il dato discordante),
     valuta (semaforo e ragioni), approvi tu (la firma che genera i documenti). Il pallino blu (la "guida") si posa sempre su ciò che
     tocca fare adesso: è lo stesso significato del logo, "in attesa di te".
     Ogni pezzo montato si incastra nella barra in alto, come in un modellino. */
  const kit = document.querySelector('[data-kit]');
  if (kit && D.kit) {
    const K = D.kit;
    const parts = [...kit.querySelectorAll('.kit-parts > li:not(.kit-line)')];
    const gN = kit.querySelector('[data-kit-n]'), gH = kit.querySelector('[data-kit-h]'), gP = kit.querySelector('[data-kit-p]');
    const reset = kit.querySelector('[data-kit-reset]');
    const bench = kit.querySelector('[data-kit-bench]');
    bench.textContent = '';
    const stage = el('div', 'kit-stage'), cue = el('span', 'kit-cue');
    cue.setAttribute('aria-hidden', 'true'); cue.hidden = true;
    bench.append(stage, cue);
    let run = 0, st = null, t0 = 0, kb = false, cueOn = null;
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
      if (!cueOn || !cueOn.isConnected) { cue.hidden = true; return; }
      const B = bench.getBoundingClientRect(), r = cueOn.getBoundingClientRect();
      cue.hidden = false;
      cue.style.transform = `translate(${Math.round(r.right - B.left - 9)}px, ${Math.round(r.top - B.top - 5)}px)`;
    };
    const point = target => { cueOn = target; place(); };
    const hideCue = () => { cueOn = null; cue.hidden = true; };
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
      // prima si prova a portare in cima la guida; se il gesto resta sotto, si scorre fino al gesto
      let dy = NARROW.matches ? g.top - head - 8 : 0;
      if (r.bottom - dy > innerHeight - 16) dy = r.bottom - innerHeight + 28;
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

    // Pezzo 2: ascolta. Un tocco e la chiamata scorre, trascritta riga per riga.
    function s1(id) {
      if (id !== run) return;
      clear(); guide(1, K.s1.h, K.s1.p);
      const c = st.call, box = el('div', 'kit-call');
      const top = el('div', 'kit-call-top');
      const who = el('div', 'kit-who');
      who.append(el('span', 'kit-ini', c.ini));
      const wt = el('div'); wt.append(el('strong', '', c.who), el('span', '', c.meta)); who.append(wt);
      const play = el('button', 'kit-play'); play.type = 'button'; play.setAttribute('aria-label', K.s1.play);
      play.innerHTML = '<span class="kit-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>';
      play.append(el('span', 'kit-play-t', K.s1.play));
      top.append(who, play);
      const tr = el('ol', 'kit-tr'); tr.setAttribute('aria-live', 'polite');
      box.append(top, tr); stage.append(box);
      show(box); point(play); if (kb) play.focus({ preventScroll: true });
      let on = false;
      play.addEventListener('click', async () => {
        if (on || id !== run) return;
        on = true; hideCue();
        play.classList.add('is-live'); play.querySelector('.kit-play-t').textContent = K.s1.live;
        for (const [who2, line] of c.lines) {
          const li = el('li', 'is-new ' + (who2 === 's' ? 'is-s' : 'is-c'));
          li.append(el('b', '', who2 === 's' ? K.s1.you : c.who.split(' ')[0]), el('span', '', line));
          tr.append(li);
          await wait(1050 + line.length * 12); if (id !== run) return;
        }
        play.classList.remove('is-live'); play.classList.add('is-done'); play.disabled = true;
        mount(1);
        await wait(500); if (id === run) s2(id);
      });
    }

    // Pezzo 3: capisce. La scheda si compila da sola; sul dato discordante decide il visitatore.
    async function s2(id) {
      if (id !== run) return;
      clear(); guide(2, K.s2.h, K.s2.p);
      const sheet = el('div', 'kit-sheet');
      const head = el('p', 'kit-sheet-h', K.s2.head);
      const dl = el('dl', 'kit-fields');
      sheet.append(head, dl); stage.append(sheet);
      show(sheet);
      const row = (k, v, cls) => { const r = el('div', cls || ''); r.append(el('dt', '', k)); const dd = el('dd'); if (v != null) dd.append(v); r.append(dd); dl.append(r); return r; };
      const rows = st.fields.map(([k]) => row(k));
      const nqRow = row(st.nq[0]); const cRow = row(st.conflict.k);
      for (let i = 0; i < st.fields.length; i++) {
        await wait(260); if (id !== run) return;
        rows[i].classList.add('is-hit'); rows[i].querySelector('dd').textContent = st.fields[i][1];
      }
      await wait(320); if (id !== run) return;
      nqRow.classList.add('is-hit', 'is-nq');
      const nd = nqRow.querySelector('dd'); nd.append(el('span', 'kit-nq', K.s2.nq), el('small', '', st.nq[1]));
      await wait(600); if (id !== run) return;
      // il dato che non coincide: due valori, ognuno con la sua chiamata
      guide(2, K.s2.h2, K.s2.p2);
      cRow.classList.add('is-hit', 'is-diff');
      const cd = cRow.querySelector('dd');
      cd.append(el('span', 'kit-diff', K.s2.diff));
      const pick = el('div', 'kit-picks');
      let chosen = false;
      const opt = (label, [val, src]) => {
        const b = el('button', 'kit-pick'); b.type = 'button';
        b.append(el('b', '', label), el('strong', '', val), el('small', '', src));
        b.addEventListener('click', async () => {
          if (chosen || id !== run) return;
          chosen = true; hideCue();
          b.classList.add('is-on'); pick.classList.add('is-made');
          pick.querySelectorAll('button').forEach(x => { x.disabled = true; });
          await wait(700); if (id !== run) return;
          mount(2);
          await wait(450); if (id === run) s3(id);
        });
        return b;
      };
      const o1 = opt(K.s2.keep, st.conflict.keep), o2 = opt(K.s2.use, st.conflict.use);
      pick.append(o1, o2); cd.append(pick);
      show(pick); point(o1); if (kb) o1.focus({ preventScroll: true });
    }

    // Pezzo 4: valuta. Il semaforo con le sue ragioni, il prossimo passo, i documenti pronti.
    function s3(id) {
      if (id !== run) return;
      clear(); guide(3, K.s3.h, K.s3.p);
      const ev = st.eval, w = el('div', 'kit-eval');
      const light = el('button', 'kit-light is-' + ev.level); light.type = 'button'; light.setAttribute('aria-expanded', 'false');
      light.append(el('i'), el('strong', '', ev.label), el('span', 'kit-why', K.s3.why));
      const why = el('ul', 'kit-reasons');
      w.append(light, why); stage.append(w);
      show(w); point(light); if (kb) light.focus({ preventScroll: true });
      let open = false;
      light.addEventListener('click', async () => {
        if (open || id !== run) return;
        open = true; hideCue(); light.setAttribute('aria-expanded', 'true'); light.classList.add('is-open');
        for (const r of ev.why) { await wait(260); if (id !== run) return; why.append(el('li', 'is-new', r)); }
        await wait(380); if (id !== run) return;
        const nx = el('div', 'kit-next is-new'); nx.append(el('span', '', K.s3.next), el('strong', '', ev.next)); w.append(nx);
        await wait(320); if (id !== run) return;
        const dh = el('p', 'kit-docs-h is-new', K.s3.docs);
        const docs = el('ul', 'kit-docs is-new');
        ev.docs.forEach(([n, f]) => { const li = el('li'); li.append(el('span', '', n), el('em', '', f)); docs.append(li); });
        w.append(dh, docs);
        mount(3);
        await wait(600); if (id === run) s4(id, w, docs);
      });
    }

    // Pezzo 5: approvi tu. Il sistema si ferma; tenendo premuto il pallino firmi.
    function s4(id, w, docs) {
      guide(4, K.s4.h, K.s4.p);
      kit.classList.add('is-wait');
      const act = el('div', 'kit-act is-new');
      const pend = el('p', 'kit-pending', K.s4.pending);
      const hb = el('button', 'kit-hold'); hb.type = 'button';
      hb.innerHTML = '<span class="kit-hold-dot"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22.5"/></svg></span>';
      hb.append(el('span', 'kit-hold-t', K.s4.hold));
      act.append(pend, hb); w.append(act);
      const ring = hb.querySelector('circle'), C = 2 * Math.PI * 22.5;
      ring.style.strokeDasharray = C; ring.style.strokeDashoffset = C;
      holdToApprove(hb, {
        ms: 800,
        onProgress: p => { ring.style.strokeDashoffset = C * (1 - p); },
        onDone: () => { ring.style.strokeDashoffset = C; if (id === run) s5(id, w, docs, act); },
      });
      show(act);
      if (kb) hb.focus({ preventScroll: true });
    }

    // Fatto: i documenti nascono firmati, la scheda si aggiorna, il visitatore vede quanto ci ha messo.
    async function s5(id, w, docs, act) {
      act.replaceWith(el('p', 'kit-okpill is-new', K.s4.approved));
      kit.classList.remove('is-wait');
      mount(4); kit.classList.add('is-done');
      const secs = Math.max(1, Math.round((performance.now() - t0) / 1000));
      guide(5, K.s5.h, K.s5.p);
      for (const li of docs.children) { await wait(220); if (id !== run) return; li.classList.add('is-made'); }
      const log = el('ul', 'kit-log');
      w.append(log); show(log);
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
      if (kb) cb.focus({ preventScroll: true });
    }

    reset.addEventListener('click', () => { s0(); show(stage); if (kb) { const f = stage.querySelector('button'); if (f) f.focus({ preventScroll: true }); } });
    s0();
  }
};
// ovia-pages.js (che definisce window.ovHold) viene eseguito dopo questo file: si parte al DOMContentLoaded.
if (window.ovHold) ovHome(); else document.addEventListener('DOMContentLoaded', ovHome);
