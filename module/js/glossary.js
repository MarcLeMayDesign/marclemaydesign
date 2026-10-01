/* "What the words mean", inside the About & reference panel. A second view
   of the same drawer: the panel's cards hide, the glossary shows, and Back
   returns to About & reference rather than closing (5e, Sept 10). Closing
   the panel resets it, so it always reopens on About & reference. */
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

  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }

  G.forEach(function (g) {
    var c = el('div', 'card gl-item');
    c.appendChild(el('h3', null, g.term));
    c.appendChild(el('p', null, g.plain));
    if (g.say) {
      var s = el('p', 'gl-say');
      s.appendChild(el('span', 'gl-k', g.to === 'yourself' ? 'Say to yourself' : 'Try saying'));
      s.appendChild(el('span', 'gl-q', '\u201C' + g.say + '\u201D'));
      c.appendChild(s);
    }
    list.appendChild(c);
  });

  function setView(gloss, quiet) {
    for (var i = 0; i < cards.length; i++) cards[i].hidden = gloss;
    view.hidden = !gloss;
    if (title) title.textContent = gloss ? (view.getAttribute('data-title') || mainTitle) : mainTitle;
    panel.scrollTop = 0;
    if (!quiet) (gloss ? back : open).focus();
  }

  open.addEventListener('click', function () { setView(true); });
  back.addEventListener('click', function () { setView(false); });
  new MutationObserver(function () { if (panel.hidden && !view.hidden) setView(false, true); })
    .observe(panel, { attributes: true, attributeFilter: ['hidden'] });
})();
