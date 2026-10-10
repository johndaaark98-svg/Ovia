/* =====================================================================
   OVIA — Homepage interattiva.
   Il pallino blu del logo significa "in attesa": ogni sistema Ovia prepara
   il lavoro e poi si ferma finché una persona non approva.
   1. Coda di approvazione (hero): tieni premuto il pallino per approvare.
   2. Manifesto: le parole si accendono con lo scroll.
   3. Simulatore: arriva qualcosa → Ovia legge → prepara → tu decidi → fatto.
   Testi e scenari arrivano dal JSON #hx-data (generato da scripts/build-home.mjs).
   ===================================================================== */
(() => {
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

  /* ---------- Tieni premuto per approvare (mouse, touch, tastiera) ---------- */
  function holdToApprove(btn, { ms = 850, onProgress, onDone }) {
    let p = 0, dir = 0, raf = 0, last = 0, active = false, kb = false;
    const blocked = () => btn.getAttribute('aria-disabled') === 'true';
    const tick = now => {
      const dt = now - last; last = now;
      p = Math.min(1, Math.max(0, p + dir * dt / (dir > 0 ? ms : ms / 2)));
      onProgress(p);
      if (dir > 0 && p >= 1) { raf = 0; finish(); return; }
      if (dir < 0 && p <= 0) { raf = 0; return; }
      raf = requestAnimationFrame(tick);
    };
    const go = d => { dir = d; if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } };
    const start = () => { if (blocked() || active) return; active = true; btn.classList.add('is-holding'); go(1); };
    const stop = () => { if (!active) return; active = false; btn.classList.remove('is-holding'); if (p < 1) go(-1); };
    const finish = () => { active = false; btn.classList.remove('is-holding'); p = 0; onDone(); };

    btn.addEventListener('pointerdown', e => {
      if (e.button > 0) return;
      e.preventDefault();
      try { btn.setPointerCapture(e.pointerId); } catch {}
      start();
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => btn.addEventListener(t, stop));
    btn.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault(); kb = true;
      if (!e.repeat) start();
    });
    btn.addEventListener('keyup', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault(); stop();
      setTimeout(() => { kb = false; }, 0);
    });
    // Lettori di schermo che inviano un clic "virtuale": approvazione diretta.
    btn.addEventListener('click', e => { if (e.detail === 0 && !kb && !active && !blocked()) finish(); });
    btn.addEventListener('contextmenu', e => e.preventDefault());
  }

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
        setTimeout(() => { top.classList.add('is-out'); top.setAttribute('aria-hidden', 'true'); layout(); }, RM ? 0 : 480);
        setTimeout(() => top.remove(), RM ? 50 : 1100);
        burst();
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

  /* ---------- Chiusura: tieni premuto il pallino per prenotare ---------- */
  const ctaDot = document.querySelector('[data-hx-cta]');
  if (ctaDot) {
    const book = ctaDot.closest('.hx-cta').querySelector('[data-cal-link]');
    holdToApprove(ctaDot, {
      ms: 850,
      onProgress: p => ctaDot.style.setProperty('--p', p),
      onDone: () => { ctaDot.style.setProperty('--p', 0); if (book) book.click(); },
    });
  }

  /* ---------- 2. Manifesto ---------- */
  const mf = document.querySelector('[data-mf]');
  if (mf && !RM) {
    const text = mf.querySelector('.mf-text');
    const ws = [...mf.querySelectorAll('.mf-w')];
    let ticking = false;
    const upd = () => {
      ticking = false;
      const r = text.getBoundingClientRect(), vh = innerHeight;
      const p = (vh * .85 - r.top) / (r.height + vh * .35);
      const n = Math.round(Math.max(0, Math.min(1, p)) * ws.length);
      ws.forEach((w, i) => w.classList.toggle('on', i < n));
    };
    mf.classList.add('is-live');
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    addEventListener('resize', upd);
    upd();
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
})();
