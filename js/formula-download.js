/* ==========================================================================
   Formula singola (modello pagina prodotto) — download del PDF (25/11/2026)
   - "Download formula" nell apertura: la prima volta apre il modulo nel
     <dialog> (focus intrappolato ed Esc dal browser); inviato il modulo
     (js/form.js lancia fm:success) l utente resta riconosciuto in questo
     browser (localStorage, solo il nome) e i download successivi sono
     diretti, con "Downloading as … Not you?"
   - PROTOTIPO: il PDF arriverà da WordPress (Download Manager); qui solo il
     messaggio. Mail del 24/11: "utente riconosciuto finché non svuota la cache"
   ========================================================================== */

(function () {
  'use strict';

  var btn = document.querySelector('[data-formula-download]');
  var dialog = document.getElementById('foDialog');
  if (!btn || !dialog) return;

  var KEY = 'roelmi-formula-user';
  var status = document.querySelector('[data-formula-status]');
  var known = document.querySelector('[data-formula-known]');
  var form = document.getElementById('foForm');

  function user() {
    try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; }
  }

  function showKnown() {
    var u = user();
    known.textContent = '';
    known.hidden = !u;
    if (!u) return;
    known.appendChild(document.createTextNode('Downloading as ' + u.name + '. '));
    var forget = document.createElement('button');
    forget.type = 'button';
    forget.className = 'pd-forget';
    forget.textContent = 'Not you?';
    forget.addEventListener('click', function () {
      try { localStorage.removeItem(KEY); } catch (e) {}
      status.textContent = '';
      showKnown();
      btn.focus();
    });
    known.appendChild(forget);
  }

  function download(name) {
    status.textContent = 'Thank you, ' + name + '. On the live website the formula sheet (PDF) downloads here.';
  }

  btn.addEventListener('click', function () {
    var u = user();
    if (u) { download(u.name); return; }
    dialog.showModal();
  });

  dialog.querySelector('[data-formula-close]').addEventListener('click', function () { dialog.close(); });
  // Clic sul fondo scuro fuori dal riquadro: chiude
  dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', function () { btn.focus(); });

  form.addEventListener('fm:success', function () {
    var name = form.elements.name.value.trim();
    try { localStorage.setItem(KEY, JSON.stringify({ name: name })); } catch (e) {}
    dialog.close();
    showKnown();
    download(name);
  });

  showKnown();
})();
