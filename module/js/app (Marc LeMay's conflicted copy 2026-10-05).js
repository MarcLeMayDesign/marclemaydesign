/* ===== VoiceOver helpers (Oct 5, Marc's iPhone pass) ====================
   CDAH_SAY: one polite live region for announcing a change in words.
   Flatten: iOS VoiceOver stops at every bold, italic or span inside a
   paragraph, so a sentence is read in pieces. role="text" (WebKit) makes it
   one item. Applied to any text block with inline children and no controls,
   and re-applied as screens rewrite their copy. List items get an inner
   wrapper, so they keep their list role. */
(function () {
  'use strict';
  var live = null;
  function mk() {
    if (live || !document.body) return;
    live = document.createElement('div');
    live.className = 'sr-only'; live.setAttribute('aria-live', 'polite');
    document.body.appendChild(live);
  }
  mk();
  window.CDAH_SAY = function (t) {
    mk(); if (!live) return;
    live.textContent = '';
    setTimeout(function () { live.textContent = t; }, 80);
  };
  var SEL = 'p,figcaption,dt,dd,blockquote,.dtier';
  var INTER = 'a,button,input,textarea,select,[tabindex]:not([tabindex="-1"])';
  function flatten() {
    var root = document.body;
    var a = root.querySelectorAll(SEL), i, e;
    for (i = 0; i < a.length; i++) {
      e = a[i];
      if (e.getAttribute('role') && !e.hasAttribute('data-flat')) continue;
      var need = !!e.firstElementChild && !e.querySelector(INTER);
      if (need && !e.hasAttribute('data-flat')) { e.setAttribute('role', 'text'); e.setAttribute('data-flat', ''); }
      else if (!need && e.hasAttribute('data-flat')) { e.removeAttribute('role'); e.removeAttribute('data-flat'); }
    }
    var li = root.querySelectorAll('li');
    for (i = 0; i < li.length; i++) {
      e = li[i];
      if (!e.firstElementChild || e.querySelector(INTER)) continue;
      if (e.childNodes.length === 1 && e.firstElementChild.hasAttribute('data-flat')) continue;
      var s = document.createElement('span');
      s.setAttribute('role', 'text'); s.setAttribute('data-flat', '');
      while (e.firstChild) s.appendChild(e.firstChild);
      e.appendChild(s);
    }
  }
  var pend = null;
  function soon() { if (!pend) pend = setTimeout(function () { pend = null; flatten(); }, 120); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', flatten); else setTimeout(flatten, 0);
  if (window.MutationObserver) document.addEventListener('DOMContentLoaded', function () {
    new MutationObserver(soon).observe(document.body, { childList: true, subtree: true });
  });
  if (document.readyState !== 'loading' && window.MutationObserver) new MutationObserver(soon).observe(document.body, { childList: true, subtree: true });

  /* Waking the phone puts VoiceOver back at the top of the page. Return
     focus to the last control used on this screen, or to the screen's
     eyebrow or title. Never to a text field: that would raise the keyboard. */
  var last = null;
  document.addEventListener('focusin', function (e) {
    var st = document.getElementById('stage');
    if (st && st.contains(e.target)) last = e.target;
  });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState !== 'visible') return;
    setTimeout(function () {
      var t = last;
      if (t && /^(INPUT|TEXTAREA)$/.test(t.tagName)) return;
      if (!t || !document.contains(t) || t.offsetParent === null) {
        var scr = document.querySelector('#stage .screen:not([hidden])');
        t = scr && (scr.querySelector('.eyebrow[tabindex]') || scr.querySelector('h1'));
        if (t && !t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1');
      }
      if (t && t.focus) t.focus({ preventScroll: true });
    }, 600);
  });
})();

/* The shell: router, header, footer nav, the About & reference panel,
   the keyboard. No screen content lives here — screens are sections in
   index.html and their copy comes from /content/. */

