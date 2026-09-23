/* Haptics. One helper, three intensities, nothing decorative.

   Honest about its reach: navigator.vibrate is Android Chrome and Firefox.
   iOS Safari has no vibration API at all, so on an iPhone every call here
   is a no-op — that is a platform fact, not something to fake with sound or
   animation. Nothing in the UI ever claims a tap happened.

   Rules for callers:
   - tap()     a parent committed something — submit, a reply chosen, a card kept.
   - nudge()   the module took a turn of its own the parent did not ask for.
   - refuse()  an action did not land. Never for a wrong answer: this module
               does not buzz at a parent for getting something wrong.
   Anything else gets nothing. A shell that vibrates on every Next is a phone
   in someone's hand at 7:40 in the morning. */

(function () {
  'use strict';

  var PATTERNS = { tap: 12, nudge: [0, 18, 60, 18], refuse: [0, 32, 40, 32] };

  var supported = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

  function reduced() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /* Reduced motion is the closest signal a browser gives for "no unrequested
     physical output," and a vibration is motion in the hand. Honored. */
  function fire(kind) {
    if (!supported || reduced()) return false;
    try { return navigator.vibrate(PATTERNS[kind] || PATTERNS.tap); }
    catch (e) { return false; }
  }

  window.CDAH_HAPTICS = {
    supported: supported,
    tap: function () { return fire('tap'); },
    nudge: function () { return fire('nudge'); },
    refuse: function () { return fire('refuse'); }
  };
})();
