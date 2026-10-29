/* ==========================================================================
   Footer su telefono: colonne a tendina (29/10/2026)
   Sotto i 700px il titolo di ogni colonna (Company, Our Divisions, Contact)
   diventa un bottone che apre e chiude il suo elenco; partono chiuse.
   Sopra i 700px e senza JS gli elenchi sono sempre aperti e i titoli
   tornano testo normale. Il bottone sta DENTRO l'h2 (struttura dei titoli
   invariata) e annuncia aperto/chiuso con aria-expanded.
   ========================================================================== */

(function () {
  'use strict';

  var cols = document.querySelectorAll('.site-footer .ft-col');
  if (!cols.length) return;

  var mq = window.matchMedia('(max-width: 699.98px)');

  var items = Array.prototype.map.call(cols, function (col, i) {
    var h = col.querySelector('.ft-h');
    var list = col.querySelector('ul');
    if (!list.id) list.id = 'ft-list-' + (i + 1);
    return { col: col, h: h, list: list, label: h.textContent };
  });

  function collapse(it) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ft-toggle';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', it.list.id);
    btn.innerHTML = '<span></span><svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M2.5 4.5L6 8l3.5-3.5"/></svg>';
    btn.firstChild.textContent = it.label;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      it.list.hidden = open;
    });
    it.h.textContent = '';
    it.h.appendChild(btn);
    it.list.hidden = true;
  }

  function expand(it) {
    it.h.textContent = it.label;
    it.list.hidden = false;
  }

  function apply() {
    items.forEach(function (it) {
      var hasBtn = !!it.h.querySelector('.ft-toggle');
      if (mq.matches && !hasBtn) collapse(it);
      else if (!mq.matches && hasBtn) expand(it);
    });
  }

  if (mq.addEventListener) mq.addEventListener('change', apply);
  else mq.addListener(apply);
  apply();
})();