(function () {
  'use strict';

  var S = window.CDAH_STATE;
  var T = window.CDAH_STRINGS;
  var FX = window.CDAH_FX;
  var H  = window.CDAH_HAPTICS;

  var app     = document.getElementById('app');
  var stage   = document.getElementById('stage');
  var screens = Array.prototype.slice.call(stage.querySelectorAll('.screen'));
  var ids     = screens.map(function (s) { return s.id; });

  var elName   = document.getElementById('headName');
  var elDot    = document.getElementById('headDot');
  var elSub    = document.getElementById('headSub');
  /* The section name in the header goes to that section's opening screen. */
  var SECTION_HOME = { learn: 'scr-110', check: 'scr-200', practice: 'scr-300' };
  var elStatus = document.getElementById('headStatus');
  var elProg   = document.getElementById('headProg');
  var btnAbout = document.getElementById('aboutBtn');
  var btnBack  = document.getElementById('navBack');
  var btnNext  = document.getElementById('navNext');

  var panel  = document.getElementById('panel');
  var scrim  = document.getElementById('scrim');
  var btnX   = document.getElementById('panelX');
  var elSaved = document.getElementById('panelSaved');
  var elCode  = document.getElementById('resumeCode');

  var resume    = document.getElementById('resumeStrip');
  var btnResume = document.getElementById('resumeGo');
  var btnAgain  = document.getElementById('resumeAgain');

  var current = null;
  var lastFocus = null;
  /* Back is literally back, as in a browser: the screens this parent
     actually came through, not the previous screen in document order.
     Choosing the third lens from the overview and pressing Back returns
     to the overview, not to the end of the second lens. */
  var trail = [];
  var codeNow = '';

  /* ---- router ---------------------------------------------------------- */

  function indexOf(id) { return ids.indexOf(id); }

  function show(id, opts) {
    var i = indexOf(id);
    if (i === -1) { i = 0; id = ids[0]; }

    /* The offer to resume is answered by ANY navigation, not just its own two
       buttons — and it carries a destructive control, so it does not sit
       above the content once the parent has moved on by any route. */
    if (current !== null) resume.hidden = true;
    if (opts && opts.pop) { /* trail already popped by the caller */ }
    else if (opts && opts.replace) { if (trail.length) trail[trail.length - 1] = id; else trail.push(id); }
    else if (trail[trail.length - 1] !== id) trail.push(id);
    current = id;

    /* Transition weight (2 Oct): big when the section changes. Read before the swap. */
    var prevEl = null;
    for (var p = 0; p < screens.length; p++) if (!screens[p].hidden) { prevEl = screens[p]; break; }
    var ground = null;
    if (prevEl) {
      for (var gn = stage; gn && gn.nodeType === 1; gn = gn.parentNode) {
        var bg = getComputedStyle(gn).backgroundColor;
        if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') { ground = bg; break; }
      }
    }

    for (var n = 0; n < screens.length; n++) screens[n].hidden = (screens[n].id !== id);

    var el = screens[i];
    var weight = moveWeight(prevEl, el, opts);
    app.setAttribute('data-theme', el.getAttribute('data-theme') || 'light');
    paintHeader(el);
    paintNav(i);

    if (!opts || !opts.silent) S.reached(id);
    paintLenses();
    paintQuizHub();
    if (id === 'scr-209') paintSummary();
    /* Each move is a history entry, so the phone's Back button steps back
       through screens like the module's own Back. Load and resume replace
       instead, so Back from the first screen still leaves the module. */
    if (location.hash.slice(1) !== id) {
      if (opts && opts.replace) history.replaceState(null, '', '#' + id);
      else history.pushState(null, '', '#' + id);
    }

    /* The first h1 that is actually on screen. Screens with swapped panes —
       the quiz's ask and result — carry two, and focusing the hidden one
       silently drops focus to the body. */
    var hs = el.querySelectorAll('h1');
    var h = null;
    for (var q = 0; q < hs.length; q++) {
      if (hs[q].offsetParent !== null) { h = hs[q]; break; }
    }
    if (!h) h = hs[0] || null;
    /* Oct 2 (Marc, VoiceOver): an eyebrow above the title carries where you
       are (Question 1, Scenario 2, Section 1 of 3), and landing on the h1
       skipped it. Focus lands on the eyebrow when one comes before the title,
       so the order heard is eyebrow, title, body. */
    if (h) {
      var ebs = el.querySelectorAll('.eyebrow'), eb = null;
      for (var e2 = 0; e2 < ebs.length; e2++) {
        var x = ebs[e2];
        if (x.offsetParent !== null && !x.hidden && x.textContent.trim() &&
            (x.compareDocumentPosition(h) & Node.DOCUMENT_POSITION_FOLLOWING)) { eb = x; break; }
      }
      if (eb) h = eb;
      /* Oct 5 (Marc, VoiceOver): the phrase cards start on Back, the first thing on the page. */
      var pcb = el.querySelector('[data-pc-back]');
      if (pcb && pcb.offsetParent !== null) h = pcb;
      if (h.tagName !== 'BUTTON') h.setAttribute('tabindex', '-1');
      h.focus({ preventScroll: true });
      /* A door in the panel closes it and hands focus back to its opener. Take it back. */
      var ft = h;
      setTimeout(function () {
        if (current === id && !el.contains(document.activeElement) && !panel.contains(document.activeElement)) ft.focus({ preventScroll: true });
      }, 400);
    }
    stage.scrollTop = 0;
    /* After focus and the scroll reset, so the fade is not fighting either. */
    if (prevEl !== el) FX.enter(el, { weight: weight, stage: stage, ground: ground });
    /* Act 1 (Composure), revised 28 Sept: the parent settles as the steps are
       tapped (tense, then neutral at step 2, calm at step 3). Arriving resets. */
    var af = el.querySelector('[data-act-fig]');
    if (af) {
      var lay = af._lay || (af._lay = FX.layers(af, { over: true }));
      var btns = el.querySelectorAll('[data-act-steps] .act-step');
      var setStep = function (n) {
        for (var b = 0; b < btns.length; b++) btns[b].setAttribute('aria-pressed', b < n ? 'true' : 'false');
        lay.to(n >= 3 ? '3' : n === 2 ? '2' : '0');
        /* NEW Oct 5: the figure is described, and the change is announced. */
        af.setAttribute('aria-label', n >= 3 ? 'The Parent, standing calm.' : n === 2 ? 'The Parent, less tense now.' : 'The Parent, standing tense.');
      };
      if (!af._wired) {
        af._wired = true;
        for (var b = 0; b < btns.length; b++) (function (n) {
          btns[n - 1].addEventListener('click', function () {
            var cur = 0;
            for (var q = 0; q < btns.length; q++) if (btns[q].getAttribute('aria-pressed') === 'true') cur = q + 1;
            setStep(cur === n ? n - 1 : n);
            if (window.CDAH_SAY) window.CDAH_SAY(af.getAttribute('aria-label'));
          });
        })(b + 1);
      }
      setStep(0);
    }
  }

  /* Big moves, listed by Marc 2 Oct: into the title from the opening or from
     Finish; title row → its overview; section close → the next overview; the
     end of Try It Out → Bookend; Bookend → Finish. The header's name back to
     the title is the same at half strength (opts.fx = 'half'). All else normal. */
  function moveWeight(from, to, opts) {
    if (opts && opts.fx) return opts.fx;
    if (!from || from === to) return 'normal';
    var f = from.id, t = to.id;
    if (t === 'scr-099' && (f === 'scr-100' || f === 'scr-101')) return 'grand';
    if (t === 'scr-099') return (f === 'scr-000' || f === 'scr-400' || f === 'scr-130' || f === 'scr-209') ? 'big' : 'normal';
    if (f === 'scr-110' && t === 'scr-200') return 'big';
    /* Moderately big (Marc, 2 Oct): phrase cards in and out, the opening screens, a section's last screen → its close. */
    if (f === 'scr-500' || t === 'scr-500') return 'half';
    if ((f === 'scr-000' && t === 'scr-100') || (f === 'scr-100' && t === 'scr-101')) return 'half';
    if ((f === 'scr-125' && t === 'scr-130') || (f === 'scr-204' && t === 'scr-209')) return 'half';
    if (f === 'scr-099' && (t === 'scr-110' || t === 'scr-200' || t === 'scr-300')) return 'big';
    if ((f === 'scr-130' && t === 'scr-200') || (f === 'scr-209' && t === 'scr-300')) return 'big';
    if (t === 'scr-304' && from.getAttribute('data-section') === 'practice') return 'big';
    if (f === 'scr-304' && t === 'scr-400') return 'big';
    return 'normal';
  }

  function paintHeader(el) {
    var key = el.getAttribute('data-section');
    var sec = key && T.sections[key];
    var home = el.id !== 'scr-099' && el.id !== ids[0];
    elName.disabled = !home;
    elName.setAttribute('aria-label', home ? 'Back to the start of the module' : 'Conscious Discipline at Home');
    var secHome = key && SECTION_HOME[key];
    elSub.disabled = !secHome || el.id === secHome;
    elSub.setAttribute('data-go', secHome || '');
    elSub.setAttribute('aria-label', sec ? ('Back to the start of ' + sec.name) : '');
    if (sec) {
      elName.textContent = T.productName;
      elSub.textContent = sec.name;
      elDot.hidden = false;
      elSub.hidden = false;
    } else {
      elName.textContent = T.productName;
      elDot.hidden = true;
      elSub.hidden = true;
      elSub.textContent = '';
    }

    /* Status is progress only. Save state lives in the panel, on purpose:
       a persistent "saved" chip becomes wallpaper and lies if a save fails. */
    elStatus.textContent = el.getAttribute('data-status') || '';

    var steps = parseInt(el.getAttribute('data-steps') || '0', 10);
    var step  = parseInt(el.getAttribute('data-step') || '0', 10);
    elProg.innerHTML = '';
    /* In Learn and Test Your Knowledge the bars are a map as well as a gauge
       (30 Sept, Marc): each one goes to its screen. Try It Out's only show
       progress, since a scene is meant to be played through. */
    var QZ = ['scr-201', 'scr-202', 'scr-203', 'scr-204'];
    var path = key === 'learn' ? (ASSESS.indexOf(el.id) !== -1 ? ASSESS : ACT.indexOf(el.id) !== -1 ? ACT : null)
      : key === 'check' && QZ.indexOf(el.id) !== -1 ? QZ : null;
    for (var k = 1; k <= steps; k++) {
      var i2 = document.createElement('i');
      if (k === step) i2.className = 'on';
      else if (k < step) i2.className = 'done';
      if (path && path[k - 1]) {
        var pb = document.createElement('button');
        var to = document.getElementById(path[k - 1]);
        pb.type = 'button';
        pb.setAttribute('data-show', path[k - 1]);
        pb.setAttribute('aria-label', (to && to.getAttribute('data-status')) || ('Screen ' + k));
        if (k === step) pb.setAttribute('aria-current', 'step');
        pb.appendChild(i2);
        elProg.appendChild(pb);
      } else elProg.appendChild(i2);
    }
    elProg.hidden = steps === 0;
  }

  /* Learn is two paths, Assess and Act, and SCR-110 is a chooser between
     them. Each path card lists its screens and ticks the ones read. Read state
     comes from the same visited list the resume strip uses: nothing new is
     stored. The advice to start with Assess is stated, never enforced. */

  var ASSESS = ['scr-111', 'scr-112', 'scr-113', 'scr-114'];
  var ACT    = ['scr-121', 'scr-122', 'scr-123', 'scr-124', 'scr-125'];
  var LEARN  = ASSESS.concat(ACT);

  function countRead(list) {
    var seen = S.get().visited || [];
    var n = 0;
    for (var i = 0; i < list.length; i++) if (seen.indexOf(list[i]) !== -1) n++;
    return n;
  }

  /* TYK hub: a question is ticked once it has a band. Best band stands. */
  var BAND_WORD = { strong: 'Strong', nearly: 'Nearly there', notyet: 'Not yet' };
  function paintQuizHub() {
    var cards = document.querySelectorAll('[data-qz-hub]');
    if (!cards.length) return;
    var best = S.get().best || {}, done = 0;
    for (var i = 0; i < cards.length; i++) {
      var b = best[cards[i].getAttribute('data-qz-hub')];
      cards[i].setAttribute('data-read', b ? 'yes' : 'no');
      cards[i].querySelector('.mark').textContent = b ? BAND_WORD[b] + ' \u2713' : '';
      if (b) done++;
    }
    var g = document.getElementById('qzGate');
    if (g) g.textContent = done === 0 ? 'Start with 1, or pick any. They take about two minutes each.'
      : done === cards.length ? 'All four answered. Try It Out is next, or go back to any of them.'
      : (cards.length - done) + (cards.length - done === 1 ? ' still to answer.' : ' still to answer, in any order.');
  }

  /* TYK summary: one of the "parenting is hard" lines, kept per parent. */
  function paintSummary() {
    var t = document.querySelector('[data-sum-coach-t]');
    /* Draft 2 (Marc): one fixed line here, the least judgmental of the set. */
    if (t) t.textContent = T.tykSummaryCoach || (window.CDAH_COACH_LINES ? S.coachLine('tyk-summary', window.CDAH_COACH_LINES) : '');
  }

  function paintLenses() {
    var seen = S.get().visited || [];
    var cards = document.querySelectorAll('[data-lens-set]');
    for (var i = 0; i < cards.length; i++) {
      var set = cards[i].getAttribute('data-lens-set').split(' ');
      var n = countRead(set);
      cards[i].setAttribute('data-read', n === set.length ? 'yes' : 'no');
      cards[i].querySelector('.mark').textContent = n === set.length ? 'read \u2713'
        : n === 0 ? '' : n + ' of ' + set.length + ' read';
      var items = cards[i].querySelectorAll('[data-lens-item]');
      for (var j = 0; j < items.length; j++) {
        items[j].setAttribute('data-read', seen.indexOf(items[j].getAttribute('data-lens-item')) !== -1 ? 'yes' : 'no');
      }
    }

    var gate = document.getElementById('lensGate');
    if (gate) {
      var a = countRead(ASSESS), c = countRead(ACT);
      gate.textContent = a + c === LEARN.length
        ? 'Both parts read. Test Your Knowledge is next: four situations, in any order.'
        : a + c === 0
          ? 'Start with Assess to get the full picture. After that, go back to either part whenever you like.'
          : a === ASSESS.length
            ? 'Assess is done. Act is next: five moves, about a minute each.'
            : (LEARN.length - a - c) + ' screens still to read, in either part.';
    }

    /* Draft 2 (Marc): all read, a way on from the overview itself. */
    var lensGo = document.getElementById('lensGo');
    if (lensGo) lensGo.hidden = countRead(ASSESS) + countRead(ACT) !== LEARN.length;

    var closeGate = document.getElementById('closeGate');
    if (closeGate) {
      var left = LEARN.length - countRead(LEARN);
      closeGate.textContent = left === 0 ? ''
        : left === 1 ? 'One screen is still unread. It\u2019s ticked off on the Learn overview if you want to find it.'
        : left + ' screens are still unread. The Learn overview shows which.';
      closeGate.hidden = left === 0;
    }
  }

  function paintNav(i) {
    btnBack.disabled = i === 0 && trail.length < 2;
    btnNext.disabled = i === ids.length - 1;
    btnBack.textContent = T.nav.back;
    btnNext.textContent = T.nav.next;
  }

  /* All three scenes have a best band saved. */
  function scenesDone() {
    var best = (S.get().best) || {};
    var list = ((T.close2 || {}).scenes || []).filter(function (x) { return document.getElementById(x.id); });
    return list.length === 3 && list.every(function (x) { return best[x.id]; });
  }
  window.CDAH_SCENES_DONE = scenesDone;

  function go(delta) {
    /* Oct 2 (Marc): with all three scenes done, Next on the last question
       skips "End of section 2" and lands on Section 3's own intro, which
       offers the scenes to try again. The picker under a Section 2 eyebrow
       read as if it belonged to Section 2. */
    if (delta === 1 && current === 'scr-204' && indexOf('scr-300') !== -1 && scenesDone()) { show('scr-300'); return; }
    /* Screens marked data-direct-only are doors, not stops: linear nav
       steps over them in both directions. */
    var i = indexOf(current) + delta;
    while (i >= 0 && i < ids.length && screens[i].hasAttribute('data-direct-only')) i += delta;
    if (i < 0 || i >= ids.length) return;
    show(ids[i]);
  }

  /* The product name is the way home. A parent who wants the start of the
     module reaches for the title in the header before anything else, and
     nothing else in the chrome offers it. On the title screen itself it is
     inert rather than hidden, so the header never changes shape. */
  elName.addEventListener('click', function () {
    if (current !== 'scr-099') show('scr-099', { fx: 'half' });
  });

  elSub.addEventListener('click', function () {
    var to = elSub.getAttribute('data-go');
    if (to && to !== current) show(to);
  });

  /* With somewhere to go back to, Back is the browser's back, and the
     hashchange below lands the screen. Arriving cold (a reload, a shared
     link), there is no trail yet, so it falls back to the previous screen. */
  function back() {
    var hk = window.CDAH_BACK_HOOKS || [];
    for (var b = 0; b < hk.length; b++) if (hk[b]()) return;
    if (trail.length > 1) history.back();
    else go(-1);
  }

  /* Any in-screen control that just goes somewhere: data-show="screen-id". */
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-show]');
    if (!t || !stage.contains(t) && !elProg.contains(t)) return;
    var to = t.getAttribute('data-show');
    if (to && to !== current && indexOf(to) !== -1) { H.tap(); show(to); }
  });

  btnBack.addEventListener('click', back);
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('[data-pc-back]')) { H.tap(); back(); }
  });
  btnNext.addEventListener('click', function () { go(1); });

  window.addEventListener('hashchange', function () {
    var id = location.hash.slice(1);
    if (!id || id === current || indexOf(id) === -1) return;
    if (trail.length > 1 && trail[trail.length - 2] === id) { trail.pop(); show(id, { pop: true }); }
    else show(id);
  });

  /* ---- the End of Section 2 band (SCR-209, SCR-300) --------------------- */

  var bands = stage.querySelectorAll('[data-band]');
  var C2 = T.close2 || {};
  for (var b = 0; b < bands.length; b++) (function (sec) {
    var q = function (s) { return sec.querySelector(s); };
    var intro = sec.getAttribute('data-band') === 'intro';
    var note = q('[data-band-note]');
    var goBtn = q('[data-band-go]'), more = q('[data-band-more]'), pick = q('[data-band-pick]');
    var goTo = 'scn-301';
    /* Package J. Which intro shows depends on how many scenes are done
       (a best band saved). None: Start, plus the "come back" line. Some:
       Carry on, to the first not yet done. All: a picker instead. Only
       scenes that exist in the page count. Painted on every arrival. */
    function paint() {
      var best = (S.get().best) || {};
      var list = (C2.scenes || []).filter(function (x) { return document.getElementById(x.id); });
      var done = list.filter(function (x) { return best[x.id]; });
      /* The picker lives on SCR-300 only (Oct 2): SCR-209 always closes Section 2. */
      var all = intro && list.length === 3 && done.length === 3;
      var next = list.filter(function (x) { return !best[x.id]; })[0];
      goTo = next ? next.id : 'scn-301';
      q('[data-band-eyebrow]').textContent = intro ? C2.eyebrowIntro : C2.eyebrowClose;
      q('[data-band-title]').textContent = all ? C2.titlePick : ((intro && C2.titleIntro) || C2.title || '');
      q('[data-band-body]').textContent = all ? C2.bodyPick : (C2.body || '');
      more.textContent = C2.more || '';
      more.hidden = all || done.length > 0 || !C2.more;
      goBtn.textContent = done.length ? (C2.goOn || C2.go) : (C2.go || '');
      goBtn.hidden = all;
      pick.hidden = !all;
      pick.innerHTML = '';
      if (all) list.forEach(function (x) {
        var l = document.createElement('a');
        l.className = 'lens';
        l.href = '#' + x.id;
        var r = document.createElement('span'); r.className = 'row';
        var nm = document.createElement('span'); nm.className = 'name'; nm.textContent = x.name;
        var mk = document.createElement('span'); mk.className = 'mark';
        var M = window.CDAH_MATCH;
        mk.textContent = (M && M.BANDS && M.BANDS[best[x.id]]) || '';
        r.appendChild(nm); r.appendChild(mk); l.appendChild(r);
        l.addEventListener('click', function () { H.tap(); });
        pick.appendChild(l);
      });
    }
    paint();
    q('[data-band-stop]').textContent = C2.stop || '';
    note.textContent = C2.note || '';
    goBtn.addEventListener('click', function () { H.tap(); show(goTo); });
    /* Stopping is already true — show() saved this screen. The button
       only says so, with the same weight as going on. */
    q('[data-band-stop]').addEventListener('click', function () { note.textContent = C2.stopped || C2.note || ''; });
    window.addEventListener('hashchange', function () { note.textContent = C2.note || ''; paint(); });
    document.addEventListener('cdah:restart', paint);
  })(bands[b]);

  /* ---- the panel ------------------------------------------------------- */

  function relTime(ms) {
    if (!ms) return '';
    var secs = Math.round((Date.now() - ms) / 1000);
    if (secs < 45) return 'just now';
    var mins = Math.round(secs / 60);
    if (mins < 60) return mins + (mins === 1 ? ' minute ago' : ' minutes ago');
    var hrs = Math.round(mins / 60);
    if (hrs < 24) return hrs + (hrs === 1 ? ' hour ago' : ' hours ago');
    var days = Math.round(hrs / 24);
    return days + (days === 1 ? ' day ago' : ' days ago');
  }

  function paintSaved() {
    var at = S.savedAt();
    elSaved.textContent = at ? (T.panel.savedPrefix + ' ' + relTime(at)) : '';
  }

  /* Exposed for the safety check's SR-2, which opens the panel at one card. */
  window.CDAH_OPEN_PANEL = function () { openPanel(); };

  function openPanel() {
    lastFocus = document.activeElement;
    paintSaved();
    codeNow = '';
    elCode.textContent = '\u2026';
    S.codeAsync().then(function (c) { codeNow = c; elCode.textContent = c; });
    if (panelAnim) { panelAnim.cancel(); panelAnim = null; }
    scrim.hidden = false;
    panel.hidden = false;
    /* Draft 2 (Marc): always reopens at the top, never where it was left. */
    panel.scrollTop = 0;
    btnX.focus();
    document.addEventListener('keydown', trap, true);
    panelAnim = grow(true);
  }

  /* The drawer grows out of the ? and folds back into it (30 Sept, Marc): a
     circle centered on the button, clipping the panel open. Clip-path, not
     transform, because the panel's own transform centers it on desktop. */
  var panelAnim = null;
  function grow(open) {
    if (FX.reduced() || !panel.animate) return null;
    var b = btnAbout.getBoundingClientRect(), p = panel.getBoundingClientRect();
    var x = b.left + b.width / 2 - p.left, y = b.top + b.height / 2 - p.top;
    var r = Math.max(Math.hypot(x, y), Math.hypot(p.width - x, y), Math.hypot(x, p.height - y), Math.hypot(p.width - x, p.height - y));
    var at = ' at ' + x + 'px ' + y + 'px)';
    var kf = [{ clipPath: 'circle(' + (b.width / 2) + 'px' + at, opacity: 0.5 }, { clipPath: 'circle(' + r + 'px' + at, opacity: 1 }];
    if (!open) kf.reverse();
    scrim.animate(open ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }], { duration: open ? 420 : 300, easing: 'ease' });
    return panel.animate(kf, { duration: open ? 440 : 300, easing: open ? 'cubic-bezier(.2,.7,.2,1)' : 'cubic-bezier(.5,0,.75,.3)' });
  }

  function closePanel() {
    if (panel.hidden) return;
    if (typeof disarm === 'function') disarm();
    elCode.classList.remove('is-open');
    document.removeEventListener('keydown', trap, true);
    var done = function () { panelAnim = null; panel.hidden = true; scrim.hidden = true; };
    if (panelAnim) panelAnim.cancel();
    panelAnim = grow(false);
    if (panelAnim) panelAnim.onfinish = done; else done();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function trap(e) {
    if (e.key !== 'Tab') return;
    var f = panel.querySelectorAll('button,[href],input,textarea,[tabindex]:not([tabindex="-1"])');
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* Draft 2 (Marc): a click in the code box selects all of it, and the box
     opens to show the whole string, so the highlight is visibly complete. */
  function selectCode() {
    elCode.classList.add('is-open');
    var r = document.createRange(); r.selectNodeContents(elCode);
    var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
  }
  elCode.addEventListener('click', selectCode);
  elCode.addEventListener('focus', function () { setTimeout(selectCode, 0); });

  btnAbout.addEventListener('click', openPanel);
  /* SCR-099's reference note (2 Oct): open the drawer straight at the glossary. */
  var titleGloss = document.getElementById('titleGloss');
  var glossOpenBtn = document.getElementById('glossOpen');
  if (titleGloss && glossOpenBtn) titleGloss.addEventListener('click', function () { H.tap(); openPanel(); glossOpenBtn.click(); });
  btnX.addEventListener('click', closePanel);
  scrim.addEventListener('click', closePanel);

  document.getElementById('codeCopy').addEventListener('click', function () {
    var btn = this, st = document.getElementById('codeStatus');
    H.tap();
    var done = function () {
      btn.classList.add('is-done'); st.textContent = T.panel.save.copied;
      setTimeout(function () { btn.classList.remove('is-done'); st.textContent = ''; }, 1600);
    };
    var text = codeNow || S.code();
    /* Clipboard API first; the old execCommand path second; if both are
       blocked, select the code and say so, rather than claiming success. */
    var legacy = function () {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      panel.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (x) {}
      panel.removeChild(ta);
      if (ok) { done(); return; }
      var r = document.createRange(); r.selectNodeContents(elCode);
      var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
      /* NEW 27 Sept [Marc's comment]: say how, on a computer and on a phone. */
      st.textContent = 'Couldn\u2019t copy automatically, so the code is highlighted. Choose Edit \u2192 Copy in your browser, or press Ctrl+C (\u2318C on a Mac). On a phone, press and hold the code, then tap Copy.';
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, legacy);
    } else legacy();
  });

  document.getElementById('codeMail').addEventListener('click', function () {
    /* A link, not a code: tapped on the other device, it opens the module
       with the code already in the COVER's restore box. */
    S.codeAsync().then(function (c) {
      /* href minus the hash: location.origin is "null" on file://. */
      var link = location.href.split('#')[0] + '#resume=' + c;
      var subject = 'Conscious Discipline at Home: my place in the module';
      var body = 'Open this link on your other device to pick up where you left off:\n\n' + link + '\n';
      var a = document.createElement('a');
      a.href = 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      a.target = '_top'; a.rel = 'noopener';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    });
  });

  /* ---- keyboard -------------------------------------------------------- */

  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;

    if (e.key === 'Escape' && !panel.hidden) { e.preventDefault(); closePanel(); return; }
    if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
      e.preventDefault();
      if (panel.hidden) openPanel(); else closePanel();
      return;
    }
    if (e.key === 'r' || e.key === 'R') {
      /* R toggles the Words to try strip on the scene that is showing
         (js/roleplay.js). Off a scene it does nothing. */
      if (window.CDAH_STRIP && window.CDAH_STRIP.toggle) { e.preventDefault(); window.CDAH_STRIP.toggle(); }
      return;
    }
    if (panel.hidden) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); back(); }
    }
  });

  /* ---- COVER: begin, or restore from another device -------------------- */

  var cvMore  = document.getElementById('coverRestore');
  var cvForm  = document.getElementById('coverForm');
  var cvField = document.getElementById('coverCode');
  var cvGo    = document.getElementById('coverRestoreGo');
  var cvNote  = document.getElementById('coverNote');
  var REPLACES = ' This replaces what is saved on this device.';

  function coverNote(text, isErr) {
    cvNote.textContent = text;
    cvNote.classList.toggle('is-err', !!isErr);
  }

  document.getElementById('coverBegin').addEventListener('click', function () { H.tap(); go(1); });
  document.getElementById('skipBaseline').addEventListener('click', function () { H.tap(); show('scr-099'); });

  cvMore.addEventListener('toggle', function () {
    if (cvMore.open && !cvNote.textContent) coverNote(S.hasProgress() ? REPLACES.trim() : '');
  });

  cvForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!cvField.value.trim()) { coverNote('Paste your code first.', true); cvField.focus(); return; }
    cvGo.disabled = true;
    S.applyCodeAsync(cvField.value).then(function (ok) {
      cvGo.disabled = false;
      if (!ok) { coverNote('That code didn\u2019t work. Check that you copied all of it.', true); cvField.focus(); return; }
      /* Reload, so every screen reads the restored answers from scratch,
         and land straight on their place instead of the offer. */
      try { sessionStorage.setItem('cdah.restored', '1'); } catch (x) {}
      history.replaceState(null, '', location.pathname + location.search);
      location.reload();
    });
  });

  function offerLinkCode(code) {
    cvMore.open = true;
    cvField.value = code;
    coverNote('Your link brought your place from the other device. Tap Restore to use it.' + (S.hasProgress() ? REPLACES : ''));
  }

  /* ---- returning parent ------------------------------------------------ */

  function boot() {
    /* The hash carries the screen id, so stop the browser restoring a scroll
       position or anchor-jumping the header out of view. */
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    var hash = location.hash.slice(1);
    var saved = S.get().screen;

    /* Just restored from a code: go straight to their place. */
    var restored = false;
    try { restored = sessionStorage.getItem('cdah.restored') === '1'; sessionStorage.removeItem('cdah.restored'); } catch (x) {}
    if (restored) { show(resumeTarget() || ids[0], { replace: true }); return; }

    /* Arrived by an emailed resume link: the COVER, with the code waiting.
       Nothing is applied until they tap Restore. */
    if (hash.indexOf('resume=') === 0) {
      var linkCode = decodeURIComponent(hash.slice(7));
      history.replaceState(null, '', location.pathname + location.search);
      show(ids[0], { silent: true, replace: true });
      offerLinkCode(linkCode);
      return;
    }

    /* The hash is the module's own bookkeeping, not a deep link: show()
       replaceStates it on every navigation. So on a reload the hash is
       nearly always the saved screen, and honoring it here silently
       teleported the parent past the resume offer — which is also why the
       offer became unreachable once a hash existed at all.

       A hash that MATCHES the saved screen is therefore treated as our own
       and falls through to the offer below. A hash that differs is someone
       arriving at a specific screen deliberately (a shared link, a typed
       URL, the reference panel) and is still honored. */
    if (hash && indexOf(hash) !== -1 && hash !== saved) { show(hash, { replace: true }); return; }

    /* Gated on progress alone. The old gate also required saved !== ids[0],
       and the title screen is easy to reach (Back from SCR-100, the header
       title) — so a parent with real progress who last stood on the title
       lost the offer for good, and with it the strip's Start again. */
    var target = resumeTarget();
    if (target && S.hasProgress()) {
      /* Do not silently teleport them. Show the first screen with an offer. */
      show(ids[0], { silent: true, replace: true });
      resume.hidden = false;
      btnResume.addEventListener('click', function () { H.tap(); show(resumeTarget() || ids[0]); });
      btnAgain.addEventListener('click', restartAll);
      return;
    }

    show(ids[0], { replace: true });
  }

  /* Where "Pick up where I left off" goes: the last screen reached, unless
     that was the title — then the furthest screen in the visited list that
     isn't. Resolved at click time, not closed over at boot. */
  function resumeTarget() {
    var st = S.get();
    if (st.screen && st.screen !== ids[0] && indexOf(st.screen) !== -1) return st.screen;
    var v = st.visited || [];
    for (var i = v.length - 1; i >= 0; i--) {
      if (v[i] !== ids[0] && indexOf(v[i]) !== -1) return v[i];
    }
    return null;
  }

  /* One restart, two doors: the resume strip and the panel. No haptic on
     either — a buzz confirming a deletion reads as approval. */
  function restartAll() {
    S.restart();
    /* Every screen that holds a typed value clears itself off this. */
    document.dispatchEvent(new CustomEvent('cdah:restart'));
    resume.hidden = true;
    trail = [];
    show(ids[0], { replace: true });
  }

  /* The panel's Start again. The strip's is answered by being on the title
     screen with an offer in front of you; this one is reachable from any
     screen mid-module, so it asks once more before it clears anything. */
  var btnPanelAgain = document.getElementById('panelRestart');
  var panelAgainTimer = null;
  if (btnPanelAgain) {
    var panelAgainLabel = btnPanelAgain.textContent;
    btnPanelAgain.addEventListener('click', function () {
      if (btnPanelAgain.getAttribute('data-armed') !== 'yes') {
        btnPanelAgain.setAttribute('data-armed', 'yes');
        btnPanelAgain.textContent = 'Tap again to clear everything';
        clearTimeout(panelAgainTimer);
        panelAgainTimer = setTimeout(disarm, 5000);
        return;
      }
      disarm();
      closePanel();
      restartAll();
    });
  }
  /* Finish (SCR-400): Start over, armed the same way as the panel's. */
  var FIN = (window.CDAH_BOOKEND && window.CDAH_BOOKEND.finish) || {};
  var fin = document.getElementById('scr-400');
  if (fin) {
    var fq = fin.querySelectorAll('[data-fin]');
    for (var fi = 0; fi < fq.length; fi++) { var fk = fq[fi].getAttribute('data-fin'); if (FIN[fk]) fq[fi].textContent = FIN[fk]; }
    var finAgain = document.getElementById('finAgain'), finTimer = null;
    var finDisarm = function () { clearTimeout(finTimer); finAgain.removeAttribute('data-armed'); finAgain.textContent = FIN.again || 'Start over'; };
    finAgain.addEventListener('click', function () {
      if (finAgain.getAttribute('data-armed') !== 'yes') {
        finAgain.setAttribute('data-armed', 'yes');
        finAgain.textContent = FIN.againArmed || 'Tap again to clear everything';
        clearTimeout(finTimer); finTimer = setTimeout(finDisarm, 5000);
        return;
      }
      finDisarm();
      restartAll();
    });
    window.addEventListener('hashchange', finDisarm);
  }

  function disarm() {
    if (!btnPanelAgain) return;
    clearTimeout(panelAgainTimer);
    btnPanelAgain.removeAttribute('data-armed');
    btnPanelAgain.textContent = panelAgainLabel;
  }

  S.onChange(function () { if (!panel.hidden) paintSaved(); });
  setInterval(function () { if (!panel.hidden) paintSaved(); }, 30000);

  boot();
})();


