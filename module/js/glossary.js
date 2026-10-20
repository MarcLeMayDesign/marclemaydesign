/* "What the words mean", inside the Help drawer. A second view of the same
   drawer: the panel's cards hide, the glossary shows, and Back returns to
   Help rather than closing (5e, Sept 10). Closing the panel resets it.

   16 Oct (Marc): two groups, each A–Z, "Brain State:" terms pinned first;
   long definitions clamp at three lines with See more.
   19 Oct (Marc): one line, and a say line counts as one. */
(function () {
  var G = window.CDAH_GLOSSARY;
  var panel = document.getElementById('panel');
  var view = document.getElementById('panelGloss');
  var open = document.getElementById('glossOpen');
  if (!G || !panel || !view || !open) return;

  var title = document.getElementById('panelTitle');
  var mainTitle = title ? title.textContent : '';
  var back = view.querySelector('[data-gl-back]');
  var list = view.querySelector('[data-gl-list]');
  var cards = Array.prototype.filter.call(panel.children, function (c) { return c.classList.contains('card'); });
  var mores = [];

  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }

  var PIN = ['Brain State: Executive', 'Brain State: Emotional', 'Brain State: Survival'];
  function key(t) { return t.replace(/^the\s+/i, '').toLowerCase(); }
  function sorted(arr) {
    return arr.slice().sort(function (a, b) {
      var pa = PIN.indexOf(a.term), pb = PIN.indexOf(b.term);
      if (pa > -1 || pb > -1) return (pa > -1 ? pa : 99) - (pb > -1 ? pb : 99);
      return key(a.term) < key(b.term) ? -1 : key(a.term) > key(b.term) ? 1 : 0;
    });
  }

  var uid = 0;
  function item(g) {
    var c = el('div', 'card gl-item');
    c.appendChild(el('h4', null, g.term));
    var d = el('p', 'gl-def', g.plain);
    d.id = 'gl-def-' + (++uid);
    c.appendChild(d);
    var m = el('button', 'gl-more', 'See more');
    m.type = 'button'; m.hidden = true;
    m.setAttribute('aria-expanded', 'false');
    m.setAttribute('aria-controls', d.id);
    m.addEventListener('click', function () {
      var on = !c.classList.contains('is-open');
      c.classList.toggle('is-open', on);
      m.textContent = on ? 'See less' : 'See more';
      m.setAttribute('aria-expanded', on ? 'true' : 'false');
    });
    c.appendChild(m);
    mores.push({ d: d, m: m, c: c, say: !!g.say });
    if (g.say) {
      var s = el('p', 'gl-say');
      s.appendChild(el('span', 'gl-k', g.to === 'yourself' ? 'Say to yourself' : 'Try saying'));
      s.appendChild(el('span', 'gl-q', '\u201C' + g.say + '\u201D'));
      c.appendChild(s);
    }
    list.appendChild(c);
  }

  var L = window.CDAH_GLOSSARY_LEARN || [];
  if (L.length) { list.appendChild(el('h3', 'gl-h', 'Terms from Learn')); sorted(L).forEach(item); }
  list.appendChild(el('h3', 'gl-h', L.length ? 'Other terms your child\u2019s school uses' : 'Terms your child\u2019s school uses'));
  sorted(G).forEach(item);

  /* See more only where there's more than one line: a definition that
     overflows its one line, or any term with a say line. Measured when the
     view is showing, since a hidden box has no height. */
  function measure() {
    mores.forEach(function (x) {
      if (x.c.classList.contains('is-open')) return;
      x.m.hidden = !x.say && x.d.scrollHeight <= x.d.clientHeight + 1;
    });
  }
  window.addEventListener('resize', function () { if (!view.hidden) measure(); });

  function setView(gloss, quiet) {
    for (var i = 0; i < cards.length; i++) cards[i].hidden = gloss;
    view.hidden = !gloss;
    var main = panel.getAttribute('data-main') || mainTitle;
    if (title) title.textContent = gloss ? (view.getAttribute('data-title') || main) : main;
    panel.scrollTop = 0;
    if (gloss) measure();
    if (!quiet) (gloss ? back : open).focus();
  }

  open.addEventListener('click', function () { setView(true); });
  back.addEventListener('click', function () { setView(false); });
  new MutationObserver(function () { if (panel.hidden && !view.hidden) setView(false, true); })
    .observe(panel, { attributes: true, attributeFilter: ['hidden'] });
})();
