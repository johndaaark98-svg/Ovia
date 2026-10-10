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
          ctx.fillStyle = 'rgba(0,51,255,' + Math.min(0.85, 0.15 + B).toFixed(3) + ')';
        } else {
          ctx.fillStyle = 'rgba(11,12,16,' + (0.08 + 0.34 * I).toFixed(3) + ')';
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
