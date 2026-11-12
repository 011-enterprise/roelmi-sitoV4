/* ==========================================================================
   Pagine delle divisioni — Biotech & Nature (12/11/2026, Chiara)
   Su desktop l'immagine resta ferma a sinistra mentre i testi scorrono a
   destra: quando un testo attraversa la metà dello schermo, nella colonna
   ferma si accende la sua immagine (.is-active, dissolvenza in division.css).
   Senza JS resta la prima immagine; su telefono ogni testo ha la sua
   immagine sopra e questo script non cambia niente di visibile.
   ========================================================================== */

(function () {
  'use strict';

  var wrap = document.querySelector('[data-tech-scroll]');
  if (!wrap || !('IntersectionObserver' in window)) return;

  var imgs = Array.prototype.slice.call(wrap.querySelectorAll('.dv-tech-frame img[data-tech]'));
  var texts = Array.prototype.slice.call(wrap.querySelectorAll('.dv-tech[data-tech]'));

  function show(key) {
    imgs.forEach(function (img) {
      img.classList.toggle('is-active', img.getAttribute('data-tech') === key);
    });
  }

  // Una fascia sottile a metà schermo: il testo che la attraversa è quello attivo
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) show(entry.target.getAttribute('data-tech'));
    });
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

  texts.forEach(function (t) { io.observe(t); });
})();
