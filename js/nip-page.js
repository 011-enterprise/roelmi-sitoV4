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

/* ==========================================================================
   SITO 4 — animazioni nuove della pagina NIP
   1. Ciclo dell'economia circolare: il cerchio si disegna mentre l'intro
      attraversa lo schermo (--loop-p da 0 a 1); le tappe si accendono quando
      il cerchio le raggiunge (in alto 0, destra 0.25, basso 0.5, sinistra 0.75)
   2. Pilastri: entrata quando la scheda entra (.is-filled: texture che si
      assesta, lettera e vetro che salgono); su schermi larghi la texture
      scorre più lenta della scheda (--np-shift)
   Con Stop animation / reduced-motion: stato finale, fermo.
   ========================================================================== */

(function () {
  'use strict';

  function motionOn() {
    return window.RoelmiMotion ? !window.RoelmiMotion.isPaused() : true;
  }
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  var loop = document.querySelector('[data-np-loop]');
  var steps = loop ? Array.prototype.slice.call(loop.querySelectorAll('.np-loop-step')) : [];
  var pillarsSec = document.querySelector('.np-pillars');
  var pillars = pillarsSec ? Array.prototype.slice.call(pillarsSec.querySelectorAll('.np-pillar')) : [];
  var wideMq = window.matchMedia('(min-width: 900px)');
  var SHIFT = [0, 0, 0];   // pilastri versione 5: nessuno scorrimento
  var ticking = false;

  function setup() {
    var on = motionOn();
    if (loop) loop.classList.toggle('is-animated', on);
    if (pillarsSec) pillarsSec.classList.toggle('is-animated', on);
    if (!on) {
      if (loop) loop.style.removeProperty('--loop-p');
      pillars.forEach(function (p) { p.style.removeProperty('--np-shift'); });
    }
    request();
  }

  function draw() {
    ticking = false;
    if (!motionOn()) return;
    var vh = window.innerHeight;

    if (loop) {
      // 0 quando il cerchio entra dal basso, 1 quando il suo centro è a metà schermo
      var r = loop.getBoundingClientRect();
      var p = clamp((vh - r.top) / (vh * 0.5 + r.height * 0.5));
      loop.style.setProperty('--loop-p', p.toFixed(3));
      steps.forEach(function (s, i) { s.classList.toggle('is-on', p >= i * 0.25 + 0.04); });
    }

    if (pillarsSec && wideMq.matches) {
      var pr = pillarsSec.getBoundingClientRect();
      var q = clamp((vh - pr.top) / (vh + pr.height)) - 0.5;   // da -0.5 a 0.5
      pillars.forEach(function (el, i) {
        el.style.setProperty('--np-shift', (q * 2 * (SHIFT[i] || 0)).toFixed(1) + 'px');
      });
    } else {
      pillars.forEach(function (el) { el.style.removeProperty('--np-shift'); });
    }
  }

  function request() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(draw);
    }
  }

  // Lettere: si riempiono una volta, quando la scheda è ben dentro lo schermo
  if ('IntersectionObserver' in window && pillars.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-filled');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.45 });
    pillars.forEach(function (p) { io.observe(p); });
  } else {
    pillars.forEach(function (p) { p.classList.add('is-filled'); });
  }

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  if (window.RoelmiMotion) window.RoelmiMotion.onChange(setup);
  setup();
})();
