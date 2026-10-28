/* ==========================================================================
   Who We Are
   Il paragrafo si accende parola per parola durante lo scroll
   (lo screen reader legge sempre il testo intero).
   Con Stop animation / reduced-motion: tutto acceso.
   ========================================================================== */

(function () {
  'use strict';

  var section = document.getElementById('who');
  if (!section) return;

  var statement = section.querySelector('.who-statement');
  if (!statement) return;
  var words = [];

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  function motionOn() {
    return window.RoelmiMotion ? !window.RoelmiMotion.isPaused() : true;
  }

  /* ------------------------------------------------------------------------
     1. Parole: copia visibile divisa in parole (aria-hidden) + testo intero
        per lo screen reader. I <strong> restano, così gli accenti Ocean.
     ------------------------------------------------------------------------ */

  function splitInto(source, target) {
    Array.prototype.forEach.call(source.childNodes, function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            target.appendChild(document.createTextNode(' '));
          } else {
            var w = document.createElement('span');
            w.className = 'who-word';
            w.textContent = part;
            target.appendChild(w);
            words.push(w);
          }
        });
      } else if (node.nodeType === 1) {
        var copy = node.cloneNode(false);
        target.appendChild(copy);
        splitInto(node, copy);
      }
    });
  }

  var original = statement.cloneNode(true);
  var sr = document.createElement('span');
  sr.className = 'sr-only';
  sr.textContent = statement.textContent.replace(/\s+/g, ' ').trim();
  var vis = document.createElement('span');
  vis.setAttribute('aria-hidden', 'true');
  splitInto(original, vis);
  statement.textContent = '';
  statement.appendChild(sr);
  statement.appendChild(vis);
  statement.classList.add('is-ready');

  /* ------------------------------------------------------------------------
     2. Disegno in base allo scroll: le parole si accendono mentre il
        paragrafo sale dall'85% al 35% dello schermo
     ------------------------------------------------------------------------ */

  function render() {
    var vh = window.innerHeight;
    var r = statement.getBoundingClientRect();
    var p = motionOn() ? clamp((vh * 0.85 - r.top) / (r.height + vh * 0.5)) : 1;
    var lit = Math.round(p * words.length);
    for (var i = 0; i < words.length; i++) {
      words[i].classList.toggle('is-lit', i < lit);
    }
  }

  window.addEventListener('scroll', render, { passive: true });
  window.addEventListener('resize', render);
  if (window.RoelmiMotion) window.RoelmiMotion.onChange(render);
  render();
})();
