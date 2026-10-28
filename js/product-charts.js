/* ==========================================================================
   Pagina prodotto — Technical data: carosello dei grafici (come SITO 1)
   - Frecce: grafico precedente / successivo (in giro)
   - Su touch: swipe orizzontale
   - Niente scorrimento automatico
   - I grafici nascosti sono fuori dal Tab e dagli screen reader (inert);
     a ogni cambio una riga di stato dice "Chart 2 of 4"
   Senza JS i grafici sono uno sotto l'altro.
   ========================================================================== */

(function () {
  'use strict';

  var track = document.getElementById('pd-charts-track');
  if (!track) return;

  var section = track.closest('section');
  var slides = Array.prototype.slice.call(track.querySelectorAll('.pd-chart'));
  var arrows = Array.prototype.slice.call(section.querySelectorAll('.pd-arrow'));
  var status = section.querySelector('[data-charts-status]');
  var N = slides.length;
  if (N < 2) {
    arrows.forEach(function (a) { a.hidden = true; });
    return;
  }

  var current = 0;

  function go(i, announce) {
    current = (i + N) % N;
    slides.forEach(function (s, k) {
      var on = k === current;
      s.classList.toggle('is-active', on);
      if (on) s.removeAttribute('inert');
      else s.setAttribute('inert', '');
    });
    if (announce && status) status.textContent = 'Chart ' + (current + 1) + ' of ' + N;
  }

  arrows.forEach(function (btn) {
    btn.addEventListener('click', function () {
      go(current + (parseInt(btn.getAttribute('data-dir'), 10) || 1), true);
    });
  });

  // Swipe: solo dito/penna; lo scroll verticale resta al browser (touch-action: pan-y)
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
})();
