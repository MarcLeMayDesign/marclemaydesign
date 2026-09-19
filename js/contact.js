/* Contact form: posts by fetch so the sender stays on the site.
   The form's own action/method already works without this file — if JS
   fails to load, the browser submits to Formspree and shows their page. */
(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;
  var sent = document.getElementById('form-sent');
  var err = document.getElementById('form-error');
  var btn = form.querySelector('.send');
  var FALLBACK = 'That didn\u2019t send. Please email me directly at marclemaydesign@gmail.com.';

  function fail(msg) {
    err.textContent = msg;
    err.hidden = false;
    btn.disabled = false;
    btn.textContent = 'Send';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    err.hidden = true;
    btn.disabled = true;
    btn.textContent = 'Sending\u2026';

    fetch(form.action, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form)
    }).then(function (res) {
      if (res.ok) {
        form.hidden = true;
        sent.hidden = false;
        return;
      }
      return res.json().then(function (data) {
        var msg = data && data.errors && data.errors.length
          ? data.errors.map(function (x) { return x.message; }).join(' ')
          : FALLBACK;
        fail(msg);
      }, function () { fail(FALLBACK); });
    }, function () {
      fail('That didn\u2019t send \u2014 the connection failed. Please email me directly at marclemaydesign@gmail.com.');
    });
  });
})();
