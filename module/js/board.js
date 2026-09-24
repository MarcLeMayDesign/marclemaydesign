/* Board mode, for the Flow board only. Does nothing unless the URL carries
   ?board. With it:
     - state lives in memory for this frame only (js/state.js checks
       CDAH_BOARD), so a board frame never reads or overwrites the parent's
       saved progress on this device;
     - timers run 20x fast, so a scripted role-play settles in about a second;
     - ?fx=<name> plays a fixture: types lines, taps cards, submits, stops.
   Nothing here ships to a parent's path: no ?board, no effect. */

(function () {
  'use strict';
  var q = new URLSearchParams(location.search);
  if (!q.has('board')) return;

  var fx = q.get('fx') || '';
  /* Board frames render off-screen and lazily, where a Web Animation can
     stay pending forever and freeze Maya mid-move. With no animate(), the
     rail takes its instant path, which is the end state the board needs. */
  Element.prototype.animate = null;
  /* Smooth scrolls are throttled in off-screen frames and never finish, so
     board frames scroll instantly. */
  var realScrollTo = Element.prototype.scrollTo;
  Element.prototype.scrollTo = function (a, b2) {
    if (a && typeof a === 'object') { if (a.top != null) this.scrollTop = a.top; if (a.left != null) this.scrollLeft = a.left; return; }
    return realScrollTo.call(this, a, b2);
  };
  var realTimeout = window.setTimeout.bind(window);
  window.setTimeout = function (fn, ms) {
    var a = Array.prototype.slice.call(arguments, 2);
    return realTimeout.apply(window, [fn, Math.round((ms || 0) * 0.05)].concat(a));
  };

  /* Board frames never depend on animation timing. */
  document.addEventListener('DOMContentLoaded', function () {
    var st = document.createElement('style');
    st.textContent = '.rp-in{animation:none!important}';
    document.head.appendChild(st);
  });

  var BASELINE = 'Put your shoe on, we\u2019re going to miss the bus. I don\u2019t have time for this today.';
  window.CDAH_BOARD = {
    fx: fx,
    seed: fx === 'baseline' ? { answers: { baseline: BASELINE } } : null
  };

  var C = window.CDAH_SCENES;
  function card(i) { return C && C['scn-301'].words[i].say; }

  /* Role-play fixtures. say = type and send; tap = tap card i (preview);
     use = Use it; open = open Words to try. The run stops where the list ends. */
  var RP = {
    'rp-turn1':    [{ say: 'Oh no. I know.' }],
    'rp-preview':  [{ say: 'Oh no. I know.' }, { open: 1 }, { tap: 1 }],
    'rp-stack':    [{ say: 'Oh no. I know.' }, { open: 1 }, { tap: 1 }, { use: 1 }, { tap: 2 }, { use: 1 }],
    'rp-offer':    [{ say: 'Come on, put it away.' }],
    'rp-strong':   [{ say: 'I can see you really want to finish. It\u2019s hard to stop.' },
                    { say: 'It\u2019s time to stop now. Do you want to pause it or save it?' }],
    'rp-cards':    [{ say: function () { return card(0); } },
                    { say: function () { return card(1) + ' ' + card(2); } }],
    'rp-nearly':   [{ say: 'I know, you really want to finish.' },
                    { say: 'I get it, it\u2019s a fun game.' },
                    { say: 'The tablet has to go off now.' }],
    'rp-notyet':   [{ say: 'Come on, put it away.' },
                    { say: 'Put it away please.' },
                    { say: 'Let\u2019s go.' }],
    'rp-composure':[{ say: 'Put it down right now or you lose it for a week.' },
                    { say: 'I said now.' },
                    { say: 'Okay.' }],
    'rp-safety':   [{ say: 'Last night I smacked my daughter when she did this.' }]
  };

  var QZ = {
    'qz-strong': 'He\u2019s tired and has held it together all afternoon. I\u2019d breathe first and deal with my own embarrassment about the woman watching. A consequence won\u2019t land while he\u2019s shouting, so that can wait until later.',
    'qz-nearly': 'He\u2019s tired and has run out. I\u2019d take a breath first before I say anything.',
    'qz-notyet': 'He\u2019s being naughty and testing me because someone is watching.'
  };

  function wait(test, then, tries) {
    tries = tries || 0;
    if (test() || tries > 200) { then(); return; }
    realTimeout(function () { wait(test, then, tries + 1); }, 40);
  }

  function runRP(steps) {
    var sec = document.getElementById('scn-301');
    if (!sec) return;
    var field = sec.querySelector('[data-rp-field]');
    var say = sec.querySelector('[data-rp-say]');
    var i = 0;
    function next() {
      if (i >= steps.length) return;
      var s = steps[i++];
      if (s.say) {
        wait(function () { return !say.disabled; }, function () {
          field.value = typeof s.say === 'function' ? s.say() : s.say;
          say.click();
          realTimeout(function () { wait(function () { return !say.disabled; }, next); }, 60);
        });
      } else if (s.open) {
        var pill = sec.querySelector('[data-wt-toggle]');
        if (pill && pill.getAttribute('aria-expanded') !== 'true') pill.click();
        realTimeout(next, 60);
      } else if (s.tap != null) {
        var cs = sec.querySelectorAll('.wt-card');
        if (cs[s.tap]) cs[s.tap].click();
        realTimeout(next, 60);
      } else if (s.use) {
        var u = sec.querySelector('[data-wt-use]');
        if (u && !u.hidden) u.click();
        realTimeout(next, 60);
      }
    }
    next();
  }

  function runQZ(text) {
    var sec = document.getElementById('scr-201');
    if (!sec) return;
    var f = sec.querySelector('[data-qz-field]');
    var b = sec.querySelector('[data-qz-submit]');
    if (!f || !b) return;
    f.value = text;
    f.dispatchEvent(new Event('input', { bubbles: true }));
    b.click();
  }

  window.addEventListener('load', function () {
    realTimeout(function () {
      if (RP[fx]) runRP(RP[fx]);
      else if (QZ[fx]) runQZ(QZ[fx]);
      /* The board frames are not interactive tests; keep a focused field
         from pulling the frame's scroll around. */
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    }, 150);
  });
})();
