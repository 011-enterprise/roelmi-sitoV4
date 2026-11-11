/* ==========================================================================
   Global Presence
   1. Filtri per categoria (aria-pressed + annuncio del risultato)
   2. Elenco ↔ mappa: passando su una sede si accende il suo punto
   3. Scheda: clic su una sede (elenco) o su un punto (mappa) → dettagli.
      Il punto Italia apre l'elenco delle sedi italiane.
      Focus sul titolo della scheda; Esc o × chiudono e il focus torna
      a chi l'ha aperta.
   ========================================================================== */

(function () {
  'use strict';

  var section = document.getElementById('presence');
  if (!section) return;

  var pills = Array.prototype.slice.call(section.querySelectorAll('.filter-pill'));
  var groups = Array.prototype.slice.call(section.querySelectorAll('.presence-group'));
  var buttons = Array.prototype.slice.call(section.querySelectorAll('.site-btn'));
  var pins = Array.prototype.slice.call(section.querySelectorAll('.map-pin'));
  var status = section.querySelector('.presence-status');

  var card = document.getElementById('siteCard');
  var cardTitle = card.querySelector('.site-card-title');
  var cardType = card.querySelector('.site-card-type-text');
  var cardDot = card.querySelector('.site-card-type .cat-dot');
  var cardDesc = card.querySelector('.site-card-desc');
  var cardList = card.querySelector('.site-card-list');
  var cardClose = card.querySelector('.site-card-close');
  var opener = null;
  var filter = 'all';

  function typeOf(btn) {
    return btn.closest('.presence-group').getAttribute('data-type');
  }

  function typeLabel(type) {
    var h = section.querySelector('.presence-group[data-type="' + type + '"] h3');
    return h ? h.textContent.trim() : '';
  }

  function pinFor(groupId) {
    return section.querySelector('.map-pin[data-group="' + groupId + '"]');
  }

  /* ------------------------------------------------------------------------
     1. Filtri
     ------------------------------------------------------------------------ */

  function applyFilter(type) {
    filter = type;
    pills.forEach(function (p) {
      p.setAttribute('aria-pressed', p.getAttribute('data-filter') === type ? 'true' : 'false');
    });

    var count = 0;
    groups.forEach(function (g) {
      var show = type === 'all' || g.getAttribute('data-type') === type;
      g.hidden = !show;
      if (show) count += g.querySelectorAll('li').length;
    });

    pins.forEach(function (pin) {
      var types = pin.getAttribute('data-types').split(' ');
      var off = type !== 'all' && types.indexOf(type) === -1;
      pin.classList.toggle('is-off', off);
      // Italia: con un filtro prende il colore di quella categoria
      if (types.length > 1) {
        if (type !== 'all' && !off) pin.setAttribute('data-show', type);
        else pin.removeAttribute('data-show');
      }
    });

    closeCard(false);

    if (status) {
      var label = type === 'all' ? 'All locations' : typeLabel(type);
      status.textContent = label + ': ' + count + (count === 1 ? ' location' : ' locations');
    }
  }

  pills.forEach(function (p) {
    p.addEventListener('click', function () { applyFilter(p.getAttribute('data-filter')); });
  });

  /* ------------------------------------------------------------------------
     2. Elenco ↔ mappa (passaggio del mouse)
     ------------------------------------------------------------------------ */

  // 11/11/2026 (Chiara): sede scelta → il suo punto resta acceso con
  // l'etichetta "Città, Paese" (es. "Naples, Italy") e gli altri punti si
  // spengono (.is-focused sulla mappa), finché la scheda resta aperta
  var map = section.querySelector('.presence-map');
  var selectedPin = null;
  var selectedLabel = '';

  // Paese dalla riga sotto il nome: "Production hub — Campania, Italy" → Italy
  function countryOf(btn) {
    var sub = btn.querySelector('.site-sub');
    var part = (sub ? sub.textContent : '').split('—').pop().split(',').pop();
    return part.replace(/\(.*?\)/g, '').trim();
  }

  function labelFor(btn) {
    var name = btn.querySelector('.site-name').textContent;
    var country = countryOf(btn);
    return country && country !== name ? name + ', ' + country : name;
  }

  function markPin(pin, text) {
    pin.classList.add('is-active');
    pin.querySelector('.map-pin-label').textContent = text;
  }

  function setFocus(on) {
    if (map) map.classList.toggle('is-focused', on);
  }

  function clearHighlight() {
    pins.forEach(function (pin) {
      pin.classList.remove('is-active');
      var label = pin.querySelector('.map-pin-label');
      label.textContent = label.getAttribute('data-default');
    });
    buttons.forEach(function (b) { b.classList.remove('is-linked'); });
    // La sede scelta resta accesa anche quando il mouse o il focus vanno altrove
    if (selectedPin) markPin(selectedPin, selectedLabel);
  }

  function highlightSite(btn) {
    clearHighlight();
    var pin = pinFor(btn.getAttribute('data-group'));
    if (!pin) return;
    markPin(pin, labelFor(btn));
    btn.classList.add('is-linked');
  }

  pins.forEach(function (pin) {
    var label = pin.querySelector('.map-pin-label');
    label.setAttribute('data-default', label.textContent);
  });

  buttons.forEach(function (btn) {
    btn.addEventListener('mouseenter', function () { highlightSite(btn); });
    btn.addEventListener('focus', function () { highlightSite(btn); });
    btn.addEventListener('mouseleave', clearHighlight);
    btn.addEventListener('blur', clearHighlight);
  });

  /* ------------------------------------------------------------------------
     3. Scheda
     ------------------------------------------------------------------------ */

  function setDot(type) {
    cardDot.className = 'cat-dot' + (type ? ' cat--' + type : '');
  }

  var stage = section.querySelector('.presence-stage');

  function reducedMotion() {
    return (window.RoelmiMotion && window.RoelmiMotion.isPaused()) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // 06/11/2026 (Chiara): aprendo una sede dall elenco sotto la mappa la
  // pagina torna SEMPRE su, con mappa e scheda in vista. Prima ci pensava
  // solo focus(), che scorre soltanto se il titolo è fuori dallo schermo
  // (e il minimo indispensabile): a volte la mappa restava fuori.
  // scroll-padding-top di base.css tiene conto della barra in alto
  function showCard(from, scrollUp) {
    opener = from || null;
    card.hidden = false;
    if (scrollUp && stage) {
      stage.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
      cardTitle.focus({ preventScroll: true });
    } else {
      cardTitle.focus();
    }
  }

  function openSite(btn, from, scrollUp) {
    buttons.forEach(function (b) { b.setAttribute('aria-expanded', b === btn ? 'true' : 'false'); });
    var type = typeOf(btn);
    setDot(type);
    cardType.textContent = typeLabel(type);
    cardTitle.textContent = btn.querySelector('.site-name').textContent;
    cardDesc.textContent = btn.parentNode.querySelector('.site-desc').textContent;
    cardList.textContent = '';
    selectedPin = pinFor(btn.getAttribute('data-group'));
    selectedLabel = labelFor(btn);
    setFocus(true);
    highlightSite(btn);
    showCard(from || btn, scrollUp);
  }

  // Punto con più sedi (Italia): elenco delle sedi visibili con il filtro
  function openGroup(pin) {
    var groupId = pin.getAttribute('data-group');
    var list = buttons.filter(function (b) {
      return b.getAttribute('data-group') === groupId &&
        (filter === 'all' || typeOf(b) === filter);
    });
    if (list.length === 1) { openSite(list[0], list[0]); return; }

    buttons.forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    selectedPin = pin;
    selectedLabel = pin.querySelector('.map-pin-label').getAttribute('data-default');
    setFocus(true);
    clearHighlight();
    setDot('');
    cardType.textContent = list.length + ' locations';
    cardTitle.textContent = pin.querySelector('.map-pin-label').getAttribute('data-default');
    cardDesc.textContent = '';
    cardList.textContent = '';
    list.forEach(function (b) {
      var li = document.createElement('li');
      var item = document.createElement('button');
      item.type = 'button';
      var dot = document.createElement('span');
      dot.className = 'cat-dot cat--' + typeOf(b);
      dot.setAttribute('aria-hidden', 'true');
      item.appendChild(dot);
      item.appendChild(document.createTextNode(b.querySelector('.site-name').textContent));
      item.addEventListener('click', function () { openSite(b, b); });
      li.appendChild(item);
      cardList.appendChild(li);
    });
    showCard(list[0] || null);
  }

  function closeCard(returnFocus) {
    if (card.hidden) return;
    card.hidden = true;
    buttons.forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    selectedPin = null;
    setFocus(false);
    clearHighlight();
    if (returnFocus && opener) opener.focus();
    opener = null;
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.getAttribute('aria-expanded') === 'true') closeCard(true);
      else openSite(btn, btn, true);
    });
  });

  // Clic sui punti della mappa (mouse)
  pins.forEach(function (pin) {
    var hit = pin.querySelector('.map-pin-hit');
    hit.addEventListener('mouseenter', function () {
      clearHighlight();
      pin.classList.add('is-active');
      buttons.forEach(function (b) {
        if (b.getAttribute('data-group') === pin.getAttribute('data-group')) b.classList.add('is-linked');
      });
    });
    hit.addEventListener('mouseleave', function () { if (card.hidden) clearHighlight(); });
    hit.addEventListener('click', function () { openGroup(pin); });
  });

  cardClose.addEventListener('click', function () { closeCard(true); });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !card.hidden) closeCard(true);
  });
})();

/* ==========================================================================
   Gruppi a tendina (<details>), chiusi all'inizio su tutti gli schermi
   (SITO 4, richiesta del cliente). Si aprono dal titolo; scegliendo un
   filtro si apre da solo il gruppo corrispondente ("All" li richiude).
   ========================================================================== */

(function () {
  'use strict';

  var section = document.getElementById('presence');
  if (!section) return;

  var groups = Array.prototype.slice.call(section.querySelectorAll('details.presence-group'));

  section.querySelectorAll('.filter-pill').forEach(function (p) {
    p.addEventListener('click', function () {
      var type = p.getAttribute('data-filter');
      groups.forEach(function (g) { g.open = type !== 'all' && g.getAttribute('data-type') === type; });
    });
  });
})();
