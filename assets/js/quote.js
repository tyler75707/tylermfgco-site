// Quote form: checks the "What do you need?" boxes, adds a reference number,
// sends the request to Web3Forms and goes to the thank-you page with the number.
// Without JavaScript the form still posts to Web3Forms (no reference number).
(function () {
  var form = document.getElementById('quote-form');
  if (!form) return;

  var status = form.querySelector('.form-status');
  var button = form.querySelector('button[type="submit"]');
  var boxes = Array.prototype.slice.call(form.querySelectorAll('input[name="What do you need"]'));
  var email = form.getAttribute('data-email');

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  // e.g. TM-261028-4F7Q: prefix, YYMMDD, 4 random characters (no 0/O or 1/I/L to misread).
  function makeRef(prefix) {
    var chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    var d = new Date();
    var ymd = String(d.getFullYear()).slice(2) + pad(d.getMonth() + 1) + pad(d.getDate());
    var bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    var tail = '';
    for (var i = 0; i < bytes.length; i++) tail += chars[bytes[i] % chars.length];
    return prefix + '-' + ymd + '-' + tail;
  }

  function say(text, isError) {
    status.textContent = text;
    status.classList.toggle('is-error', !!isError);
  }

  boxes.forEach(function (b) {
    b.addEventListener('change', function () { boxes[0].setCustomValidity(''); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var checked = boxes.filter(function (b) { return b.checked; });
    if (!checked.length) {
      boxes[0].setCustomValidity('Pick at least one. "Not sure" is fine.');
      boxes[0].reportValidity();
      return;
    }

    var key = form.elements['access_key'] && form.elements['access_key'].value;
    if (!key || key.indexOf('REPLACE') === 0) {
      say('The quote form isn’t connected yet. Please email ' + email + ' directly.', true);
      return;
    }

    var ref = makeRef(form.getAttribute('data-ref-prefix') || 'TM');
    var who = form.elements['Company'].value.trim() || form.elements['name'].value.trim();
    var data = {};
    new FormData(form).forEach(function (value, name) {
      if (name !== 'What do you need' && name !== 'redirect') data[name] = value;
    });
    data['What do you need'] = checked.map(function (b) { return b.value; }).join(', ');
    data['Reference number'] = ref;
    data.subject = 'Quote request ' + ref + ' – ' + who;

    button.disabled = true;
    say('Sending…');

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (r) { return r.json(); })
      .then(function (json) {
        if (!json.success) throw new Error(json.message || 'Not sent');
        try { sessionStorage.setItem('quoteRef', ref); } catch (err) { /* private mode */ }
        window.location.href = '/contact/thank-you/?ref=' + encodeURIComponent(ref);
      })
      .catch(function () {
        button.disabled = false;
        say('Something went wrong sending your request. Please try again, or email ' + email + '.', true);
      });
  });
})();
