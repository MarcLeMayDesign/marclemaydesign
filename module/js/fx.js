/* Motion utilities. Two of them, both lifted out of the pose prototype so
   the engine packages inherit motion that has already been looked at:

     CDAH_FX.enter(el)        the screen change — a short rise and fade in.
     CDAH_FX.layers(root)     the stacked crossfade the pose rail needs.

   Both are opacity-only on purpose. A slide or a wipe tells a parent the
   module moved them somewhere; a fade tells them the same screen is now
   saying something else, which is what a pose change actually is.

   Reduced motion is handled in CSS (module.css zeroes every transition), so
   these do not need to branch for it — except where JS sequences a delay,
   which is the one thing CSS cannot turn off. */

(function () {
  'use strict';

  function reduced() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /* ---- screen enter ---------------------------------------------------- */

  /* Set the from-state, let one frame land, then release it. Two frames, not
     one: a single rAF after unhiding still occasionally paints the end state
     first in Safari, and a screen that flashes in at full opacity and then
     fades is worse than no transition. */
  function enter(el) {
    if (!el || reduced()) return;
    el.setAttribute('data-enter', 'yes');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { el.removeAttribute('data-enter'); });
    });
  }

  /* ---- stacked crossfade ----------------------------------------------- */

  /* The pose rail's shape: every layer is present and absolutely stacked
     from the start, and only opacity moves. Nothing is created or destroyed
     mid-scene, so there is no decode flash the first time the child's face
     changes — the cost is paid once, at load.

     root:  an element with [data-xfade] children, each carrying data-xfade="key"
     returns { to(key), current() } */
  function layers(root) {
    if (!root) return { to: function () {}, current: function () { return null; } };

    var nodes = Array.prototype.slice.call(root.querySelectorAll('[data-xfade]'));
    var showing = null;

    function to(key) {
      if (key === showing) return;
      showing = key;
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