/* ===== SCR-100 the baseline, SCR-101 the read-back =====================
   One closure, two screens, because they are one moment: the answer and the
   answer read back. Own closure for the same reason as the graphics — if
   this throws, navigation still works.

   The baseline is stored under the item id 'baseline'. It is deliberately
   passed to S.answer with no band: it is the one answer in the module that
   is never scored, and giving it a band would put it in state.best where the
   results screen would find it.

   Saving is explicit rather than on every keystroke. A parent typing into a
   box that silently saves has no moment of having finished, and SCR-101's
   whole job is to hand that sentence back as something they committed to. */

(function () {
  'use strict';
  var S = window.CDAH_STATE;
  var H = window.CDAH_HAPTICS;

  var field = document.getElementById('baselineText');
  var keep  = document.getElementById('baselineKeep');
  var note  = document.getElementById('baselineState');
  var bSafe = document.getElementById('baselineSafety');
  var back  = document.getElementById('readback');
  var backT = document.getElementById('readbackText');
  /* Draft 2 (Marc): once an answer is kept, Continue appears beside "Kept."
     and the skip door steps aside, so the way on is unmistakable. */
  var goBtn = document.getElementById('baselineGo');
  var skipW = document.getElementById('skipWrap');
  /* Draft 2 pass 2 (Marc): the button itself says "Kept" and stops working
     until the text changes, rather than a "Kept." note beside it. */
  function paintKept(on) {
    if (goBtn) goBtn.hidden = !on;
    if (skipW) skipW.hidden = on;
    if (keep) {
      keep.className = on ? 'btn btn-quiet' : 'btn';
      keep.textContent = on ? 'Kept' : 'Keep this';
      if (on) keep.setAttribute('aria-disabled', 'true'); else keep.removeAttribute('aria-disabled');
    }
    if (note && on) note.textContent = '';
  }

  function saved() {
    var a = S.get().answers;
    return (a && typeof a.baseline === 'string') ? a.baseline : '';
  }

  /* SCR-101 with nothing to quote says nothing at all — no empty quote
     frame, no "you didn't answer." A parent who skipped the field gets a
     screen that simply reads as its own paragraph, which is also what
     package G's skip door will need. */
  function paintReadback() {
    if (!back || !backT) return;
    var text = saved().replace(/\s+$/, '');
    if (!text) { back.hidden = true; backT.textContent = ''; return; }
    backT.textContent = '\u201C' + text + '\u201D';
    back.hidden = false;
  }

  if (field) {
    field.value = saved();
    paintKept(!!field.value && field.value === saved());
    field.addEventListener('input', function () {
      /* The confirmation is about the stored sentence, so it clears the
         moment the box stops matching what is stored. */
      var same = field.value === saved() && !!field.value;
      if (note) note.textContent = '';
      paintKept(same);
    });
    /* Cmd/Ctrl+Return keeps it, as on the quiz. A bare Return is a new line. */
    field.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && keep) { e.preventDefault(); keep.click(); }
    });
  }

  if (keep && field) {
    keep.addEventListener('click', function () {
      if (keep.getAttribute('aria-disabled') === 'true') return;
      var text = field.value.replace(/\s+$/, '');
      if (!text) { if (note) note.textContent = 'Nothing to keep yet.'; field.focus(); return; }
      /* The baseline is where a parent is most likely to write something
         true about their own week. Checked first; on a fire, nothing kept. */
      if (window.CDAH_SAFETY && bSafe) {
        var sr = window.CDAH_SAFETY.check(text, { context: 'baseline' });
        if (sr) {
          if (note) note.textContent = '';
          window.CDAH_SAFETY.render(bSafe, sr, function () { bSafe.hidden = true; field.focus(); });
          return;
        }
      }
      if (bSafe) bSafe.hidden = true;
      S.answer('baseline', text);
      H.tap();
      paintKept(true);
      paintReadback();
      if (goBtn) goBtn.focus();
    });
  }

  document.addEventListener('cdah:restart', function () {
    if (field) field.value = '';
    if (note) note.textContent = '';
    if (bSafe) bSafe.hidden = true;
    paintKept(false);
    paintReadback();
  });

  paintReadback();
  /* The router owns navigation; this only needs to know a screen changed.
     Cheaper and less coupled than reaching into show(). */
  window.addEventListener('hashchange', paintReadback);

  /* Keyboard up on a phone: hide the footer while a text field has focus.
     The short delay on blur covers tapping a button beside the field, which
     blurs it for a moment before focus returns. */
  if (window.matchMedia && matchMedia('(pointer: coarse)').matches) {
    var kbT = null;
    var isField = function (t) { return t && (t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && /^(text|search|email)?$/.test(t.type || ''))); };
    document.addEventListener('focusin', function (e) {
      if (!isField(e.target)) return;
      clearTimeout(kbT); document.getElementById('app').setAttribute('data-kb', 'open');
    });
    document.addEventListener('focusout', function (e) {
      if (!isField(e.target)) return;
      clearTimeout(kbT);
      kbT = setTimeout(function () { if (!isField(document.activeElement)) document.getElementById('app').removeAttribute('data-kb'); }, 250);
    });
  }
})();


