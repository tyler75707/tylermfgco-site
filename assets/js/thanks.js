// Quote thank-you page: shows the reference number passed from the form, with a copy button.
// With no number (JavaScript off, or the page opened directly) the generic text stays.
(function () {
  var ref = new URLSearchParams(window.location.search).get('ref');
  if (!ref) {
    try { ref = sessionStorage.getItem('quoteRef'); } catch (err) { /* private mode */ }
  }
  if (!ref || !/^[A-Z]{1,5}-\d{6}-[A-Z0-9]{4}$/.test(ref)) return;

  document.querySelectorAll('[data-ref]').forEach(function (el) { el.textContent = ref; });
  var box = document.getElementById('ref-box');
  if (box) box.hidden = false;

  var copy = document.getElementById('ref-copy');
  if (copy && navigator.clipboard) {
    copy.addEventListener('click', function () {
      navigator.clipboard.writeText(ref).then(function () {
        copy.textContent = 'Copied';
        setTimeout(function () { copy.textContent = 'Copy'; }, 2000);
      });
    });
  } else if (copy) {
    copy.hidden = true;
  }
})();
