/* ==========================================================================
   Blog — ricerca, categorie e "Load more news"
   - Ricerca: parole nel titolo e nella frase della scheda, mentre si scrive
   - Categorie: pillole con aria-pressed (una sola attiva, "All" = tutte)
   - Le due cose lavorano insieme; si vedono 6 schede, "Load more news" ne
     mostra altre 6 e porta il focus sulla prima appena comparsa
   - La riga di stato (aria-live) dice quante news si vedono
   - Nessun risultato: messaggio + "Show all news" che azzera i filtri
   Senza JS si vedono tutte le schede (filtri nascosti dal CSS).
   ========================================================================== */

(function () {
  'use strict';

  var grid = document.getElementById('bpGrid');
  if (!grid) return;

  var PAGE = 6;
  var posts = Array.prototype.slice.call(grid.querySelectorAll('.post'));
  var pills = Array.prototype.slice.call(document.querySelectorAll('.bp-filter'));
  var form = document.getElementById('bpSearchForm');
  var input = document.getElementById('bpSearch');
  var status = document.getElementById('bpStatus');
  var empty = document.getElementById('bpEmpty');
  var reset = document.getElementById('bpReset');
  var more = document.getElementById('bpMore');

  var cat = 'all';
  var shown = PAGE;

  function textOf(post) {
    var t = post.querySelector('.post-title');
    var x = post.querySelector('.post-text');
    return ((t ? t.textContent : '') + ' ' + (x ? x.textContent : '')).toLowerCase();
  }

  function catName() {
    var p = pills.filter(function (b) { return b.getAttribute('data-cat') === cat; })[0];
    return p ? p.textContent.trim() : '';
  }

  function matching() {
    var q = input.value.trim().toLowerCase();
    return posts.filter(function (post) {
      var okCat = cat === 'all' || post.getAttribute('data-cat') === cat;
      return okCat && (!q || textOf(post).indexOf(q) !== -1);
    });
  }

  function render(focusFrom) {
    var list = matching();
    var q = input.value.trim();

    posts.forEach(function (p) { p.hidden = true; });
    list.forEach(function (p, i) { p.hidden = i >= shown; });

    var visible = Math.min(shown, list.length);
    more.hidden = list.length <= shown;
    empty.hidden = list.length > 0;

    // Riga di stato: quante news e con quali filtri
    var where = cat === 'all' ? '' : ' in ' + catName();
    var what = q ? ' for "' + q + '"' : '';
    if (!list.length) {
      status.textContent = 'No news' + where + what + '.';
    } else if (visible < list.length) {
      status.textContent = 'Showing ' + visible + ' of ' + list.length + ' news' + where + what + '.';
    } else {
      status.textContent = list.length + (list.length === 1 ? ' news' : ' news') + where + what + '.';
    }

    // "Load more": il focus va sulla prima scheda appena comparsa
    if (typeof focusFrom === 'number' && list[focusFrom]) {
      var link = list[focusFrom].querySelector('.post-link');
      if (link) link.focus();
    }
  }

  pills.forEach(function (btn) {
    btn.addEventListener('click', function () {
      cat = btn.getAttribute('data-cat');
      pills.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      shown = PAGE;
      render();
    });
  });

  input.addEventListener('input', function () {
    shown = PAGE;
    render();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    shown = PAGE;
    render();
  });

  more.addEventListener('click', function () {
    var from = shown;
    shown += PAGE;
    render(from);
  });

  reset.addEventListener('click', function () {
    input.value = '';
    cat = 'all';
    pills.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-cat') === 'all' ? 'true' : 'false'); });
    shown = PAGE;
    render();
    input.focus();
  });

  render();
})();