/* ===== SCR-111 · three brain states ===================================
   Revised 27 Sept. One brain, one figure, one caption box, and all three
   answer to the same two choices: which side (the child or you) and which
   state. The figure is Maya on "Where they are" and the Parent on "Where you
   are", standing in the same spot, so the toggle visibly swaps who you are
   reading. The caption box is a fixed size so nothing below it moves when
   the text changes. Copy is in content/principles.js under scr-111.states. */

/* Oct 2 (Marc): the first press on an interactive brings the whole of it
   into view, its controls at the top of the screen. Only if it doesn't
   already fit; never while the parent is mid-scroll elsewhere. */
window.CDAH_FIT = function (topEl, bottomEl) {
  var st = document.getElementById('stage');
  if (!st || !topEl) return;
  var sr = st.getBoundingClientRect(), t = topEl.getBoundingClientRect(), b = (bottomEl || topEl).getBoundingClientRect();
  if (t.top >= sr.top && b.bottom <= sr.bottom) return;
  var y = Math.max(0, st.scrollTop + t.top - sr.top - 12);
  var fx = window.CDAH_FX, rm = fx && fx.reduced && fx.reduced();
  if (st.scrollTo) st.scrollTo({ top: y, behavior: rm ? 'auto' : 'smooth' }); else st.scrollTop = y;
};

