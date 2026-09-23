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

  /* ---- router ---------------------------------------------------------- */

  function indexOf(id) { return ids.indexOf(id); }

  function show(id, opts) {
    var i = indexOf(id);
    if (i === -1) { i = 0; id = ids[0]; }

    /* The offer to resume is answered by ANY navigation, not just its own two
       buttons — and it carries a destructive control, so it does not sit
       above the content once the parent has moved on by any route. */
    if (current !== null) resume.hidden = true;
    current = id;

    for (var n = 0; n < screens.length; n++) screens[n].hidden = (screens[n].id !== id);

    var el = screens[i];
    app.setAttribute('data-theme', el.getAttribute('data-theme') || 'light');
    paintHeader(el);
    paintNav(i);

    if (!opts || !opts.silent) S.reached(id);
    paintLenses();
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
    if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    stage.scrollTop = 0;
    /* After focus and the scroll reset, so the fade is not fighting either. */
    FX.enter(el);
  }

  function paintHeader(el) {
    var key = el.getAttribute('data-section');
    var sec = key && T.sections[key];
    var home = el.id !== 'scr-099';
    elName.disabled = !home;
    elName.setAttribute('aria-label', home ? 'Back to the start of the module' : 'Conscious Discipline at Home');
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
    for (var k = 1; k <= steps; k++) {
      var i2 = document.createElement('i');
      if (k === step) i2.className = 'on';
      else if (k < step) i2.className = 'done';
      elProg.appendChild(i2);
    }
    elProg.hidden = steps === 0;
  }

  /* The four principles are parallel lenses, so SCR-102 is a chooser rather
     than a corridor. Read state comes from the same visited list the resume
     strip uses — nothing new is stored. The gate is stated, never enforced:
     a parent who wants the quiz first can have it. */

  var LENSES = ['scr-103', 'scr-104', 'scr-105', 'scr-106'];

  function lensesLeft() {
    var seen = S.get().visited || [];
    var left = 0;
    for (var i = 0; i < LENSES.length; i++) {
      if (seen.indexOf(LENSES[i]) === -1) left++;
    }
    return left;
  }

  function paintLenses() {
    var nav = document.getElementById('lenses');
    if (nav) {
      var seen = S.get().visited || [];
      var cards = nav.querySelectorAll('.lens');
      for (var i = 0; i < cards.length; i++) {
        var read = seen.indexOf(cards[i].getAttribute('data-lens')) !== -1;
        cards[i].setAttribute('data-read', read ? 'yes' : 'no');
        cards[i].querySelector('.mark').textContent = read ? 'read \u2713' : '2 min';
      }
      var gate = document.getElementById('lensGate');
      var left = lensesLeft();
      if (gate) {
        gate.textContent = left === 0
          ? 'All four read. Test Your Knowledge is four situations, in any order.'
          : left === 4
            ? 'Take them in any order. You\u2019ll want all four before Test Your Knowledge.'
            : left === 1
              ? 'One still to read. Take it whenever \u2014 you\u2019ll want all four before Test Your Knowledge.'
              : left + ' still to read. Take them in any order; you\u2019ll want all four before Test Your Knowledge.';
      }
    }

    var closeGate = document.getElementById('closeGate');
    if (closeGate) {
      var n = lensesLeft();
      closeGate.textContent = n === 0
        ? ''
        : n === 1
          ? 'One lens is still unread. It is on the overview screen if you want it first.'
          : n + ' of the four lenses are still unread. They are on the overview screen if you want them first.';
      closeGate.hidden = n === 0;
    }
  }

  function paintNav(i) {
    btnBack.disabled = i === 0;
    btnNext.disabled = i === ids.length - 1;
    btnBack.textContent = T.nav.back;
    btnNext.textContent = T.nav.next;
  }

  function go(delta) {
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
    if (current !== 'scr-099') show('scr-099');
  });

  btnBack.addEventListener('click', function () { go(-1); });
  btnNext.addEventListener('click', function () { go(1); });

  window.addEventListener('hashchange', function () {
    var id = location.hash.slice(1);
    if (id && id !== current && indexOf(id) !== -1) show(id);
  });

  /* ---- the End of Section 2 band (SCR-209, SCR-300) --------------------- */

  var bands = stage.querySelectorAll('[data-band]');
  var C2 = T.close2 || {};
  for (var b = 0; b < bands.length; b++) (function (sec) {
    var q = function (s) { return sec.querySelector(s); };
    var intro = sec.getAttribute('data-band') === 'intro';
    var note = q('[data-band-note]');
    q('[data-band-eyebrow]').textContent = intro ? C2.eyebrowIntro : C2.eyebrowClose;
    q('[data-band-title]').textContent = (intro && C2.titleIntro) || C2.title || '';
    q('[data-band-body]').textContent = C2.body || '';
    q('[data-band-go]').textContent = C2.go || '';
    q('[data-band-stop]').textContent = C2.stop || '';
    note.textContent = C2.note || '';
    q('[data-band-go]').addEventListener('click', function () { H.tap(); show('scn-301'); });
    /* Stopping is already true — show() saved this screen. The button
       only says so, with the same weight as going on. */
    q('[data-band-stop]').addEventListener('click', function () { note.textContent = C2.stopped || C2.note || ''; });
    window.addEventListener('hashchange', function () { note.textContent = C2.note || ''; });
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
    elCode.textContent = S.code();
    scrim.hidden = false;
    panel.hidden = false;
    btnX.focus();
    document.addEventListener('keydown', trap, true);
  }

  function closePanel() {
    if (typeof disarm === 'function') disarm();
    panel.hidden = true;
    scrim.hidden = true;
    document.removeEventListener('keydown', trap, true);
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

  btnAbout.addEventListener('click', openPanel);
  btnX.addEventListener('click', closePanel);
  scrim.addEventListener('click', closePanel);

  document.getElementById('codeCopy').addEventListener('click', function () {
    var btn = this, was = btn.textContent;
    H.tap();
    var done = function () { btn.textContent = T.panel.save.copied; setTimeout(function () { btn.textContent = was; }, 1600); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(S.code()).then(done, done);
    } else {
      var r = document.createRange(); r.selectNodeContents(elCode);
      var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
      done();
    }
  });

  document.getElementById('codeMail').addEventListener('click', function () {
    var subject = 'Conscious Discipline at Home — my resume code';
    var body = 'Paste this code into the module on your other device:\n\n' + S.code() + '\n';
    window.location.href = 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
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
      /* R toggles the Words to try strip. The strip arrives with the
         role-plays; until then the key is reserved and does nothing. */
      if (window.CDAH_STRIP && window.CDAH_STRIP.toggle) { e.preventDefault(); window.CDAH_STRIP.toggle(); }
      return;
    }
    if (panel.hidden) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); go(-1); }
    }
  });

  /* ---- returning parent ------------------------------------------------ */

  function boot() {
    /* The hash carries the screen id, so stop the browser restoring a scroll
       position or anchor-jumping the header out of view. */
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    var hash = location.hash.slice(1);
    var saved = S.get().screen;

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
    if (note && field.value) note.textContent = 'Kept.';
    field.addEventListener('input', function () {
      /* The confirmation is about the stored sentence, so it clears the
         moment the box stops matching what is stored. */
      if (note) note.textContent = (field.value === saved()) ? 'Kept.' : '';
    });
  }

  if (keep && field) {
    keep.addEventListener('click', function () {
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
      if (note) note.textContent = 'Kept.';
      paintReadback();
    });
  }

  document.addEventListener('cdah:restart', function () {
    if (field) field.value = '';
    if (note) note.textContent = '';
    if (bSafe) bSafe.hidden = true;
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


/* ===== SCR-103 · the three levels ======================================
   Kept in its own closure: the screen runner above does not need to know
   this exists, and if it throws, navigation still works. The child copy is
   in the HTML, so the screen reads correctly with JavaScript off; this only
   swaps to the parent wording and runs the drop sequence. */

(function () {
  'use strict';
  var root = document.getElementById('levels');
  if (!root) return;

  var COPY = {
    child: [
      ['Shows in the body \u2014 hitting, bolting, going rigid.', '\u201CAm I safe?\u201D', 'Safety. Fewer words, slower voice, no questions or choices yet.'],
      ['Shows in the words \u2014 yelling, blaming, \u201Cyou never.\u201D', '\u201CDo you still love me?\u201D', 'Connection. Name the feeling before you name anything else.'],
      ['Can hear you, can weigh two options.', '\u201CWhat do I do about this?\u201D', 'Teaching lands here \u2014 two choices, a plan, a repair.']
    ],
    parent: [
      ['Shows in the body \u2014 tensed up, voice raised, the sentence you\u2019ll regret half out.', '\u201CAm I still in control here?\u201D', 'Stop talking. One breath before the next word \u2014 nothing from here lands the way you mean it.'],
      ['Shows in the words \u2014 sarcasm, keeping score, \u201Cafter everything I do.\u201D', '\u201CDoes any of this get noticed?\u201D', 'Name it to yourself. You can be angry and still choose the next sentence.'],
      ['You can hear them and still hold the line.', '\u201CWhat is my child missing here?\u201D', 'The only level teaching comes from. Get here first, even if it costs a minute.']
    ]
  };

  var SEQ = [
    [0,     2, 'Ready to think. This is the only level teaching lands on.'],
    [1600,  1, 'Something goes wrong, and the brain drops a level. Now it runs on feeling, not reasoning.'],
    [3400,  0, 'More stress, another drop. Now it is the body. No explanation reaches here.'],
    [5200,  0, 'The way back up starts with what this level asks for \u2014 safety, not words.'],
    [7000,  1, 'Safety lands, and it comes up a level. Now name the feeling.'],
    [8800,  2, 'Back to ready. Only now does teaching work.'],
    [11000, null, '']
  ];

  var tiers   = root.querySelector('.tiers');
  var rows    = root.querySelectorAll('.tier');
  var sides   = root.querySelectorAll('.side');
  var btn     = document.getElementById('levelsPlay');
  var caption = document.getElementById('levelsCaption');
  var timers  = [];
  var playing = false;

  function tierByLevel(n) {
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].getAttribute('data-lvl') === String(n)) return rows[i];
    }
    return null;
  }

  function paintSide(which) {
    var set = COPY[which];
    for (var n = 0; n < 3; n++) {
      var t = tierByLevel(n);
      if (!t) continue;
      t.querySelector('.tier-shows').textContent = set[n][0];
      t.querySelector('.tier-asks').textContent  = set[n][1];
      t.querySelector('.tier-needs').textContent = set[n][2];
    }
    for (var i = 0; i < sides.length; i++) {
      sides[i].setAttribute('aria-pressed', sides[i].getAttribute('data-side') === which ? 'true' : 'false');
    }
  }

  function clear() {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
  }

  function highlight(n) {
    for (var i = 0; i < rows.length; i++) rows[i].removeAttribute('data-live');
    if (n === null) { tiers.removeAttribute('data-running'); return; }
    tiers.setAttribute('data-running', 'yes');
    var t = tierByLevel(n);
    if (t) t.setAttribute('data-live', 'yes');
  }

  function stop() {
    clear();
    playing = false;
    highlight(null);
    caption.textContent = '';
    btn.textContent = 'Watch a drop, and the way back';
  }

  function start() {
    clear();
    playing = true;
    btn.textContent = 'Stop';
    /* Reduced motion still gets the sequence — it is content, not decoration —
       but tightened, and the CSS transitions are already off. */
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var scale = reduce ? 0.6 : 1;
    for (var i = 0; i < SEQ.length; i++) {
      (function (step) {
        timers.push(setTimeout(function () {
          if (step[1] === null) { stop(); return; }
          highlight(step[1]);
          caption.textContent = step[2];
        }, step[0] * scale));
      })(SEQ[i]);
    }
  }

  for (var i = 0; i < sides.length; i++) {
    sides[i].addEventListener('click', function () {
      stop();
      paintSide(this.getAttribute('data-side'));
    });
  }

  btn.addEventListener('click', function () { if (playing) stop(); else start(); });
})();


