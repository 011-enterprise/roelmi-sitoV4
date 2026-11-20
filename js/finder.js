/* ==========================================================================
   Ingredient Finder
   - Filtri: OR dentro lo stesso gruppo, AND tra gruppi diversi
   - Ricerca libera su nome, linea, funzione, descrizione, benefici, mercato
   - Filtri e ricerca finiscono nell'indirizzo (?q=…&market=…): link
     condivisibile; arrivando dalla home (?q=hydration) la ricerca è già fatta
   - Numero di risultati annunciato (role="status")
   - Mobile: pannello filtri a tutto schermo (focus intrappolato, Esc)
   - Video dell'apertura: gira in loop, si ferma con Stop animation
   ========================================================================== */

(function () {
  'use strict';

  // Nome del prodotto con la ® piccola in apice (<sup class="reg">, base.css)
  function regName(target, text) {
    text.split('®').forEach(function (part, i) {
      if (i) {
        var sup = document.createElement('sup');
        sup.className = 'reg';
        sup.textContent = '®';
        target.appendChild(sup);
      }
      if (part) target.appendChild(document.createTextNode(part));
    });
  }

  var DATA = window.ROELMI_INGREDIENTS || [];
  var form = document.getElementById('fxForm');
  var grid = document.getElementById('fxGrid');
  var countEl = document.getElementById('fxCount');
  if (!form || !grid) return;

  var panel = document.getElementById('fxFilters');
  var searchForm = document.querySelector('.fx-search');
  var searchInput = document.getElementById('fxSearch');
  var activeList = document.querySelector('.fx-active');
  var empty = document.querySelector('.fx-empty');
  var openBtn = document.querySelector('.fx-open');
  var openCount = document.querySelector('.fx-open-count');
  var closeBtn = document.querySelector('.fx-filters-close');
  var applyBtn = document.querySelector('.fx-apply');
  var clearBtns = document.querySelectorAll('.fx-clear');
  var mobileMq = window.matchMedia('(max-width: 899.98px)');

  // Gruppo del filtro → campo del dato
  var FIELDS = {
    line: 'line', market: 'market', tech: 'technology', type: 'type',
    category: 'category', benefit: 'benefits', cert: 'certifications'
  };
  var KEYS = Object.keys(FIELDS);

  var query = '';

  function boxes() {
    return Array.prototype.slice.call(form.querySelectorAll('input[type="checkbox"]'));
  }

  function selected() {
    var sel = {};
    KEYS.forEach(function (k) { sel[k] = []; });
    boxes().forEach(function (b) { if (b.checked) sel[b.name].push(b.value); });
    return sel;
  }

  function labelOf(box) {
    return box.parentNode.querySelector('span').textContent;
  }

  function groupTitleOf(key) {
    var box = form.querySelector('input[name="' + key + '"]');
    var legend = box && box.closest('fieldset').querySelector('legend');
    return legend ? legend.textContent : key;
  }

  /* ------------------------------------------------------------------------
     Filtro
     ------------------------------------------------------------------------ */

  function asList(v) {
    return Array.isArray(v) ? v : (v ? [v] : []);
  }

  function matches(item, sel, q) {
    for (var i = 0; i < KEYS.length; i++) {
      var k = KEYS[i];
      if (!sel[k].length) continue;
      var values = asList(item[FIELDS[k]]);
      var hit = sel[k].some(function (v) { return values.indexOf(v) !== -1; });
      if (!hit) return false;
    }
    if (q) {
      var text = [item.name, item.line, item.function, item.description]
        .concat(asList(item.benefits), asList(item.market)).join(' ').toLowerCase();
      if (text.indexOf(q.toLowerCase()) === -1) return false;
    }
    return true;
  }

  /* ------------------------------------------------------------------------
     Schede
     ------------------------------------------------------------------------ */

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  // Pittogrammi delle forme fisiche (images/pittogrammi, PNG provvisori)
  var PICTOS = {
    'powder': 'images/pittogrammi/POLVERI.png',
    'wax': 'images/pittogrammi/CERE.png',
    'wax-pearls': 'images/pittogrammi/CERE-PERLE.png',
    'liquid': 'images/pittogrammi/LIQUIDI.png',
    'liquid-gel': 'images/pittogrammi/LIQUIDI-GEL.png'
  };

  function card(item) {
    var li = el('li', 'fx-card');
    var art = el('article');

    var name = el('h3', 'fx-card-name');
    // Prodotti senza pagina (19/11/2026, WCAG 2.4.4): il nome è testo, non un
    // link che non porta da nessuna parte; niente "Discover more" (più sotto)
    var hasPage = !!item.link && item.link !== '#';
    var link = el(hasPage ? 'a' : 'span', 'fx-card-link' + (hasPage ? '' : ' fx-card-link--none'));
    regName(link, item.name);
    if (hasPage) link.href = item.link;
    name.appendChild(link);
    art.appendChild(name);
    // La riga della funzione c'è sempre, anche vuota (prodotti in bozza,
    // 16/11/2026): la scheda sta su 4 righe condivise (subgrid, finder.css);
    // senza, mercato e riquadro scalano di una riga e l'etichetta si allunga
    var fn = el('p', 'fx-card-function', item.function || '');
    if (!item.function) fn.setAttribute('aria-hidden', 'true');
    art.appendChild(fn);

    // Etichetta del mercato: Personal Care = Antique, Nutraceutical = Olive
    var pills = el('p', 'market-pills fx-card-markets');
    // Prodotti con un colore di linea: l'etichetta è la linea, nel suo colore
    var LINES = { beaulixir: 'Beaulixir', seidotech: 'SeidoTech', glitter: 'Glitter' };
    // 18/11/2026: colore del PRODOTTO dalle specifiche della cliente (hex,
    // pillBg/pillFg già calcolati per il contrasto, lineLabel = linea)
    if (item.hex && item.lineLabel) {
      var pill = el('span', 'market-pill market-pill--line', item.lineLabel);
      pill.style.backgroundColor = item.pillBg;
      pill.style.color = item.pillFg;
      pills.appendChild(pill);
    } else if (item.color && LINES[item.color]) {
      pills.appendChild(el('span', 'market-pill market-pill--' + item.color, LINES[item.color]));
    } else {
      asList(item.market).forEach(function (m) {
        pills.appendChild(el('span', 'market-pill' + (m === 'Nutraceutical' ? ' market-pill--nutra' : ''), m));
      });
    }
    art.appendChild(pills);

    var media = el('div', 'fx-card-media');
    var picto = PICTOS[item.form];
    if (picto) {
      // PROVA SITO 4: pittogramma della forma fisica in vetro, protagonista
      // del riquadro (decorativo). Colore della forma dietro = mercato
      media.classList.add('fx-card-media--picto');
      var visual = el('div', 'picto' + (asList(item.market)[0] === 'Nutraceutical' ? ' picto--nutra' : ''));
      // Colore della linea di prodotto (base.css), se il cliente l'ha dato
      if (item.hex) {
        visual.classList.add('picto--line-custom');
        visual.style.setProperty('--line-color', item.hex);
        // Multicolor (ColorGLAM, ColorEST): il riquadro si riempie col gradiente
        if (item.grad) {
          visual.classList.add('picto--grad');
          visual.style.setProperty('--line-grad', item.grad);
        }
      } else if (item.color) visual.classList.add('picto--line-' + item.color);
      visual.setAttribute('aria-hidden', 'true');
      var frame = el('span', 'picto-frame');
      frame.appendChild(el('span', 'picto-blob'));
      visual.appendChild(frame);
      var pimg = el('img', 'picto-img');
      pimg.src = picto;
      pimg.alt = '';
      pimg.loading = 'lazy';
      pimg.decoding = 'async';
      visual.appendChild(pimg);
      media.appendChild(visual);
    } else {
      var img = el('img');
      img.src = item.texture;
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      media.appendChild(img);
    }

    var glass = el('div', 'fx-card-glass');
    if (item.description) glass.appendChild(el('p', '', item.description));
    // Sotto la descrizione solo le certificazioni (mercato, tecnologia e tipo
    // non si ripetono: il mercato è già nell'etichetta sopra l'immagine)
    if (asList(item.certifications).length) {
      var tags = el('ul', 'fx-card-tags');
      tags.setAttribute('aria-label', 'Certifications');
      item.certifications.forEach(function (c) { tags.appendChild(el('li', '', c)); });
      glass.appendChild(tags);
    }
    // "Discover more →" come in Our Portfolio (06/11/2026); solo a vista:
    // il link vero è il nome
    if (hasPage) {
      var more = el('span', 'fx-card-more', 'Discover more');
      more.setAttribute('aria-hidden', 'true');
      glass.appendChild(more);
    }
    media.appendChild(glass);
    art.appendChild(media);
    li.appendChild(art);
    return li;
  }

  /* ------------------------------------------------------------------------
     Disegno
     ------------------------------------------------------------------------ */

  function plural(n) {
    return n + (n === 1 ? ' ingredient' : ' ingredients');
  }

  /* Telefono (19/11/2026, Chiara): 8 schede alla volta, poi "Load more" con
     il conteggio ("Showing 8 of 48 ingredients"). Le schede oltre il limite
     sono hidden (fuori da tastiera e screen reader). Dopo "Load more" il
     focus va alla prima scheda nuova. */
  /* 20/11/2026 (Chiara): anche su desktop, 12 schede alla volta (3–4 righe) */
  var phoneMq = window.matchMedia('(max-width: 599.98px)');
  function pageSize() { return phoneMq.matches ? 8 : 12; }
  var shown = pageSize();
  var more = document.createElement('div');
  more.className = 'fx-more';
  more.hidden = true;
  var moreText = el('p', 'fx-more-count', '');
  var moreBar = el('span', 'fx-more-bar');
  moreBar.setAttribute('aria-hidden', 'true');
  var moreFill = el('span', 'fx-more-fill');
  moreBar.appendChild(moreFill);
  var moreBtn = el('button', 'btn btn--outline fx-more-btn', 'Load more');
  moreBtn.type = 'button';
  more.appendChild(moreText);
  more.appendChild(moreBar);
  more.appendChild(moreBtn);
  grid.parentNode.insertBefore(more, grid.nextSibling);

  function paginate() {
    var items = grid.children;
    var total = items.length;
    var limit = Math.min(shown, total);
    for (var i = 0; i < total; i++) items[i].hidden = i >= limit;
    more.hidden = limit >= total;
    if (!more.hidden) {
      moreText.textContent = 'Showing ' + limit + ' of ' + plural(total);
      moreFill.style.width = (limit / total * 100) + '%';
    }
  }

  moreBtn.addEventListener('click', function () {
    var first = shown;
    shown += pageSize();
    paginate();
    var next = grid.children[first];
    if (next) {
      next.setAttribute('tabindex', '-1');
      next.focus();
    }
  });

  phoneMq.addEventListener('change', function () { shown = Math.max(shown, pageSize()); paginate(); });

  function render(fromUser) {
    var sel = selected();
    var list = DATA.filter(function (it) { return matches(it, sel, query); });
    var filtering = query || KEYS.some(function (k) { return sel[k].length; });

    grid.textContent = '';
    list.forEach(function (it) { grid.appendChild(card(it)); });
    shown = pageSize();
    paginate();

    countEl.textContent = filtering ? list.length + ' of ' + plural(DATA.length) : plural(DATA.length);
    empty.hidden = list.length > 0;
    grid.hidden = list.length === 0;
    if (applyBtn) applyBtn.textContent = 'Show ' + plural(list.length);

    // Numero di filtri scelti per gruppo e in totale
    var total = 0;
    KEYS.forEach(function (k) {
      total += sel[k].length;
      var box = form.querySelector('input[name="' + k + '"]');
      var c = box && box.closest('details').querySelector('.fx-group-count');
      if (c) c.textContent = sel[k].length ? String(sel[k].length) : '';
    });
    if (openCount) openCount.textContent = total ? String(total) : '';
    if (openBtn) openBtn.setAttribute('aria-label', total ? 'Filters, ' + total + ' selected' : 'Filters');

    renderActive();
    if (fromUser) writeUrl(sel);
  }

  // Filtri attivi: pillole con × (bottoni veri, con nome per lo screen reader)
  function renderActive() {
    activeList.textContent = '';
    if (query) {
      activeList.appendChild(chip('Search: ' + query, 'Remove search “' + query + '”', function () {
        query = '';
        searchInput.value = '';
      }));
    }
    boxes().forEach(function (b) {
      if (!b.checked) return;
      activeList.appendChild(chip(labelOf(b), 'Remove filter ' + groupTitleOf(b.name) + ': ' + labelOf(b), function () {
        b.checked = false;
      }));
    });
  }

  function chip(text, aria, onRemove) {
    var li = el('li');
    var btn = el('button', 'fx-chip');
    btn.type = 'button';
    btn.setAttribute('aria-label', aria);
    btn.appendChild(el('span', '', text));
    btn.addEventListener('click', function () {
      // Dopo la rimozione il focus va alla pillola successiva, o al conteggio
      var items = Array.prototype.slice.call(activeList.querySelectorAll('.fx-chip'));
      var i = items.indexOf(btn);
      onRemove();
      render(true);
      var next = activeList.querySelectorAll('.fx-chip')[i] || activeList.querySelectorAll('.fx-chip')[i - 1];
      if (next) next.focus();
      else { countEl.setAttribute('tabindex', '-1'); countEl.focus(); }
    });
    li.appendChild(btn);
    return li;
  }

  /* ------------------------------------------------------------------------
     Indirizzo della pagina (link condivisibile)
     ------------------------------------------------------------------------ */

  function writeUrl(sel) {
    var params = new URLSearchParams();
    if (query) params.set('q', query);
    KEYS.forEach(function (k) { if (sel[k].length) params.set(k, sel[k].join('|')); });
    var s = params.toString();
    history.replaceState(null, '', location.pathname + (s ? '?' + s : ''));
  }

  function readUrl() {
    var params = new URLSearchParams(location.search);
    query = (params.get('q') || '').trim();
    searchInput.value = query;
    KEYS.forEach(function (k) {
      var vals = (params.get(k) || '').split('|').filter(Boolean);
      form.querySelectorAll('input[name="' + k + '"]').forEach(function (b) {
        b.checked = vals.indexOf(b.value) !== -1;
        // Gruppo con filtri scelti: aperto
        if (b.checked) b.closest('details').open = true;
      });
    });
  }

  /* ------------------------------------------------------------------------
     Eventi
     ------------------------------------------------------------------------ */

  form.addEventListener('change', function () { render(true); });

  searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    query = searchInput.value.trim();
    render(true);
    // Porta ai risultati (utile su mobile)
    document.querySelector('.fx-results').scrollIntoView({ block: 'start' });
  });

  var typing = null;
  searchInput.addEventListener('input', function () {
    clearTimeout(typing);
    typing = setTimeout(function () {
      query = searchInput.value.trim();
      render(true);
    }, 300);
  });

  Array.prototype.forEach.call(clearBtns, function (btn) {
    btn.addEventListener('click', function () {
      boxes().forEach(function (b) { b.checked = false; });
      query = '';
      searchInput.value = '';
      render(true);
      countEl.setAttribute('tabindex', '-1');
      if (!panel.classList.contains('is-open')) countEl.focus();
    });
  });

  /* ------------------------------------------------------------------------
     Pannello filtri su mobile
     ------------------------------------------------------------------------ */

  function focusables() {
    return Array.prototype.slice.call(panel.querySelectorAll('button, summary, input, a[href]'))
      .filter(function (n) { return n.offsetParent !== null || n.tagName === 'INPUT'; });
  }

  function openPanel() {
    panel.classList.add('is-open');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    openBtn.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('has-menu-open');
    setTimeout(function () { closeBtn.focus(); }, 50);
  }

  function closePanel() {
    if (!panel.classList.contains('is-open')) return;
    panel.classList.remove('is-open');
    panel.removeAttribute('role');
    panel.removeAttribute('aria-modal');
    openBtn.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('has-menu-open');
    openBtn.focus();
  }

  openBtn.addEventListener('click', openPanel);
  closeBtn.addEventListener('click', closePanel);
  applyBtn.addEventListener('click', closePanel);

  panel.addEventListener('keydown', function (e) {
    if (!panel.classList.contains('is-open')) return;
    if (e.key === 'Escape') { closePanel(); return; }
    if (e.key !== 'Tab') return;
    var f = focusables().filter(function (n) { return n.tagName !== 'INPUT' || n.closest('details').open; });
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });

  mobileMq.addEventListener('change', function (e) { if (!e.matches) closePanel(); });


  /* ------------------------------------------------------------------------
     Avvio
     ------------------------------------------------------------------------ */

  readUrl();
  render(false);
})();
