/* ==========================================================================
   Contatti (10/11/2026)
   Sedi: ora locale di ogni ufficio (Intl, fuso in data-tz), aggiornata
      ogni 30 secondi. Senza JS o senza Intl la riga dell ora resta nascosta
   Sedi a tendina sul telefono (13/11/2026, Chiara: pagina troppo lunga):
      sotto 600px il nome della città diventa un bottone (aria-expanded) che
      apre società e indirizzo; chiuse all'inizio. Città, paese e ora restano
      sempre visibili. Da 600px in su e senza JS tutto aperto come prima
   ========================================================================== */

(function () {
  'use strict';

  /* Ora locale delle sedi */
  var times = Array.prototype.slice.call(document.querySelectorAll('.ct-office-time time[data-tz]'));
  function drawTimes() {
    var now = new Date();
    times.forEach(function (t) {
      try {
        var hm = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: t.getAttribute('data-tz') }).format(now);
        t.textContent = hm;
        t.setAttribute('datetime', hm);
        t.parentNode.hidden = false;
      } catch (e) { /* fuso non supportato: resta nascosta */ }
    });
  }
  if (times.length && window.Intl) {
    drawTimes();
    window.setInterval(drawTimes, 30000);
  }

  /* Sedi a tendina sul telefono */
  var phone = window.matchMedia('(max-width: 599.98px)');
  var offices = Array.prototype.slice.call(document.querySelectorAll('.ct-office'));

  offices.forEach(function (o, i) {
    var parts = [o.querySelector('.ct-office-who'), o.querySelector('.ct-office-address')]
      .filter(Boolean);
    parts.forEach(function (p, j) { if (!p.id) p.id = 'ct-office-' + (i + 1) + '-' + (j + 1); });
    o._parts = parts;
  });

  function setOpen(o, btn, open) {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    o.classList.toggle('is-open', open);
    o._parts.forEach(function (p) { p.hidden = !open; });
  }

  function setup() {
    offices.forEach(function (o) {
      var city = o.querySelector('.ct-office-city');
      if (!city) return;
      var btn = city.querySelector('.ct-office-toggle');
      if (phone.matches && !btn) {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ct-office-toggle';
        btn.setAttribute('aria-controls', o._parts.map(function (p) { return p.id; }).join(' '));
        while (city.firstChild) btn.appendChild(city.firstChild);
        city.appendChild(btn);
        btn.addEventListener('click', function () {
          setOpen(o, btn, btn.getAttribute('aria-expanded') !== 'true');
        });
        setOpen(o, btn, false);
      } else if (!phone.matches && btn) {
        while (btn.firstChild) city.insertBefore(btn.firstChild, btn);
        btn.remove();
        o.classList.remove('is-open');
        o._parts.forEach(function (p) { p.hidden = false; });
      }
    });
  }

  if (offices.length) {
    setup();
    if (phone.addEventListener) phone.addEventListener('change', setup);
    else if (phone.addListener) phone.addListener(setup);
  }
})();