/* ===== SCR-105 · the iceberg ===========================================
   Layers start closed because the principle is that you have to look. The
   upshot line is withheld until all three are open, so it reads as the
   payoff rather than a fourth layer. */

(function () {
  'use strict';
  var root = document.getElementById('berg');
  if (!root) return;

  var CASES = {
    a: {
      surface: 'She screams that she will not put her shoes on.',
      layers: [
        'She has been holding it together all morning and has nothing left to hold it with.',
        'She wants some say in a morning that has already been decided for her.',
        'She cannot yet stop one thing and start another without help doing it.'
      ],
      upshot: 'Not \u201Cstop screaming and put your shoes on\u201D \u2014 but \u201Cthese ones or those ones?\u201D, offered before the shouting starts.'
    },
    b: {
      surface: 'He hits his little brother, then says he didn\u2019t.',
      layers: [
        'Something felt unfair, and it came out of his body before any words got there.',
        'He needs to know he is still the one you are glad to see, not only the older one.',
        'He does not yet have a sentence for \u201Cthat was mine\u201D that actually works on a toddler.'
      ],
      upshot: 'Not \u201Csay sorry\u201D \u2014 but \u201Cwhat could you do instead of hitting next time?\u201D, once he is calm enough to answer it.'
    }
  };

  var layers  = root.querySelectorAll('.layer');
  var picks   = root.querySelectorAll('.side');
  var surface = document.getElementById('bergSurface');
  var upshot  = document.getElementById('bergUpshot');
  var upText  = document.getElementById('bergUpshotText');

  function checkAll() {
    var all = true;
    for (var i = 0; i < layers.length; i++) {
      if (layers[i].getAttribute('aria-expanded') !== 'true') all = false;
    }
    upshot.hidden = !all;
  }

  function closeAll() {
    for (var i = 0; i < layers.length; i++) {
      layers[i].setAttribute('aria-expanded', 'false');
      layers[i].querySelector('.layer-cue').textContent = 'LOOK';
    }
    upshot.hidden = true;
  }

  function paintCase(key) {
    var c = CASES[key];
    if (!c) return;
    surface.textContent = c.surface;
    for (var i = 0; i < layers.length; i++) {
      layers[i].querySelector('.layer-text').textContent = c.layers[i];
    }
    upText.textContent = c.upshot;
    for (var j = 0; j < picks.length; j++) {
      picks[j].setAttribute('aria-pressed', picks[j].getAttribute('data-case') === key ? 'true' : 'false');
    }
    closeAll();
  }

  for (var i = 0; i < layers.length; i++) {
    layers[i].addEventListener('click', function () {
      var open = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', open ? 'false' : 'true');
      this.querySelector('.layer-cue').textContent = open ? 'LOOK' : 'HIDE';
      checkAll();
    });
  }

  for (var k = 0; k < picks.length; k++) {
    picks[k].addEventListener('click', function () { paintCase(this.getAttribute('data-case')); });
  }
})();
