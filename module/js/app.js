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
  var SECTION_HOME = { learn: 'scr-110', check: 'scr-201', practice: 'scr-300' };
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
    for (var k = 1; k <= steps; k++) {
      var i2 = document.createElement('i');
      if (k === step) i2.className = 'on';
      else if (k < step) i2.className = 'done';
      elProg.appendChild(i2);
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

  function paintLenses() {
    var seen = S.get().visited || [];
    var cards = document.querySelectorAll('[data-lens-set]');
    for (var i = 0; i < cards.length; i++) {
      var set = cards[i].getAttribute('data-lens-set').split(' ');
      var n = countRead(set);
      cards[i].setAttribute('data-read', n === set.length ? 'yes' : 'no');
      cards[i].querySelector('.mark').textContent = n === set.length ? 'read \u2713'
        : n === 0 ? set.length + ' screens' : n + ' of ' + set.length + ' read';
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

  elSub.addEventListener('click', function () {
    var to = elSub.getAttribute('data-go');
    if (to && to !== current) show(to);
  });

  /* With somewhere to go back to, Back is the browser's back, and the
     hashchange below lands the screen. Arriving cold (a reload, a shared
     link), there is no trail yet, so it falls back to the previous screen. */
  function back() {
    if (trail.length > 1) history.back();
    else go(-1);
  }

  btnBack.addEventListener('click', back);
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
    codeNow = '';
    elCode.textContent = '\u2026';
    S.codeAsync().then(function (c) { codeNow = c; elCode.textContent = c; });
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
      st.textContent = 'Couldn\u2019t copy automatically. The code is selected: copy it by hand.';
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
  var roots = document.querySelectorAll('[data-levels]');
  for (var r = 0; r < roots.length; r++) levels(roots[r]);

  /* Assess 1 carries the child / parent toggle, Assess 2 the play sequence.
     Same ladder, so one function; each part is optional. */
  function levels(root) {

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
  var btn     = root.querySelector('[data-levels-play]');
  var caption = root.querySelector('[data-levels-caption]');
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
    if (caption) caption.textContent = '';
    if (btn) btn.textContent = 'Watch a drop, and the way back';
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

  if (btn) btn.addEventListener('click', function () { if (playing) stop(); else start(); });
  }
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


/* ===== SCR-114 · the four shifts =======================================
   Old frame first, shift on tap: the parent does the shifting. */

(function () {
  'use strict';
  var items = document.querySelectorAll('[data-shifts] .shift');
  for (var i = 0; i < items.length; i++) {
    items[i].addEventListener('click', function () {
      var open = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', open ? 'false' : 'true');
      this.querySelector('.shift-cue').textContent = open ? 'SHIFT IT' : 'BACK';
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
    cap.textContent = done ? 'That\u2019s three. It works the same with her beside you.' : idle;
  }
  function start() {
    clear(); running = true;
    btn.textContent = 'Stop';
    var t = 0;
    for (var k = 0; k < N; k++) {
      (function (k) {
        timers.push(setTimeout(function () { ring.setAttribute('data-phase', 'in'); cap.textContent = 'Breathe in\u2026 (' + (k + 1) + ' of ' + N + ')'; }, t));
        t += IN;
        timers.push(setTimeout(function () { ring.setAttribute('data-phase', 'out'); cap.textContent = 'And slowly out\u2026'; }, t));
        t += OUT;
      })(k);
    }
    timers.push(setTimeout(function () { stop(true); }, t));
  }
  btn.addEventListener('click', function () { if (running) stop(false); else start(); });
  /* Leaving the screen stops the count. */
  window.addEventListener('hashchange', function () { if (running) stop(false); });
})();
