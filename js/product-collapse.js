/* Pagina prodotto su telefono (20/11/2026, Chiara: Star "troppo lunga"):
   - Clinical trials con PIÙ studi: ogni studio diventa richiudibile. Il
     titolo h3 resta un titolo e dentro ha un bottone (aria-expanded,
     aria-controls); il primo studio è aperto, gli altri chiusi.
   - Technical details: tutte le tendine chiuse all apertura della pagina.
   Da 768px in su (e senza JavaScript) tutto resta aperto come prima. */
(function () {
  var mq = window.matchMedia('(max-width: 767.98px)');
  // 25/11/2026: gli studi in carosello non diventano tendine
  var studies = Array.prototype.slice.call(document.querySelectorAll('.pd-clinical .pd-study:not(.pd-carousel-slide)'));
  var built = false;

  function build() {
    if (built || studies.length < 2) return;
    studies.forEach(function (st, i) {
      var h = st.querySelector('.pd-study-title');
      var body = st.querySelector('.pd-clinical-body');
      if (!h || !body) return;
      if (!body.id) body.id = 'pd-study-body-' + (i + 1);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pd-study-toggle';
      btn.setAttribute('aria-controls', body.id);
      btn.innerHTML = '<span class="pd-study-toggle-text"></span><span class="pd-study-toggle-icon" aria-hidden="true"></span>';
      btn.firstChild.innerHTML = h.innerHTML;
      h.dataset.label = h.innerHTML;
      h.textContent = '';
      h.appendChild(btn);
      set(st, btn, body, i === 0);
      btn.addEventListener('click', function () {
        set(st, btn, body, btn.getAttribute('aria-expanded') !== 'true');
      });
    });
    built = true;
  }

  function set(st, btn, body, open) {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    body.hidden = !open;
    st.classList.toggle('is-open', open);
  }

  function unbuild() {
    if (!built) return;
    studies.forEach(function (st) {
      var h = st.querySelector('.pd-study-title');
      var body = st.querySelector('.pd-clinical-body');
      if (h && h.dataset.label !== undefined) { h.innerHTML = h.dataset.label; delete h.dataset.label; }
      if (body) body.hidden = false;
      st.classList.remove('is-open');
    });
    built = false;
  }

  function apply() { if (mq.matches) build(); else unbuild(); }

  // Technical details chiusi su telefono, solo all apertura della pagina
  if (mq.matches) {
    Array.prototype.forEach.call(document.querySelectorAll('.pd-tech details.pd-group[open]'), function (d) {
      d.open = false;
    });
  }

  apply();
  mq.addEventListener('change', apply);
})();
