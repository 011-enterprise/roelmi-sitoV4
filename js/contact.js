/* ==========================================================================
   Contatti (10/11/2026)
   Sedi: ora locale di ogni ufficio (Intl, fuso in data-tz), aggiornata
      ogni 30 secondi. Senza JS o senza Intl la riga dell ora resta nascosta
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
})();
