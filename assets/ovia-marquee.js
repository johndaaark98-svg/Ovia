// Ovia: riga dei clienti che scorre (home e landing).
/* ---------- Clienti: riga che scorre di continuo, in ordine ----------
   I loghi si ripetono in sequenza finché la riga è piena, poi la sequenza
   viene raddoppiata per un giro senza stacchi. Le copie sono nascoste ai lettori di schermo. */
(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.hm-clients .hm-logos').forEach(function (ul) {
    var base = [].slice.call(ul.children);
    if (!base.length) return;
    var box = document.createElement('div'); box.className = 'hm-marquee';
    ul.parentNode.insertBefore(box, ul); box.appendChild(ul);
    var fill = function () {
      var target = box.clientWidth + 40, guard = 0;
      while (ul.scrollWidth < target && guard++ < 12) base.forEach(function (li) { var c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); ul.appendChild(c); });
      [].slice.call(ul.children).forEach(function (li) { var c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); ul.appendChild(c); });
      var half = ul.scrollWidth / 2;
      ul.style.setProperty('--marq-d', Math.max(20, half / 45) + 's');
    };
    // i loghi hanno larghezza e altezza dichiarate: la riga si misura subito
    ul.querySelectorAll('img').forEach(function (im) { im.loading = 'eager'; });
    fill();
  });
})();
