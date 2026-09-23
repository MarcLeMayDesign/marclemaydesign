/* The principle screen pattern.

   One renderer, four screens, and after this the remaining principles are
   content rather than work: add an entry to content/principles.js and a
   section carrying the hooks, and it draws itself.

   What it fills, if present in the screen:
     [data-prin-eyebrow]   the small line
     [data-prin-title]     the h1
     [data-prin-body]      paragraphs, one <p class="screen-body"> each
     [data-prin-home]      the two-line "at home" pair under the graphic

   What it never touches: the graphic. The levels ladder and the iceberg are
   markup in the page with their own closures in app.js, and they sit between
   the body and the home block untouched. A principle with no graphic simply
   has nothing there — the pattern does not require one.

   It renders once, at load, not on navigation: the text is the same every
   time a parent returns to the screen, and re-rendering on show would throw
   away the open/closed state of anything inside. */

(function () {
  'use strict';

  var DATA = window.CDAH_PRINCIPLES;
  if (!DATA) return;

  function fillText(host, value) {
    if (host && value) host.innerHTML = value;
  }

  function fillBody(host, paras) {
    if (!host || !paras || !paras.length) return;
    var html = '';
    for (var i = 0; i < paras.length; i++) {
      html += '<p class="screen-body">' + paras[i] + '</p>';
    }
    host.innerHTML = html;
  }

  /* The pair reads as one idea in two moves, so it is one block with two
     labeled rows rather than two cards. Labels are copy, not chrome: NOTICE
     is what the lens shows you, TRY is what you do with it. */
  function fillHome(host, home) {
    if (!host) return;
    if (!home) { host.hidden = true; return; }
    var html = '';
    if (home.notice) {
      html += '<p class="home-row"><span class="home-k">NOTICE</span>' +
              '<span class="home-t">' + home.notice + '</span></p>';
    }
    if (home.try) {
      html += '<p class="home-row"><span class="home-k">TRY</span>' +
              '<span class="home-t">' + home.try + '</span></p>';
    }
    if (!html) { host.hidden = true; return; }
    host.innerHTML = html;
    host.hidden = false;
  }

  var screens = document.querySelectorAll('[data-principle]');
  for (var i = 0; i < screens.length; i++) {
    var el = screens[i];
    var d = DATA[el.id];
    if (!d) continue;
    fillText(el.querySelector('[data-prin-eyebrow]'), d.eyebrow);
    fillText(el.querySelector('[data-prin-title]'), d.title);
    fillBody(el.querySelector('[data-prin-body]'), d.body);
    fillHome(el.querySelector('[data-prin-home]'), d.home);
  }
})();
