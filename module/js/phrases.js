/* SCR-500, the phrase cards. Built from content/phrases.js. Read-only: a
   parent in a hard moment needs words, not interactions. The jump chips
   scroll the stage to a group (stage.scrollTo, never scrollIntoView). */
(function () {
  var D = window.CDAH_PHRASES;
  var sec = document.getElementById('scr-500');
  if (!D || !sec) return;

  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }

  var f = sec.querySelectorAll('[data-pc]');
  for (var i = 0; i < f.length; i++) { var k = f[i].getAttribute('data-pc'); if (D[k]) f[i].textContent = D[k]; }

  var jump = sec.querySelector('[data-pc-jump]');
  var list = sec.querySelector('[data-pc-list]');
  var stage = document.getElementById('stage');
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  D.moves.forEach(function (m) {
    var g = el('section', 'pc-group');
    g.id = 'pc-' + m.id;
    g.setAttribute('data-move', m.id);
    g.setAttribute('aria-labelledby', 'pc-h-' + m.id);
    var h = el('h2', null, m.title); h.id = 'pc-h-' + m.id; h.setAttribute('tabindex', '-1');
    g.appendChild(h);
    if (m.note) g.appendChild(el('p', 'pc-note', m.note));
    var cards = el('div', 'pc-cards');
    m.cards.forEach(function (c) {
      var card = el('div', 'pc-card');
      card.appendChild(el('p', 'pc-say', '\u201C' + c.say + '\u201D'));
      if (c.school) {
        var s = el('p', 'pc-school');
        s.appendChild(el('b', null, D.schoolK + ' '));
        s.appendChild(document.createTextNode(c.school));
        card.appendChild(s);
      }
      cards.appendChild(card);
    });
    g.appendChild(cards);
    list.appendChild(g);

    var chip = el('button', 'pc-chip', m.title);
    chip.type = 'button';
    chip.addEventListener('click', function () {
      if (stage) {
        var y = stage.scrollTop + g.getBoundingClientRect().top - stage.getBoundingClientRect().top - 16;
        stage.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
      }
      h.focus({ preventScroll: true });
    });
    jump.appendChild(chip);
  });

  /* The printable sheet (1 Oct): its own block at the end of <body>, the
     only thing shown when printing from a print button. Ctrl/Cmd-P from
     anywhere else prints nothing special. */
  var sheet = el('div', 'pc-print');
  sheet.id = 'pcPrint';
  sheet.setAttribute('aria-hidden', 'true');
  sheet.appendChild(el('h1', null, D.printTitle || D.title));
  if (D.printNote) sheet.appendChild(el('p', 'pc-print-note', D.printNote));
  var grid = el('div', 'pc-print-grid');
  D.moves.forEach(function (m) {
    m.cards.forEach(function (c) {
      var card = el('div', 'pc-print-card');
      card.appendChild(el('p', 'pc-print-k', m.title + (m.id === 'composure' ? ' \u00b7 to yourself' : '')));
      card.appendChild(el('p', 'pc-print-say', '\u201C' + c.say + '\u201D'));
      if (c.school) card.appendChild(el('p', 'pc-print-school', D.schoolK + ' ' + c.school));
      grid.appendChild(card);
    });
  });
  sheet.appendChild(grid);
  if (D.printFoot) sheet.appendChild(el('p', 'pc-print-foot', D.printFoot));
  document.body.appendChild(sheet);
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-pc-print]');
    if (!t) return;
    document.body.classList.add('pc-printing');
    window.print();
  });
  window.addEventListener('afterprint', function () { document.body.classList.remove('pc-printing'); });

  /* The panel's door: close the drawer, then go. */
  var pp = document.getElementById('panelPhrases');
  if (pp) pp.addEventListener('click', function () {
    var x = document.getElementById('panelX');
    if (x) x.click();
    location.hash = 'scr-500';
  });
})();
