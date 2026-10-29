/* ==========================================================================
   Parole che si accendono con lo scroll (come Who We Are, js/who.js), per
   qualsiasi paragrafo con data-scroll-words (SITO 4, 29/10/2026).
   Le parole partono in grigio secondario e diventano Hard Grey (gli accenti
   .accent diventano Ocean) mentre il paragrafo sale dall'85% al 35% dello
   schermo. Lo screen reader legge sempre il testo intero.
   Con Stop animation / reduced-motion: tutto acceso.
   ========================================================================== */

(function () {
  'use strict';

  var blocks = document.querySelectorAll('[data-scroll-words]');
  if (!blocks.length) return;

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  function motionOn() {
    return window.RoelmiMotion ? !window.RoelmiMotion.isPaused() : true;
  }

  /* Copia visibile divisa in parole (aria-hidden) + testo intero per lo
     screen reader. I <strong> restano, così gli accenti */
  function splitInto(source, target, words) {
    Array.prototype.forEach.call(source.childNodes, function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            target.appendChild(document.createTextNode(' '));
          } else {
            var w = document.createElement('span');
            w.className = 'sw-word';
            w.textContent = part;
            target.appendChild(w);
            words.push(w);
          }
        });
      } else if (node.nodeType === 1) {
        var copy = node.cloneNode(false);
        target.appendChild(copy);
        splitInto(node, copy, words);
      }
    });
  }

  var items = Array.prototype.map.call(blocks, function (el) {
    var words = [];
    var original = el.cloneNode(true);
    var sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = el.textContent.replace(/\s+/g, ' ').trim();
    var vis = document.createElement('span');
    vis.setAttribute('aria-hidden', 'true');
    splitInto(original, vis, words);
    el.textContent = '';
    el.appendChild(sr);
    el.appendChild(vis);
    el.classList.add('is-ready');
    return { el: el, words: words };
  });

  function render() {
    var vh = window.innerHeight;
    var on = motionOn();
    items.forEach(function (it) {
      var r = it.el.getBoundingClientRect();
      var p = on ? clamp((vh * 0.85 - r.top) / (r.height + vh * 0.5)) : 1;
      var lit = Math.round(p * it.words.length);
      for (var i = 0; i < it.words.length; i++) {
        it.words[i].classList.toggle('is-lit', i < lit);
      }
    });
  }

  window.addEventListener('scroll', render, { passive: true });
  window.addEventListener('resize', render);
  if (window.RoelmiMotion) window.RoelmiMotion.onChange(render);
  render();
})();
