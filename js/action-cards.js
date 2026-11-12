/* ==========================================================================
   Riquadri delle schede che si riempiono di colore come un liquido quando
   entrano nello schermo (12/11/2026, Chiara). Ogni scheda è osservata da
   sola: in una riga che scorre di lato quelle fuori schermo si riempiono
   solo quando ci arrivi; le schede che entrano insieme partono una dopo
   l'altra (--d, ritardo in secondi). Poi restano piene.
   - Our Portfolio (home) e Ingredient Finder: su TUTTI i dispositivi
     (il colore pieno non deve dipendere dal mouse)
   - "Sustainability in action" (NIP) e Related products (prodotto): solo su
     telefono e tablet; su desktop resta l'hover
   Le schede del Finder vengono ricreate a ogni filtro (js/finder.js): un
   MutationObserver prende anche quelle nuove.
   Senza JS, con Stop animation o reduced-motion: riquadri già pieni e
   fermi. Gli stili sono in gradienti.css, finder.css e action-cards.css.
   ========================================================================== */

(function () {
  'use strict';

  var touch = window.matchMedia('(hover: none)').matches;
  var sel = touch
    ? '.np-cards .np-card, .pf-gradient .product-card, .fx-grid .fx-card'
    : '.pf-gradient .product-card, .fx-grid .fx-card';

  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    (window.RoelmiMotion && window.RoelmiMotion.isPaused()) ||
    !('IntersectionObserver' in window);

  var io = still ? null : new IntersectionObserver(function (entries) {
    var batch = entries.filter(function (e) { return e.isIntersecting; });
    batch.forEach(function (entry, n) {
      entry.target.style.setProperty('--d', (n * 0.35).toFixed(2) + 's');
      entry.target.classList.add('is-filled');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.6 });

  function setup(card) {
    if (still) card.classList.add('is-filled');
    else io.observe(card);
  }

  Array.prototype.forEach.call(document.querySelectorAll(sel), setup);

  // Schede aggiunte dopo (Ingredient Finder: elenco ridisegnato a ogni filtro)
  if ('MutationObserver' in window) {
    new MutationObserver(function (records) {
      records.forEach(function (r) {
        Array.prototype.forEach.call(r.addedNodes, function (node) {
          if (node.nodeType !== 1) return;
          if (node.matches(sel)) setup(node);
          Array.prototype.forEach.call(node.querySelectorAll(sel), setup);
        });
      });
    }).observe(document.body, { childList: true, subtree: true });
  }

  // Stop animation premuto dopo: tutte piene subito
  if (window.RoelmiMotion) {
    window.RoelmiMotion.onChange(function (paused) {
      if (!paused) return;
      still = true;
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (c) {
        c.classList.add('is-filled');
      });
    });
  }
})();
