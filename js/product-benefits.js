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
  var hoverMq = window.matchMedia('(hover: hover) and (pointer: fine)');
  var ticking = false;

  function motionOn() {
    return window.RoelmiMotion ? !window.RoelmiMotion.isPaused() : true;
  }
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  /* 1. Entrata */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries[entries.length - 1].isIntersecting) {
        stage.classList.add('is-in');
        io.disconnect();
      }
    }, { threshold: 0.25 });
    io.observe(stage);
  } else {
    stage.classList.add('is-in');
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
    // 0 quando il riquadro è appena tutto entrato, 1 quando sta per uscire in alto
    var p = clamp((vh * 0.85 - r.top) / Math.max(r.height, 1));
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
