/* ==========================================================================
   Pagina prodotto — apertura con il pittogramma (SITO 4)
   1. All'apertura il pittogramma SVG "si forma" (.is-forming: contorno,
      vetro, cerchio, onde; le animazioni sono in product.css)
   2. Mouse (solo dispositivi con hover): gli strati si spostano a velocità
      diverse → --mx / --my tra -1 e 1, che tornano a 0 quando il mouse esce
   3. Telefono e tablet: il pittogramma scende appena con lo scroll
      (--picto-shift, al massimo 40px)
   Decorativo. Con Stop animation / reduced-motion: già formato e fermo.
   ========================================================================== */

(function () {
  'use strict';

  var hero = document.querySelector('.pd-phero');
  if (!hero) return;
  var picto = hero.querySelector('.pd-phero-visual .picto');
  if (!picto) return;

  var hoverMq = window.matchMedia('(hover: hover) and (pointer: fine)');
  var MAX_SHIFT = 40;
  var ticking = false;

  function motionOn() {
    return window.RoelmiMotion ? !window.RoelmiMotion.isPaused() : true;
  }

  /* 1. Si forma (una volta) */
  if (motionOn() && picto.querySelector('.pg')) {
    picto.classList.add('is-forming');
  }

  /* 2. Profondità con il mouse */
  function setPointer(x, y) {
    picto.style.setProperty('--mx', x.toFixed(3));
    picto.style.setProperty('--my', y.toFixed(3));
  }

  hero.addEventListener('pointermove', function (e) {
    if (!hoverMq.matches || !motionOn() || e.pointerType !== 'mouse') return;
    var r = hero.getBoundingClientRect();
    setPointer((e.clientX - r.left) / r.width * 2 - 1, (e.clientY - r.top) / r.height * 2 - 1);
  });

  hero.addEventListener('pointerleave', function () { setPointer(0, 0); });

  /* 3. Scroll (senza hover) */
  function draw() {
    ticking = false;
    if (!motionOn() || hoverMq.matches) {
      picto.style.removeProperty('--picto-shift');
      return;
    }
    var r = hero.getBoundingClientRect();
    var p = Math.min(Math.max(-r.top / Math.max(r.height, 1), 0), 1);
    picto.style.setProperty('--picto-shift', (p * MAX_SHIFT).toFixed(1) + 'px');
  }

  function request() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(draw);
    }
  }

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  if (window.RoelmiMotion) {
    window.RoelmiMotion.onChange(function () {
      if (!motionOn()) setPointer(0, 0);
      request();
    });
  }
  draw();
})();
