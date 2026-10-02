/* Motion utilities. Two of them, both lifted out of the pose prototype so
   the engine packages inherit motion that has already been looked at:

     CDAH_FX.enter(el)        the screen change — a short rise and fade in.
     CDAH_FX.layers(root)     the stacked crossfade the pose rail needs.

   The crossfade is opacity-only on purpose: a pose change is the same
   screen saying something else. The screen enter (rebuilt 2 Oct) adds
   small rises and, on a section change, a fade through the old ground.

   Reduced motion is handled in CSS (module.css zeroes every transition), so
   these do not need to branch for it — except where JS sequences a delay,
   which is the one thing CSS cannot turn off. */

(function () {
  'use strict';

  function reduced() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /* ---- screen enter ---------------------------------------------------- */

  /* Rebuilt 2 Oct [MARC]: "a transition between all slides, bigger ones
     reserved for moving into a new section; nothing that calls attention to
     itself." Two weights, Web Animations only (nothing left on the element
     afterward, so no CSS state can stick):

       normal   the screen fades and rises 8px (260ms); figures rise a little
                later; rows (lenses, shifts, contrast rows) settle in a short
                stagger.
       big      on a section change. The old ground fades out over the new
                screen (a veil), the content blocks rise in sequence, figures
                rise with a slight settle, and the title rows slide in from
                the left with their figure coming up into the circle.

     Uses the individual 'translate'/'scale' properties so a figure's own
     CSS transform (e.g. translateX(-50%)) is untouched. Never touches an
     .xfade layer's opacity: the container moves, the hidden poses stay hidden. */
  var EASE = 'cubic-bezier(.2,.7,.3,1)';
  var SETTLE = 'cubic-bezier(.3,1.25,.55,1)';
  var running = [];
  var canMove = !!(window.CSS && CSS.supports && CSS.supports('translate', '0 1px'));

  function seen(n) { return n && n.offsetParent !== null && !n.hidden; }
  function anim(n, from, ms, delay, ease) {
    var a = {}, b = {};
    a.opacity = 0; b.opacity = 1;
    if (canMove && from.t) { a.translate = from.t; b.translate = '0 0'; }
    if (canMove && from.s) { a.scale = String(from.s); b.scale = '1'; }
    var x = n.animate([a, b], { duration: ms, delay: delay || 0, easing: ease || EASE, fill: 'backwards' });
    running.push(x);
  }
  function outer(list) {
    return list.filter(function (n) {
      for (var i = 0; i < list.length; i++) if (list[i] !== n && list[i].contains(n)) return false;
      return true;
    });
  }
  function figures(el) {
    var c = Array.prototype.slice.call(el.querySelectorAll('figure, img, .xfade'));
    c = c.filter(function (n) {
      if (!seen(n) || n.closest('.cast-pic')) return false;
      if (n.tagName === 'IMG' && n.closest('.xfade')) return false;
      return n.getBoundingClientRect().height >= 110;
    });
    return outer(c);
  }
  function blocks(el) {
    var root = el, guard = 0;
    var kids = function (r) { return Array.prototype.filter.call(r.children, seen); };
    var k = kids(root);
    while (k.length === 1 && guard++ < 3) { root = k[0]; k = kids(root); }
    return k.slice(0, 8);
  }

  function veil(stage, color, k) {
    if (!stage || !color) return;
    var r = stage.getBoundingClientRect();
    var v = document.createElement('div');
    v.setAttribute('aria-hidden', 'true');
    v.style.cssText = 'position:fixed;pointer-events:none;z-index:40;left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px;background:' + color;
    document.body.appendChild(v);
    var a = v.animate([{ opacity: k < 1 ? .6 : 1 }, { opacity: 0 }], { duration: k < 1 ? 260 : 380, easing: 'ease-out', fill: 'forwards' });
    a.onfinish = a.oncancel = function () { v.remove(); };
  }

  /* opts: { weight: 'normal'|'half'|'big', stage, ground }.
     Revised 2 Oct [MARC]: normal was "a little too much" in Learn, so its
     distances are halved. 'half' is big at half strength, for the header's
     way back to the title. Which moves are big is decided in app.js. */
  function enter(el, opts) {
    for (var r = 0; r < running.length; r++) running[r].cancel();
    running = [];
    if (!el || reduced() || !el.animate) return;
    var w = (opts && opts.weight) || 'normal';
    var big = w !== 'normal', k = w === 'half' ? .5 : 1;
    var px = function (n) { return Math.round(n * k) + 'px'; };

    if (big && opts.ground) veil(opts.stage, opts.ground, k);

    if (!big) {
      anim(el, { t: '0 4px' }, 240);
      figures(el).forEach(function (n, i) { anim(n, { t: '0 6px' }, 360, 60 + i * 60, SETTLE); });
      Array.prototype.forEach.call(el.querySelectorAll('.lens, .shift, .ct-row'), function (n, i) {
        if (seen(n)) anim(n, { t: '0 5px' }, 300, 60 + i * 35);
      });
      return;
    }

    anim(el, { t: '0 ' + px(14) }, 420 - 100 * (1 - k));
    blocks(el).forEach(function (n, i) { anim(n, { t: '0 ' + px(16) }, 480, (80 + i * 70) * k); });
    figures(el).forEach(function (n, i) {
      anim(n, { t: '0 ' + px(26), s: 1 - .03 * k }, 640 - 160 * (1 - k), (200 + i * 90) * k, SETTLE);
    });
    Array.prototype.forEach.call(el.querySelectorAll('.lens.cast'), function (n, i) {
      if (!seen(n)) return;
      anim(n, { t: px(-22) + ' 0' }, 520, (180 + i * 85) * k);
      var img = n.querySelector('.cast-pic img');
      if (img) anim(img, { t: '0 ' + px(34) }, 620, (320 + i * 85) * k, SETTLE);
    });
    Array.prototype.forEach.call(el.querySelectorAll('.lens:not(.cast), .shift, .ct-row'), function (n, i) {
      if (seen(n)) anim(n, { t: '0 ' + px(10) }, 360, (260 + i * 55) * k);
    });
  }

  /* ---- stacked crossfade ----------------------------------------------- */

  /* The pose rail's shape: every layer is present and absolutely stacked
     from the start, and only opacity moves. Nothing is created or destroyed
     mid-scene, so there is no decode flash the first time the child's face
     changes — the cost is paid once, at load.

     root:  an element with [data-xfade] children, each carrying data-xfade="key"
     returns { to(key), current() } */
  /* opts.over (30 Sept): the incoming layer fades in ON TOP of the outgoing
     one, which stays at full opacity until the new one has landed. A plain
     crossfade puts both at ~50% midway, and the ground shows through where
     the two drawings share a fill — the "blip" on the Parent's tunic in
     Act 1. Used where one figure changes pose in place. */
  function layers(root, opts) {
    if (!root) return { to: function () {}, current: function () { return null; } };

    var nodes = Array.prototype.slice.call(root.querySelectorAll('[data-xfade]'));
    var showing = null;
    var over = !!(opts && opts.over), later = null;

    function to(key) {
      if (key === showing) return;
      showing = key;
      if (over) {
        clearTimeout(later);
        for (var j = 0; j < nodes.length; j++) {
          var mine = nodes[j].getAttribute('data-xfade') === key;
          nodes[j].style.zIndex = mine ? '2' : '1';
          if (mine) { nodes[j].setAttribute('data-on', 'yes'); nodes[j].setAttribute('aria-hidden', 'false'); }
          else nodes[j].setAttribute('aria-hidden', 'true');
        }
        later = setTimeout(function () {
          for (var m = 0; m < nodes.length; m++) if (nodes[m].getAttribute('data-xfade') !== showing) nodes[m].setAttribute('data-on', 'no');
        }, reduced() ? 0 : 340);
        return key;
      }
      for (var i = 0; i < nodes.length; i++) {
        var on = nodes[i].getAttribute('data-xfade') === key;
        nodes[i].setAttribute('data-on', on ? 'yes' : 'no');
        /* Aria-hidden follows opacity so a screen reader is never offered two
           images of the same child, one of which is invisible. */
        nodes[i].setAttribute('aria-hidden', on ? 'false' : 'true');
      }
      return key;
    }

    /* Whatever is marked on in the markup is the starting state, so the
       first paint is correct with JavaScript off or still loading. */
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].getAttribute('data-on') === 'yes') showing = nodes[i].getAttribute('data-xfade');
    }

    return { to: to, current: function () { return showing; } };
  }

  window.CDAH_FX = { enter: enter, layers: layers, reduced: reduced };
})();
