/* ==========================================================================
   Moduli — controllo accessibile (comune: Contatti, Careers)
   Vale per ogni <form data-validate>:
   - All'invio ogni campo obbligatorio vuoto o sbagliato riceve il suo
     messaggio sotto (aria-invalid + aria-describedby), in cima un riepilogo
     annunciato (.fm-summary) e il focus va sul primo campo da correggere
   - Mentre lo si corregge, un campo già segnato si ricontrolla
   - File: tipo (data-accept-ext, es. "pdf") e peso (data-max-kb) controllati,
     con il loro messaggio (data-msg-type, data-msg-size)
   - Tutto giusto: conferma (.fm-status, testo in data-success), modulo vuoto.
     L'INVIO VERO NON È COLLEGATO: va aggiunto quando c'è il server
   Messaggi d'errore negli attributi data-msg dei paragrafi .fm-error.
   Senza JS restano i controlli del browser (required, type="email").
   ========================================================================== */

(function () {
  'use strict';

  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  Array.prototype.forEach.call(document.querySelectorAll('form[data-validate]'), function (form) {
    var summary = form.querySelector('.fm-summary');
    var status = form.querySelector('.fm-status');
    var fields = Array.prototype.slice.call(form.querySelectorAll('[required]'));

    function errorEl(field) {
      return document.getElementById(field.id + '-err');
    }

    // Messaggio d'errore del campo, o '' se va bene
    function check(field) {
      var err = errorEl(field);
      if (field.type === 'checkbox') return field.checked ? '' : err.getAttribute('data-msg');
      if (field.type === 'file') {
        var f = field.files && field.files[0];
        if (!f) return err.getAttribute('data-msg');
        var ext = field.getAttribute('data-accept-ext');
        if (ext && f.name.toLowerCase().split('.').pop() !== ext) return err.getAttribute('data-msg-type');
        var max = parseInt(field.getAttribute('data-max-kb'), 10);
        if (max && f.size > max * 1024) return err.getAttribute('data-msg-size');
        return '';
      }
      var v = field.value.trim();
      if (!v) return err.getAttribute('data-msg');
      if (field.type === 'email' && !emailRe.test(v)) return err.getAttribute('data-msg-format');
      return '';
    }

    function show(field, msg) {
      var err = errorEl(field);
      if (msg) {
        field.setAttribute('aria-invalid', 'true');
        err.textContent = msg;
        err.hidden = false;
      } else {
        field.removeAttribute('aria-invalid');
        err.textContent = '';
        err.hidden = true;
      }
    }

    fields.forEach(function (field) {
      var ev = /checkbox|file/.test(field.type) || field.tagName === 'SELECT' ? 'change' : 'input';
      field.addEventListener(ev, function () {
        // il file si controlla subito (tipo e peso), gli altri solo se già segnati
        if (field.type === 'file' || field.getAttribute('aria-invalid') === 'true') show(field, check(field));
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (status) status.textContent = '';

      var wrong = [];
      fields.forEach(function (field) {
        var msg = check(field);
        show(field, msg);
        if (msg) wrong.push(field);
      });

      if (wrong.length) {
        if (summary) {
          summary.textContent = wrong.length === 1
            ? '1 field needs your attention.'
            : wrong.length + ' fields need your attention.';
          summary.hidden = false;
        }
        wrong[0].focus();
        return;
      }

      if (summary) {
        summary.hidden = true;
        summary.textContent = '';
      }
      // Qui andrà l'invio al server
      form.reset();
      if (status) status.textContent = form.getAttribute('data-success') || 'Thank you.';
    });
  });
})();
