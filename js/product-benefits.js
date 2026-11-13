/* ==========================================================================
   Pagina prodotto — Key benefits (SITO 4)
   1. Entrata: quando il riquadro entra nello schermo i vetri arrivano dal
      basso uno dopo l'altro (.is-in sul riquadro, una volta)
   2. Fuoco: mentre il riquadro attraversa lo schermo il fuoco passa da un
      beneficio al successivo (.is-focus su uno solo)
   3. Mouse (dispositivi con hover): la texture si sposta piano al contrario
      (--bx / --by tra -1 e 1)
   Decorativo: nessun testo cambia. Con Stop animation / reduced-motion:
   tutto visibile e fermo, nessun fuoco.
   ========================================================================== */

(function () {
  'use strict';

  var stage = document.querySelector('[data-benefits]');
  if (!stage) return;
  var items = Array.prototype.slice.call(stage.querySelectorAll('.pd-benefit'));
  var list = stage.querySelector('.pd-benefit-list');
  var hoverMq = window.matchMedia('(hover: hover) and (pointer: fine)');
  var ticking = false;

  function motionOn() {
    return window.RoelmiMotion ? !window.RoelmiMotion.isPaused() : true;
  }
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  /* 1. Entrata. Parte quando il riquadro supera di poco il fondo dello
     schermo (soglia 0 + margine): con una soglia in percentuale un riquadro
     molto più alto dello schermo (telefono) poteva non arrivarci mai e i
     vetri restavano invisibili. Finita l'entrata (.is-done) i ritardi a
     scalare non servono più: fuoco e mouse rispondono subito su ogni vetro */
  function entered() {
    stage.classList.add('is-in');
    window.setTimeout(function () { stage.classList.add('is-done'); }, 1300);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries[entries.length - 1].isIntersecting) {
        entered();
        io.disconnect();
      }
    }, { threshold: 0, rootMargin: '0px 0px -15% 0px' });
    io.observe(stage);
  } else {
    entered();
  }

  /* 2. Fuoco con lo scroll */
  function draw() {
    ticking = false;
    if (!motionOn()) {
      items.forEach(function (it) { it.classList.remove('is-focus'); });
      return;
    }
    var r = stage.getBoundingClientRect();
    var vh = window.innerHeight;
    // Il fuoco segue l'elenco dei vetri, non tutto il riquadro (13/11/2026,
    // Chiara: arrivando sulla sezione il fuoco era già sull'ultimo, perché
    // contava dall'ingresso del titolo in fondo allo schermo). Ora: 0 quando
    // la cima dei vetri è all'85% dello schermo, 1 quando sale al 25%
    var lr = list ? list.getBoundingClientRect() : r;
    var p = clamp((vh * 0.85 - lr.top) / Math.max(vh * 0.6, 1));
    var visible = r.top < vh && r.bottom > 0;
    var idx = Math.min(items.length - 1, Math.floor(p * items.length));
    items.forEach(function (it, i) { it.classList.toggle('is-focus', visible && p > 0 && i === idx); });
  }

  function request() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(draw);
    }
  }

  /* 3. Mouse */
  function setPointer(x, y) {
    stage.style.setProperty('--bx', x.toFixed(3));
    stage.style.setProperty('--by', y.toFixed(3));
  }

  stage.addEventListener('pointermove', function (e) {
    if (!hoverMq.matches || !motionOn() || e.pointerType !== 'mouse') return;
    var r = stage.getBoundingClientRect();
    setPointer((e.clientX - r.left) / r.width * 2 - 1, (e.clientY - r.top) / r.height * 2 - 1);
  });
  stage.addEventListener('pointerleave', function () { setPointer(0, 0); });

  function setup() {
    stage.classList.toggle('is-animated', motionOn());
    if (!motionOn()) setPointer(0, 0);
    request();
  }

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  if (window.RoelmiMotion) window.RoelmiMotion.onChange(setup);
  setup();
})();
