/* ==========================================================================
   Pagina prodotto — apertura con il pittogramma (SITO 4)
   Il pittogramma sale appena più lento del riquadro mentre si scorre
   (al massimo 40px). Decorativo.
   Con Stop animation / reduced-motion: fermo.
   ========================================================================== */

(function () {
  'use strict';

  var hero = document.querySelector('.pd-phero');
  if (!hero) return;
  var visual = hero.querySelector('.pd-phero-visual .picto');
  if (!visual) return;

  var MAX = 40;
  var ticking = false;

  function motionOn() {
    return window.RoelmiMotion ? !window.RoelmiMotion.isPaused() : true;
  }

  function draw() {
    ticking = false;
    if (!motionOn()) {
      visual.style.removeProperty('--picto-shift');
      return;
    }
    var r = hero.getBoundingClientRect();
    var p = Math.min(Math.max(-r.top / Math.max(r.height, 1), 0), 1);
    visual.style.setProperty('--picto-shift', (p * MAX).toFixed(1) + 'px');
  }

  function request() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(draw);
    }
  }

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  if (window.RoelmiMotion) window.RoelmiMotion.onChange(request);
  draw();
})();
