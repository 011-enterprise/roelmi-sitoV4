/* ==========================================================================
   Pagina NIP® — movimento legato allo scroll (come la NIP della home e
   What we do di About)
   1. Apertura: la texture si ingrandisce lentissima e il vetro con il titolo
      sale un po' più piano (profondità). Su telefono solo la texture.
   2. Intro: la frase grande si accende parola per parola. Le parole si
      dividono sul posto, così grassetti e accenti restano veri e lo screen
      reader legge la frase intera.
   Con Stop animation / reduced-motion: tutto fermo, frase tutta accesa.
   ========================================================================== */

(function () {
  'use strict';

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  function motionOn() {
    return window.RoelmiMotion ? !window.RoelmiMotion.isPaused() : true;
  }

  /* ------------------------------------------------------------------------
     1. Apertura con profondità
     ------------------------------------------------------------------------ */

  var stage = document.querySelector('.np-stage');
  var img = stage && stage.querySelector('.np-stage-bg img');
  var head = stage && stage.querySelector('.np-head');
  var phoneMq = window.matchMedia('(max-width: 599.98px)');

  function renderStage() {
    if (!stage) return;
    if (!motionOn()) {
      if (img) img.style.transform = '';
      if (head) head.style.translate = '';
      return;
    }
    var r = stage.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = clamp((vh - r.top) / (vh + r.height));
    if (img) img.style.transform = 'scale(' + (1 + p * 0.12).toFixed(4) + ')';
    // "translate" è separato da "transform", che serve all'entrata dal basso
    if (head) head.style.translate = phoneMq.matches ? '' : '0 ' + ((0.5 - p) * 40).toFixed(1) + 'px';
  }

  /* ------------------------------------------------------------------------
     2. La frase dell'intro si accende scorrendo
     ------------------------------------------------------------------------ */

  var statement = document.querySelector('.np-statement');
  var words = [];

  function splitWords(el) {
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        var frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
          } else {
            var w = document.createElement('span');
            w.className = 'np-word';
            w.textContent = part;
            frag.appendChild(w);
            words.push(w);
          }
        });
        el.replaceChild(frag, node);
      } else if (node.nodeType === 1) {
        splitWords(node);
      }
    });
  }

  if (statement) {
    splitWords(statement);
    statement.classList.add('is-ready');
  }

  function renderWords() {
    if (!statement) return;
    var vh = window.innerHeight;
    var r = statement.getBoundingClientRect();
    var p = motionOn() ? clamp((vh * 0.85 - r.top) / (r.height + vh * 0.5)) : 1;
    var lit = Math.round(p * words.length);
    for (var i = 0; i < words.length; i++) {
      words[i].classList.toggle('is-lit', i < lit);
    }
  }

  /* ------------------------------------------------------------------------
     Eventi
     ------------------------------------------------------------------------ */

  function render() {
    renderStage();
    renderWords();
  }

  window.addEventListener('scroll', render, { passive: true });
  window.addEventListener('resize', render);
  if (window.RoelmiMotion) window.RoelmiMotion.onChange(render);
  render();
})();
