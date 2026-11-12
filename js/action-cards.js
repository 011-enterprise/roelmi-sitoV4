/* ==========================================================================
   Schede "Sustainability in action" / Related products (css/action-cards.css)
   Su telefono e tablet (niente hover) il riquadro colorato si riempie come
   un liquido quando la SCHEDA entra davvero nello schermo (12/11/2026,
   Chiara). Ogni scheda è osservata da sola: in una riga che scorre di lato
   quelle fuori schermo si riempiono solo quando ci arrivi. Le schede che
   entrano insieme partono una dopo l'altra (--d, ritardo in secondi).
   Poi restano piene. Senza JS, con Stop animation o reduced-motion:
   riquadri già pieni e fermi. Su desktop resta l'hover.
   ========================================================================== */

(function () {
  'use strict';

  var cards = document.querySelectorAll('.np-cards .np-card');
  if (!cards.length) return;

  // Desktop: resta l hover, niente da fare
  if (!window.matchMedia('(hover: none)').matches) return;

  if (!('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(cards, function (c) { c.classList.add('is-filled'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    var batch = entries.filter(function (e) { return e.isIntersecting; });
    batch.forEach(function (entry, n) {
      entry.target.style.setProperty('--d', (n * 0.35).toFixed(2) + 's');
      entry.target.classList.add('is-filled');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.6 });

  Array.prototype.forEach.call(cards, function (card) { io.observe(card); });
})();
