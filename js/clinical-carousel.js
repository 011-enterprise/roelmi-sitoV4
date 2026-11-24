/* ==========================================================================
   Pagina prodotto — caroselli dei grafici degli studi (25/11/2026, la
   cliente: "non uno dopo l'altro ma in un carosello"). Uno per ogni
   [data-carousel] (uno studio può avere più grafici). Come il carosello di
   Technical data (product-charts.js):
   - frecce precedente / successivo (in giro), contatore "2 / 3"
   - su touch: swipe orizzontale (lo scroll verticale resta al browser)
   - niente avanzamento automatico
   - grafici nascosti fuori dal Tab e dagli screen reader (inert); a ogni
     cambio la riga di stato dice "Chart 2 of 3"
   Senza JS i grafici restano uno sotto l'altro e le frecce sono nascoste.
   ========================================================================== */

(function () {
  'use strict';

  Array.prototype.forEach.call(document.querySelectorAll('[data-carousel]'), function (box) {
    // Solo le slide, le frecce e il contatore di QUESTO carosello (uno studio
    // in carosello potrebbe contenere un carosello di grafici)
    var track = box.querySelector(':scope > .pd-carousel-track');
    var nav = box.querySelector(':scope > .pd-carousel-nav');
    if (!track || !nav) return;
    var slides = Array.prototype.filter.call(track.children, function (el) { return el.classList.contains('pd-carousel-slide'); });
    var arrows = Array.prototype.slice.call(nav.querySelectorAll('.pd-arrow'));
    var count = nav.querySelector('[data-carousel-current]');
    var label = box.getAttribute('data-carousel-label') || 'Chart';
    var status = box.querySelector(':scope > [data-carousel-status]');
    var N = slides.length;
    if (N < 2) return;

    box.classList.add('is-ready');
    var current = 0;

    function go(i, announce) {
      current = (i + N) % N;
      slides.forEach(function (s, k) {
        var on = k === current;
        s.classList.toggle('is-active', on);
        if (on) s.removeAttribute('inert');
        else s.setAttribute('inert', '');
      });
      if (count) count.textContent = String(current + 1);
      if (announce && status) status.textContent = label + ' ' + (current + 1) + ' of ' + N;
    }

    arrows.forEach(function (btn) {
      btn.addEventListener('click', function () {
        go(current + (parseInt(btn.getAttribute('data-dir'), 10) || 1), true);
      });
    });

    var startX = null, startY = 0;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') return;
      startX = e.clientX;
      startY = e.clientY;
    });
    track.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      startX = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(current + (dx < 0 ? 1 : -1), true);
    });
    track.addEventListener('pointercancel', function () { startX = null; });

    go(0, false);
  });
})();