(function () {
  'use strict';
  var root = document.querySelector('[data-bstates]');
  var P = window.CDAH_PRINCIPLES && window.CDAH_PRINCIPLES['scr-111'];
  var D = P && P.states;
  if (!root || !D) return;
  var side = 'child', step = 'all';
  var sides = root.querySelectorAll('[data-side]');
  var pills = root.querySelectorAll('[data-step]');
  var figs  = root.querySelectorAll('.bs-fig [data-xfade]');
  var brain = root.querySelectorAll('.bs-brain [data-xfade]');
  var elDot = root.querySelector('[data-bs-dot]');
  var elK = root.querySelector('[data-bs-kicker]'), elH = root.querySelector('[data-bs-head]');
  var elB = root.querySelector('[data-bs-body]'), elAskRow = root.querySelector('[data-bs-askrow]'), elAsk = root.querySelector('[data-bs-ask]');
  var elNeedRow = root.querySelector('[data-bs-needrow]'), elNeed = root.querySelector('[data-bs-need]');
  /* NEW Oct 5 (Marc, VoiceOver): the figure and brain are one described image,
     and each press announces the picture and the caption together. */
  var stg = root.querySelector('[data-bs-stage]');
  var FIG = {
    child:  { all: 'Maya, smiling.', '0': 'Maya, overwhelmed.', '1': 'Maya, upset.', '2': 'Maya, calm and ready to think.' },
    parent: { all: 'The Parent, standing.', '0': 'The Parent, overwhelmed.', '1': 'The Parent, frustrated.', '2': 'The Parent, calm.' }
  };
  var BRAIN = {
    all: 'The brain shows all three parts.',
    '0': 'The brain stem, at the base of the brain, is lit up.',
    '1': 'The limbic system, in the middle of the brain, is lit up.',
    '2': 'The prefrontal lobes, at the front of the brain, are lit up.'
  };
  function stop(x) { x = String(x || '').trim(); return /[.?!”"]$/.test(x) ? x : x + '.'; }
  function say() {
    if (!window.CDAH_SAY) return;
    var t = [stg ? stg.getAttribute('aria-label') : '', stop(elK.textContent), stop(elH.textContent), elB.textContent];
    if (!elAskRow.hidden) t.push('Asks: ' + elAsk.textContent);
    if (elNeedRow && !elNeedRow.hidden) t.push('Needs: ' + elNeed.textContent);
    window.CDAH_SAY(t.join(' '));
  }

  function paint() {
    var i, on;
    for (i = 0; i < figs.length; i++) {
      on = figs[i].getAttribute('data-who') === side && figs[i].getAttribute('data-lvl') === step;
      figs[i].setAttribute('data-on', on ? 'yes' : 'no');
    }
    for (i = 0; i < brain.length; i++) brain[i].setAttribute('data-on', brain[i].getAttribute('data-lvl') === step ? 'yes' : 'no');
    for (i = 0; i < sides.length; i++) sides[i].setAttribute('aria-pressed', sides[i].getAttribute('data-side') === side ? 'true' : 'false');
    for (i = 0; i < pills.length; i++) pills[i].setAttribute('aria-pressed', pills[i].getAttribute('data-step') === step ? 'true' : 'false');
    elDot.setAttribute('data-c', step);
    if (step === 'all') {
      elK.textContent = 'Three states, three parts';
      elH.innerHTML = D.intro[side][0];
      elB.innerHTML = D.intro[side][1];
      if (elNeedRow) elNeedRow.hidden = true;
      elAskRow.hidden = true;
    } else {
      var s = D.list[+step];
      elK.textContent = s.part;
      elH.innerHTML = s.name + (s.alias ? ' <span class="bs-alias">&middot; ' + s.alias + '</span>' : '');
      elB.innerHTML = (s[side + 'Desc'] || s.desc) + ' ' + s[side][0];
      elAsk.innerHTML = s[side][1];
      elAskRow.hidden = false;
      if (elNeedRow) { elNeed.innerHTML = s[side][2] || ''; elNeedRow.hidden = !s[side][2]; }
    }
    if (stg) stg.setAttribute('aria-label', FIG[side][step] + ' ' + BRAIN[step]);
  }
  /* The caption box keeps one height for all eight captions so nothing below
     it jumps. Measured, not fixed in CSS, since the copy changes length. */
  var cap = root.querySelector('.bs-cap');
  function fit() {
    if (!cap || !cap.offsetParent) return;
    var s0 = side, t0 = step, max = 0, SS = ['child', 'parent'], TT = ['all', '0', '1', '2'];
    cap.style.height = 'auto';
    for (var a = 0; a < SS.length; a++) for (var b = 0; b < TT.length; b++) {
      side = SS[a]; step = TT[b]; paint(); max = Math.max(max, cap.offsetHeight);
    }
    side = s0; step = t0; paint();
    cap.style.height = max + 'px';
  }
  window.addEventListener('resize', fit);
  window.addEventListener('hashchange', function () { setTimeout(fit, 0); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  setTimeout(fit, 0);
  var scr = root.closest('.screen');
  if (scr && window.MutationObserver) new MutationObserver(function () { if (!scr.hidden) setTimeout(fit, 0); }).observe(scr, { attributes: true, attributeFilter: ['hidden'] });
  /* First press per visit brings the sides to the top and the caption box
     into view. */
  var fitted = false;
  function first() { if (fitted) return; fitted = true; window.CDAH_FIT(root.querySelector('.sides'), cap); }
  window.addEventListener('hashchange', function () { fitted = false; });
  for (var i = 0; i < sides.length; i++) sides[i].addEventListener('click', function () { side = this.getAttribute('data-side'); paint(); first(); say(); });
  for (var j = 0; j < pills.length; j++) pills[j].addEventListener('click', function () { step = this.getAttribute('data-step'); paint(); first(); say(); });
})();


/* ===== SCR-112 · the drop, and the way back =============================
   Revised 27 Sept. The brain follows the sequence and the caption sits under
   it, at its width, because the caption belongs to the picture. Pacing is
   reading time, not a fixed beat: two seconds plus 45ms a character, about
   30 seconds end to end. That is slow enough that a parent needs to be told
   it is still going, hence the six-segment bar (the current segment fills),
   Pause, and Watch again. Any segment jumps to that step. Reduced motion
   keeps the pacing (it is reading time) and loses only the crossfades. */

(function () {
  'use strict';
  var root = document.querySelector('[data-drop]');
  if (!root) return;
  var SEQ = [
    [2, 'Ready to think. This is the only state where teaching works.'],
    [1, 'Something goes wrong, and the brain drops a level. Now it runs on feeling, not reasoning.'],
    [0, 'More stress, another drop. Now it is the body. No explanation reaches here.'],
    [0, 'The way back up starts with what this level asks for \u2014 safety, not words.'],
    [1, 'Safety lands, and it comes up a level. Now connect: name the feeling.'],
    [2, 'Back to ready. Now teaching can work.']
  ];
  var IDLE = 'Watch what happens in the brain when a situation goes wrong.';
  var DONE = 'Back where it started. Watch it again, or tap any step in the bar.';
  var btn = root.querySelector('[data-drop-play]'), bar = root.querySelector('[data-drop-bar]');
  var cap = root.querySelector('[data-drop-cap]'), grid = root.querySelector('.drop-grid');
  var brain = root.querySelectorAll('.drop-brain [data-xfade]'), tiers = root.querySelectorAll('.dtier');
  var i = -1, t = 0, paused = false, tick = null;
  var fills = [];
  for (var k = 0; k < SEQ.length; k++) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'drop-seg';
    b.setAttribute('aria-label', 'Step ' + (k + 1) + ' of ' + SEQ.length);
    b.innerHTML = '<span><i></i></span>';
    (function (n) { b.addEventListener('click', function () { go(n); }); })(k);
    bar.appendChild(b); fills.push(b.querySelector('i'));
  }
  function dur(n) { return 2000 + SEQ[n][1].length * 45; }
  function level(lvl) {
    var key = lvl === null ? 'all' : String(lvl);
    for (var a = 0; a < brain.length; a++) brain[a].setAttribute('data-on', brain[a].getAttribute('data-lvl') === key ? 'yes' : 'no');
    for (var c = 0; c < tiers.length; c++) {
      if (lvl !== null && tiers[c].getAttribute('data-lvl') === key) tiers[c].setAttribute('data-live', 'yes');
      else tiers[c].removeAttribute('data-live');
    }
    if (lvl === null) grid.removeAttribute('data-running'); else grid.setAttribute('data-running', 'yes');
  }
  function paintBar(done) {
    for (var s = 0; s < fills.length; s++) fills[s].style.width = (done || s < i ? 100 : s === i ? Math.min(100, t / dur(i) * 100) : 0) + '%';
  }
  function stopTick() { clearInterval(tick); tick = null; }
  /* Oct 5 (Marc): keep the screen awake while the drop plays, so auto-lock
     can't cut it off. Released on pause, finish and leaving. */
  var lock = null;
  function wake(on) {
    try {
      if (on) {
        if (!lock && navigator.wakeLock) navigator.wakeLock.request('screen').then(function (l) {
          lock = l; l.addEventListener('release', function () { lock = null; });
        }).catch(function () {});
      } else if (lock) { lock.release(); lock = null; }
    } catch (e) {}
  }
  function finish() {
    stopTick(); wake(false); i = -1; t = 0; paused = false;
    level(null); paintBar(true);
    cap.textContent = DONE; cap.removeAttribute('data-live');
    btn.innerHTML = '&#8634;&#xFE0E; Watch again';
  }
  function go(n) {
    i = n; t = 0; paused = false; wake(true);
    bar.hidden = false;
    level(SEQ[i][0]); cap.textContent = SEQ[i][1]; cap.setAttribute('data-live', 'yes');
    btn.innerHTML = '&#10074;&#10074; Pause'; paintBar(false);
    stopTick();
    tick = setInterval(function () {
      if (paused) return;
      t += 50;
      if (t >= dur(i)) {
        if (i + 1 >= SEQ.length) { finish(); return; }
        i++; t = 0; level(SEQ[i][0]); cap.textContent = SEQ[i][1];
      }
      paintBar(false);
    }, 50);
  }
  function reset() {
    stopTick(); wake(false); i = -1; t = 0; paused = false;
    level(null); bar.hidden = true; paintBar(false);
    cap.textContent = IDLE; cap.removeAttribute('data-live');
    btn.innerHTML = '&#9654;&#xFE0E; Watch a drop, and the way back';
  }
  btn.addEventListener('click', function () {
    if (i < 0) { go(0); window.CDAH_FIT(root.querySelector('.drop-play'), root.querySelector('.drop-tiers')); return; }
    paused = !paused; wake(!paused);
    btn.innerHTML = paused ? '&#9654;&#xFE0E; Resume' : '&#10074;&#10074; Pause';
  });
  /* Leaving the screen resets it, like the breathing circle. */
  window.addEventListener('hashchange', reset);
})();


/* ===== SCR-113 · the iceberg ===========================================
   Revised 27 Sept. The drawn iceberg sits behind the layers, fading in from
   the left so the words stay on the quiet side. Each unopened layer has a
   veil over its depth of the ice; REVEAL lifts the veil and shows the text,
   so opening a layer shows more of the iceberg as well as the words. On a
   phone the iceberg slides further right, so the text sits on its faded
   side (chosen over a highlight or a glow, which no other text in the
   module has). The upshot line waits until all three are open. */

(function () {
  'use strict';
  var root = document.getElementById('berg');
  if (!root) return;

  var CASES = {
    a: {
      surface: 'She screams that she will not put her shoes on.',
      layers: [
        'She\u2019s been holding it together all morning, and her battery\u2019s running low.',
        'She wants some say in a morning that has already been decided for her.',
        'She can\u2019t yet go from playing to getting her shoes on without help.'
      ],
      upshot: 'Not \u201Cstop screaming and put your shoes on\u201D \u2014 but \u201Cthese ones or those ones?\u201D, offered before the shouting starts.'
    },
    b: {
      surface: 'He hits his little brother, then says he didn\u2019t.',
      layers: [
        'Something felt unfair, and it came out of his body before any words got there.',
        'He needs to know he is still loved, even when he has done something wrong.',  // 2 Oct (Marc)
        'He does not yet have a sentence for \u201Cthat was mine\u201D that actually works on a toddler.'
      ],
      upshot: 'Not \u201Csay sorry\u201D \u2014 but \u201Cwhat could you do instead of hitting next time?\u201D, once he is calm enough to answer it.'
    }
  };

  var layers  = root.querySelectorAll('.layer');
  var veils   = root.querySelectorAll('.berg-veil');
  var picks   = root.querySelectorAll('.side');
  var surface = document.getElementById('bergSurface');
  var upshot  = document.getElementById('bergUpshot');
  var upText  = document.getElementById('bergUpshotText');

  function set(n, open) {
    /* Oct 5 (Marc, VoiceOver): the box holds a label and a Reveal button; the
       text is silent until it's revealed, then announced. */
    layers[n].setAttribute('data-open', open ? 'yes' : 'no');
    var cue = layers[n].querySelector('.layer-cue');
    cue.setAttribute('aria-expanded', open ? 'true' : 'false');
    cue.textContent = open ? 'Close' : 'Reveal';
    layers[n].querySelector('.layer-text').setAttribute('aria-hidden', open ? 'false' : 'true');
    if (veils[n]) veils[n].setAttribute('data-open', open ? 'yes' : 'no');
  }
  function checkAll() {
    var all = true;
    for (var i = 0; i < layers.length; i++) if (layers[i].getAttribute('data-open') !== 'yes') all = false;
    upshot.hidden = !all;
  }
  function paintCase(key) {
    var c = CASES[key];
    if (!c) return;
    surface.textContent = c.surface;
    for (var i = 0; i < layers.length; i++) { layers[i].querySelector('.layer-text').textContent = c.layers[i]; set(i, false); }
    upText.textContent = c.upshot;
    upshot.hidden = true;
    for (var j = 0; j < picks.length; j++) picks[j].setAttribute('aria-pressed', picks[j].getAttribute('data-case') === key ? 'true' : 'false');
  }
  for (var i = 0; i < layers.length; i++) {
    (function (n) {
      layers[n].addEventListener('click', function () {
        var open = this.getAttribute('data-open') !== 'yes';
        set(n, open);
        checkAll();
        if (open && window.CDAH_SAY) window.CDAH_SAY(this.querySelector('.layer-text').textContent + (upshot.hidden ? '' : ' So what changes? ' + upText.textContent));
      });
    })(i);
  }
  for (var k = 0; k < picks.length; k++) picks[k].addEventListener('click', function () { paintCase(this.getAttribute('data-case')); });
})();


/* ===== SCR-114 · the four shifts =======================================
   Revised 27 Sept. Each old frame is paired with a Parent pose, and the
   shift changes the pose and the words together: Tense to Calm, Scolding to
   Gentle but Firm, Frustrated to Compassion, Angry to Two Options. The
   parent does the shifting, and can shift back. */

(function () {
  'use strict';
  var items = document.querySelectorAll('[data-shifts] .shift');
  var note = document.querySelector('[data-shifts-note]');
  function count() {
    var n = 0;
    for (var i = 0; i < items.length; i++) if (items[i].getAttribute('data-pressed') === 'true') n++;
    if (!note) return;
    note.textContent = n === 0 ? 'Tap each one to shift it.'
      : n < items.length ? n + ' of ' + items.length + ' shifted. Tap again to see the old frame.'
      : 'All four shifted. Tap any one to see the old frame again.';
  }
  for (var i = 0; i < items.length; i++) {
    items[i].addEventListener('click', function () {
      /* Oct 5 (Marc, VoiceOver): the box reads as label, words, then the Shift
         button; a shift announces the new words. */
      var on = this.getAttribute('data-pressed') !== 'true';
      this.setAttribute('data-pressed', on ? 'true' : 'false');
      this.querySelector('.shift-cue').setAttribute('aria-pressed', on ? 'true' : 'false');
      var imgs = this.querySelectorAll('[data-xfade]');
      imgs[0].setAttribute('data-on', on ? 'no' : 'yes');
      imgs[1].setAttribute('data-on', on ? 'yes' : 'no');
      this.querySelector('.shift-old').setAttribute('aria-hidden', on ? 'true' : 'false');
      this.querySelector('.shift-new').setAttribute('aria-hidden', on ? 'false' : 'true');
      this.querySelector('.shift-k').textContent = on ? 'The shift' : 'The old frame';
      this.querySelector('.shift-cue').textContent = on ? 'Shift back' : 'Shift it';
      count();
      if (window.CDAH_SAY) window.CDAH_SAY((on ? 'The shift: ' : 'The old frame: ') + this.querySelector(on ? '.shift-new' : '.shift-old').textContent + ' ' + (note ? note.textContent : ''));
    });
  }
})();


/* ===== Acts 2, 4, 5 · the card seen again ==============================
   The card's words come from the scene data, so the Learn screen and the
   Words to try strip can never drift apart. */

(function () {
  'use strict';
  var scene = window.CDAH_SCENES && window.CDAH_SCENES['scn-301'];
  var words = (scene && scene.words) || [];
  var hosts = document.querySelectorAll('[data-card-what]');
  for (var i = 0; i < hosts.length; i++) {
    var what = hosts[i].getAttribute('data-card-what').toLowerCase();
    for (var j = 0; j < words.length; j++) {
      if (String(words[j].what).toLowerCase() === what) {
        hosts[i].querySelector('.wt-say').innerHTML = words[j].say;
      }
    }
  }
})();


/* ===== SCR-123 · breathe together ======================================
   Three slow breaths, paced by a circle. In for 4s, out for 6s: a longer
   out-breath is the calming half. Reduced motion keeps the pacing in words
   and drops the growing circle. */

(function () {
  'use strict';
  var root = document.querySelector('[data-breathe]');
  if (!root) return;
  var ring = root.querySelector('[data-br-ring]');
  var btn  = root.querySelector('[data-br-go]');
  var cap  = root.querySelector('[data-br-cap]');
  var idle = cap.textContent;
  var timers = [], running = false;
  var IN = 4000, OUT = 6000, N = 3;

  function clear() { for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]); timers = []; }
  function stop(done) {
    clear(); running = false;
    ring.removeAttribute('data-phase');
    btn.textContent = done ? 'Again' : 'Try one now, three breaths';
    cap.textContent = done ? 'That\u2019s three. It works the same with your child beside you.' : idle;
  }
  function start() {
    clear(); running = true;
    btn.textContent = 'Stop';
    var t = 0;
    for (var k = 0; k < N; k++) {
      (function (k) {
        timers.push(setTimeout(function () { ring.setAttribute('data-phase', 'in'); cap.textContent = 'Breathe in through your nose\u2026 (' + (k + 1) + ' of ' + N + ')'; }, t));
        t += IN;
        timers.push(setTimeout(function () { ring.setAttribute('data-phase', 'out'); cap.textContent = 'And slowly out through your mouth\u2026'; }, t));
        t += OUT;
      })(k);
    }
    timers.push(setTimeout(function () { stop(true); }, t));
  }
  btn.addEventListener('click', function () { if (running) stop(false); else start(); });
  /* The circle starts it too (30 Sept, Marc). The button stays the
     accessible control; the ring is aria-hidden. */
  ring.addEventListener('click', function () { if (!running) start(); else stop(false); });
  /* Leaving the screen stops the count. */
  window.addEventListener('hashchange', function () { if (running) stop(false); });
})();


/* ===== SCR-304 · the Hook Bookend, the payoff (package K, revised 30 Sept) ==
   Marc: no second write. The first answer to the 7:40 morning sits beside
   what the parent actually said in Scene 3, the same morning played live,
   and a table marks which Act moves each one used. Never scored. Reads the
   latest Scene 3 transcript (answers['scn-303'], its "You:" lines). */

(function () {
  'use strict';
  var S = window.CDAH_STATE, M = window.CDAH_MATCH;
  var B = window.CDAH_BOOKEND;
  var root = document.getElementById('scr-304');
  if (!root || !B || !M) return;
  var q = root.querySelectorAll('[data-bk]');
  for (var i = 0; i < q.length; i++) { var k = q[i].getAttribute('data-bk'); if (B[k]) q[i].textContent = B[k]; }
  var thenT = document.getElementById('bkThenT'), thenNone = document.getElementById('bkThenNone');
  var nowT = document.getElementById('bkNowT'), nowNone = document.getElementById('bkNowNone');
  var res = document.getElementById('bkResult'), table = document.getElementById('bkTable');
  var ana = document.getElementById('bkAnalysis');

  function shouting(raw) { return /\b[A-Z]{3,}\b/.test(raw) || raw.indexOf('!!') !== -1; }
  function uses(raw) {
    var hay = M.prep(raw), out = {};
    var any = function (list) {
      for (var j = 0; j < (list || []).length; j++) if (hay.indexOf(' ' + M.prep(list[j]).trim() + ' ') !== -1) return true;
      return false;
    };
    B.moves.forEach(function (m) {
      out[m.id] = m.breaks ? (!!raw.trim() && !shouting(raw) && !any(m.breaks)) : any(m.accept);
    });
    return out;
  }
  function first() { var a = S.get().answers || {}; return typeof a.baseline === 'string' ? a.baseline.replace(/\s+$/, '') : ''; }
  function scene3() {
    var a = (S.get().answers || {})[B.scene || 'scn-303'];
    if (typeof a !== 'string') return '';
    return a.split('\n').filter(function (l) { return l.indexOf('You: ') === 0; })
      .map(function (l) { return l.slice(5); }).join('\n');
  }
  function cell(txt, cls, role) { var c = document.createElement('span'); c.className = cls; c.setAttribute('role', role || 'cell'); c.textContent = txt; return c; }
  function mark(on) {
    var c = cell(on ? '\u2713' : '\u25CB', 'bk-m', 'cell');
    if (on) c.setAttribute('data-hit', 'yes');
    c.setAttribute('aria-label', on ? B.yes : B.no);
    return c;
  }

  function paint() {
    var t = first(), n = scene3();
    thenT.textContent = t; thenT.hidden = !t; thenNone.hidden = !!t;
    nowT.textContent = n; nowT.hidden = !n; nowNone.hidden = !!n;
    res.hidden = !n;
    if (!n) return;
    var was = t ? uses(t) : null, now = uses(n), count = 0;
    table.innerHTML = '';
    var hr = document.createElement('div'); hr.className = 'bk-tr bk-th'; hr.setAttribute('role', 'row');
    hr.appendChild(cell(B.tableK, 'bk-name', 'columnheader'));
    hr.appendChild(cell(B.thenShort, 'bk-m', 'columnheader'));
    hr.appendChild(cell(B.nowShort, 'bk-m', 'columnheader'));
    table.appendChild(hr);
    B.moves.forEach(function (m) {
      if (now[m.id]) count++;
      var r = document.createElement('div'); r.className = 'bk-tr'; r.setAttribute('role', 'row');
      r.appendChild(cell(m.name, 'bk-name'));
      r.appendChild(was ? mark(was[m.id]) : cell('\u2013', 'bk-m'));
      r.appendChild(mark(now[m.id]));
      table.appendChild(r);
    });
    var key = count === B.moves.length ? 'all' : count === 0 ? 'none' : 'some';
    var line = B.analysis && B.analysis[key];
    ana.textContent = line || ''; ana.hidden = !line;
  }
  document.addEventListener('cdah:restart', paint);
  paint();
  window.addEventListener('hashchange', paint);
})();
