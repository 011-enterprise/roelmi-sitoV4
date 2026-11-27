/* ==========================================================================
   Video della pagina prodotto in una finestra (27/11/2026, richiesta della
   cliente: bottone "Watch the video" nei Technical details invece del video
   nella pagina). <dialog> nativo: Esc chiude, il fuoco resta nella finestra.
   Il lettore si carica SOLO all apertura (niente peso né tracciamento prima)
   e si toglie alla chiusura, così il video si ferma. data-video-src:
   - link "embed" (YouTube / Vimeo) → iframe
   - file .mp4 / .webm → <video controls>
   - vuoto → resta il segnaposto
   Il video parte solo quando lo avvia chi guarda (niente autoplay)
   ========================================================================== */
(function () {
  'use strict';

  var btn = document.querySelector('.pd-watch');
  var dialog = document.getElementById('pdVideo');
  if (!btn || !dialog || typeof dialog.showModal !== 'function') return;

  var frame = dialog.querySelector('.pd-video-frame');
  var src = frame.getAttribute('data-video-src');
  var title = frame.getAttribute('data-video-title') || 'Video';
  var placeholder = frame.innerHTML;

  function load() {
    if (!src) return;
    frame.innerHTML = '';
    var el;
    if (/\.(mp4|webm)(\?|$)/i.test(src)) {
      el = document.createElement('video');
      el.controls = true;
      el.preload = 'metadata';
      el.src = src;
    } else {
      el = document.createElement('iframe');
      el.src = src;
      el.title = title;
      el.allow = 'encrypted-media; picture-in-picture; fullscreen';
      el.allowFullscreen = true;
    }
    frame.appendChild(el);
  }

  function unload() {
    frame.innerHTML = placeholder;
  }

  btn.addEventListener('click', function () {
    load();
    dialog.showModal();
  });

  dialog.querySelector('[data-video-close]').addEventListener('click', function () {
    dialog.close();
  });

  // Clic sullo sfondo scuro fuori dalla finestra: chiude
  dialog.addEventListener('click', function (e) {
    if (e.target === dialog) dialog.close();
  });

  dialog.addEventListener('close', function () {
    unload();
    btn.focus();
  });
})();
