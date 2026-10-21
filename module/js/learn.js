/* Learn, Alpha Draft 2 (15 Oct; slow-walk round 2, 19 Oct). Every
   interaction on the lrn-* screens. Part ticks and picks live in state.learn:
     split, split21, split31    1.1 / 2.1 / 3.1 split seen
     drop, rise                 1.2 / 1.3 played (Part 1 = both)
     p22                        2.2 self-read (Part 2)
     s32, c32                   3.2 state + clue (Part 3)
     h { '42-0': 'help', … }    4.2 + 4.4 lines (Part 4 = all four)
     st41, st43, st45           4.1 / 4.3 / 4.5 moves shown (a count)
   Reduced motion: the splits, the reels and the steps all land in their end
   state without moving; nothing is lost but the motion. */

(function () {
  'use strict';
  var S = window.CDAH_STATE, FX = window.CDAH_FX, H = window.CDAH_HAPTICS || { tap: function () {} };
  if (!S || !document.getElementById('lrn-10')) return;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function reduced() { return !!(FX && FX.reduced && FX.reduced()); }
  function L() { return S.get().learn || {}; }
  function save(p) { var o = {}, c = L(), k; for (k in c) o[k] = c[k]; for (k in p) o[k] = p[k]; S.set({ learn: o }); paintBars(); }
  function kv(k, v) { var o = {}; o[k] = v; return o; }
  function say(t) { if (window.CDAH_SAY) window.CDAH_SAY(t); }
  function fade(n, ms, delay) {
    if (!n || !n.animate || reduced()) return;
    n.animate([{ opacity: 0, translate: '0 6px' }, { opacity: 1, translate: '0 0' }], { duration: ms || 280, delay: delay || 0, easing: 'ease-out', fill: 'backwards' });
  }
  /* Learn screens are zoomed to 90% on desktop (css/learn.css), so a
     measured on-screen distance is converted back to the element's own px. */
  function zoomOf(el) { return (el.offsetWidth && el.getBoundingClientRect().width / el.offsetWidth) || 1; }

  /* ---- parts and the header bars ------------------------------------- */

  var PART = { 'lrn-11': 1, 'lrn-12': 1, 'lrn-13': 1, 'lrn-21': 2, 'lrn-22': 2, 'lrn-23': 2, 'lrn-31': 3, 'lrn-32': 3,
    'lrn-41': 4, 'lrn-42': 4, 'lrn-43': 4, 'lrn-44': 4, 'lrn-45': 4, 'lrn-46': 4 };
  var NAMES = ['The three brain states model', 'Your state first', 'Your child\u2019s state', 'What their state needs'];
  /* 20 Oct [MARC]: a part also counts as done once its last screen has been
     reached. Before, a reel played only partway (or a skipped check) kept
     1.0's "welcome back" screen from ever appearing. */
  var LAST = { 'lrn-13': 0, 'lrn-23': 1, 'lrn-32': 2, 'lrn-46': 3 };
  function parts() {
    var l = L(), h = l.h || {}, s = l.seen || {};
    return [!!(l.drop && l.rise) || !!s[0], !!l.p22 || !!s[1], !!(l.s32 && l.c32) || !!s[2],
      !!(h['42-0'] && h['42-1'] && h['44-0'] && h['44-1']) || !!s[3]];
  }
  function current() { return location.hash.slice(1); }
  function paintBars() {
    var id = current();
    if (!/^lrn-/.test(id)) return;
    var d = parts(), cur = PART[id] || 0;
    $$('#headProg i').forEach(function (b, k) { b.className = cur === k + 1 ? 'on' : d[k] ? 'done' : ''; });
    $$('#headProg button').forEach(function (b, k) { b.setAttribute('aria-label', 'Part ' + (k + 1) + ': ' + NAMES[k] + (d[k] ? ', done' : '')); });
  }

  /* Anything marked data-ln-after="key" shows once that key is done. */
  function paintAfter(key, anim) {
    $$('[data-ln-after="' + key + '"]').forEach(function (n) {
      var v = L()[key], on = key.indexOf('st') === 0 ? v >= +n.closest('section').querySelectorAll('[data-ln-steps="' + key + '"] .ln-step').length : !!v;
      var was = n.hidden;
      n.hidden = !on;
      if (anim && was && on) { if (key.indexOf('st') === 0) fade(n, 1000, 700); else fade(n, 420); }
    });
  }

  /* ---- 1.0 overview, and its "at a glance" state ---------------------- */

  function paintHome() {
    var root = document.getElementById('lrn-10');
    var d = parts(), all = d.every(Boolean);
    $$('[data-ln-first]', root).forEach(function (n) { n.hidden = all; });
    $$('[data-ln-again]', root).forEach(function (n) { n.hidden = !all; });
    $$('[data-ln-part]', root).forEach(function (b) { b.setAttribute('data-done', d[+b.getAttribute('data-ln-part')] ? 'yes' : 'no'); });
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-ln-help],[data-ln-about]');
    if (!t || !window.CDAH_OPEN_PANEL) return;
    H.tap();
    window.CDAH_OPEN_PANEL(t.hasAttribute('data-ln-about') ? 'about' : 'help');
  });

  /* ---- the split (1.1 brain, 2.1 parent, 3.1 child) -------------------
     19 Oct (Marc): one smooth move. The three copies start stacked where
     the single picture was, Executive on top; they go see-through at once,
     then come back to solid as they glide into their boxes. The boxes fade
     in as the pictures land, the words just after. */

  function makeSplit(root) {
    var key = root.getAttribute('data-ln-brain');
    var all = $('.ln-brain-all', root), cue = $('.ln-brain-cue', root), list = $('[data-ln-states]', root);
    var again = $('[data-ln-resplit]', root), cards = $$('.ln-state', list), running = [], timer = 0;
    var DUR = 1700;
    function stop() { running.forEach(function (a) { a.cancel(); }); running = []; clearTimeout(timer); cards.forEach(function (c) { c.style.zIndex = ''; }); }
    function land() { all.hidden = true; cue.hidden = true; list.hidden = false; again.hidden = false; root.setAttribute('data-split', 'yes'); }
    function whole() { stop(); all.hidden = false; cue.hidden = false; list.hidden = true; again.hidden = true; root.removeAttribute('data-split'); }
    function split() {
      if (root.getAttribute('data-split') === 'yes') return;
      H.tap();
      var from = all.querySelector('img').getBoundingClientRect();
      land();
      if (reduced() || !list.animate) { save(kv(key, true)); paintAfter(key, false); return; }
      var z = zoomOf(list);
      cards.forEach(function (c, n) {
        var img = c.querySelector('img'), to = img.getBoundingClientRect();
        if (!to.width) return;
        var dx = ((from.left + from.width / 2) - (to.left + to.width / 2)) / z;
        var dy = ((from.top + from.height / 2) - (to.top + to.height / 2)) / z;
        var sc = from.height / to.height;
        c.style.zIndex = String(10 - n);
        running.push(img.animate([
          { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + sc + ')', opacity: 1 },
          { opacity: 0.45, offset: 0.14 },
          { transform: 'none', opacity: 1 }
        ], { duration: DUR, delay: n * 60, easing: 'cubic-bezier(.42,0,.22,1)', fill: 'backwards' }));
        running.push(c.querySelector('.ln-state-bg').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, delay: DUR * 0.6 + n * 60, easing: 'ease-out', fill: 'backwards' }));
        running.push(c.querySelector('.ln-state-txt').animate([{ opacity: 0, translate: '0 10px' }, { opacity: 1, translate: '0 0' }], { duration: 600, delay: DUR * 0.78 + n * 90, easing: 'ease-out', fill: 'backwards' }));
      });
      timer = setTimeout(function () {
        cards.forEach(function (c) { c.style.zIndex = ''; });
        save(kv(key, true)); paintAfter(key, true);
      }, DUR + 600);
    }
    $$('[data-ln-split]', root).forEach(function (b) { b.addEventListener('click', split); });
    again.addEventListener('click', function () { whole(); requestAnimationFrame(split); });
    return { paint: function () { if (L()[key]) { stop(); land(); } else whole(); paintAfter(key, false); } };
  }
  var splits = {};
  $$('[data-ln-brain]').forEach(function (r) { splits[r.closest('section').id] = makeSplit(r); });

  /* ---- 1.2 the drop, 1.3 the way back up -------------------------------
     A box with one pane per state, stacked top to bottom. Playing glides
     from pane to pane and each pane's words fade in as it arrives. Each
     pane holds for reading time (1.8s plus 45ms a character). The bar beside
     the button (19 Oct, Marc; the old SCR-112 bar) has one segment per
     state: the current one fills, and any segment jumps there. The button
     pauses and resumes. After a full play the box scrolls freely. Reduced
     motion: no box, the three panes sit in a column, all visible. */

  function reel(wrap) {
    var kind = wrap.getAttribute('data-ln-reel');
    var box = $('.ln-reel', wrap), panes = $$('.ln-pane', box);
    var btn = $('[data-ln-play]', wrap), segs = $('[data-ln-segs]', wrap);
    var hint = $('[data-ln-hint]', wrap) || {};
    var order = kind === 'drop' ? [0, 1, 2] : [2, 1, 0];
    var label = btn.textContent, raf = 0, i = -1, t = 0, last = 0, paused = false, from = 0, GLIDE = 1500;
    var fills = order.map(function (p, n) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'ln-seg';
      b.setAttribute('aria-label', panes[p].querySelector('h2').textContent);
      b.innerHTML = '<span><i></i></span>';
      /* 19 Oct (Marc): a click lands the playhead where it hits the segment,
         not at the segment's start. Keyboard: the start. */
      b.addEventListener('click', function (e) {
        H.tap();
        var r = b.getBoundingClientRect();
        go(n, e.detail && r.width ? Math.max(0, Math.min(0.98, (e.clientX - r.left) / r.width)) : 0);
      });
      segs.appendChild(b);
      return b.querySelector('i');
    });
    function y(n) { return panes[order[n]].offsetTop; }
    function show(p, on) { panes[p].setAttribute('data-shown', on ? 'yes' : 'no'); }
    function hold(n) { return 1800 + panes[order[n]].querySelector('.ln-pane-t').textContent.length * 45; }
    function len(n) { return (n ? GLIDE : 0) + hold(n); }
    function ease(k) { return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
    function paintSegs(done) {
      fills.forEach(function (f, s) { f.style.width = (done || s < i ? 100 : s === i ? Math.min(100, t / len(i) * 100) : 0) + '%'; });
    }
    function frame(now) {
      if (!last) last = now;
      if (!paused) t += now - last;
      last = now;
      if (i > 0 || from !== y(0)) {
        var g = i > 0 ? GLIDE : 600, k = Math.min(1, t / g);
        box.scrollTop = from + (y(i) - from) * ease(k);
        if (k >= 0.55 && panes[order[i]].getAttribute('data-shown') !== 'yes') {
          show(order[i], true);
          say(panes[order[i]].querySelector('h2').textContent + '. ' + panes[order[i]].querySelector('.ln-pane-t').textContent);
        }
      }
      if (t >= len(i)) {
        if (i + 1 >= order.length) { finish(); return; }
        i++; t = 0; from = box.scrollTop;
      }
      paintSegs(false);
      raf = requestAnimationFrame(frame);
    }
    function go(n, f) {
      cancelAnimationFrame(raf);
      box.setAttribute('data-state', 'locked');
      if (i < 0) { panes.forEach(function (p, j) { show(j, j === order[0]); }); box.scrollTop = y(0); }
      from = box.scrollTop; i = n; t = (f || 0) * len(n); last = 0; paused = false;
      if (n === 0) show(order[0], true);
      for (var s = n + 1; s < order.length; s++) show(order[s], false);
      segs.setAttribute('data-on', 'yes');
      hint.hidden = true;
      btn.textContent = 'Pause';
      raf = requestAnimationFrame(frame);
    }
    function finish() {
      cancelAnimationFrame(raf); i = -1; t = 0; paused = false;
      save(kv(kind, true));
      box.setAttribute('data-state', 'free');
      paintSegs(true);
      btn.textContent = 'Play again';
      hint.hidden = false;
    }
    function idle() {
      cancelAnimationFrame(raf); i = -1; t = 0; paused = false;
      var played = !!L()[kind];
      if (reduced()) { box.setAttribute('data-state', 'still'); panes.forEach(function (p, j) { show(j, true); }); btn.hidden = true; segs.hidden = true; hint.hidden = true; if (!played) save(kv(kind, true)); return; }
      box.setAttribute('data-state', played ? 'free' : 'locked');
      panes.forEach(function (p, j) { show(j, played || j === order[0]); });
      box.scrollTop = y(0);
      btn.textContent = played ? 'Play again' : label;
      segs.setAttribute('data-on', played ? 'yes' : 'no');
      hint.hidden = !played;
      paintSegs(played);
    }
    btn.addEventListener('click', function () {
      if (i < 0) { H.tap(); go(0); return; }
      paused = !paused;
      btn.textContent = paused ? 'Resume' : 'Pause';
    });
    box.addEventListener('click', function () { if (box.getAttribute('data-state') === 'locked' && i < 0) go(0); });
    box.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && box.getAttribute('data-state') === 'locked' && i < 0) { e.preventDefault(); go(0); } });
    window.addEventListener('hashchange', function () { if (i >= 0) idle(); });
    return { idle: idle };
  }
  var reels = $$('[data-ln-reel]').map(reel);

  /* ---- 2.2 the self-read --------------------------------------------- */

  var T22 = {
    fight: 'That\u2019s the Survival State: your body getting ready to fight. It\u2019s the most common drop at 7:40 a.m., and the one to watch out for first.',
    freeze: 'That\u2019s the Survival State too. Freeze (surrender) is giving up to make it stop. It\u2019s quieter than fight, but it\u2019s the same drop.',
    emo: 'That\u2019s the Emotional State. Taking it personally is the clue: \u2018on purpose\u2019 is a story your feelings are telling you, not what\u2019s going on in her brain.',
    exec: 'That\u2019s the Executive State: you can still think and wonder. If that\u2019s you, good. Under this much stress, most of us drop at least one state.'
  };
  function paint22(anim) {
    var v = L().p22, fb = $('[data-ln-fb22]');
    $$('[data-ln-p22]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-ln-p22') === v ? 'true' : 'false'); });
    fb.hidden = !T22[v];
    $('[data-ln-t22]').textContent = T22[v] || '';
    if (anim && T22[v]) fade(fb, 320);
  }
  $$('[data-ln-p22]').forEach(function (b) {
    b.addEventListener('click', function () { H.tap(); save({ p22: b.getAttribute('data-ln-p22') }); paint22(true); });
  });

  /* ---- 3.2 Maya's state, and the clue -------------------------------- */

  function t32(s, c) {
    if (!s || !c) return '';
    if (s === 'surv' && c === 'body') return 'Yes. Her body told you. The throw and the kick are her fight response, and fight is the Survival State. Her words alone could have been Emotional.';
    if (s === 'surv' && c === 'words') return 'Right state. But look at her body, not just her words. \u2018I\u2019m not going\u2019 could be Emotional. The throw and the kick are a fight response, and fight is Survival.';
    if (s === 'surv') return 'Right state. Being late is your stress, though, not her signal. Her body is the clue: the throw and the kick are her fight response.';
    if (s === 'emo') return 'Her words could be Emotional, but her body says more. The throw and the kick are her fight response. That\u2019s the Survival State.';
    return 'Not yet. A child who\u2019s ready to think can talk it through. Throwing and kicking are a fight response: the Survival State.';
  }
  function paint32(anim) {
    var l = L(), s = l.s32, c = l.c32, fb = $('[data-ln-fb32]'), clues = $('[data-ln-clues]');
    $$('[data-ln-s32]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-ln-s32') === s ? 'true' : 'false'); });
    $$('[data-ln-c32]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-ln-c32') === c ? 'true' : 'false'); });
    var wasHidden = clues.hidden;
    clues.hidden = !s;
    if (anim && wasHidden && s) fade(clues, 300);
    var t = t32(s, c);
    fb.hidden = !t;
    $('[data-ln-t32]').textContent = t;
    $('[data-ln-c32img]').src = 'assets/img/' + (s === 'surv' && c === 'body' ? 'coach-encouraging-sticker.png' : 'coach-thinking-sticker.png');
    if (anim && t) fade(fb, 320);
  }
  $$('[data-ln-s32]').forEach(function (b) { b.addEventListener('click', function () { H.tap(); save({ s32: b.getAttribute('data-ln-s32') }); paint32(true); }); });
  $$('[data-ln-c32]').forEach(function (b) { b.addEventListener('click', function () { H.tap(); save({ c32: b.getAttribute('data-ln-c32') }); paint32(true); }); });

  /* ---- 2.3 breathe with me --------------------------------------------
     19 Oct (Marc): the dark circle fills the light one on each breath in and
     shrinks on each breath out; the word sits under it. The parent's
     crossfade runs over a whole breath: it starts with the breath, is
     halfway at the top of the breath in, and lands as the breath out ends.
     Breath 1: overwhelmed to frustrated. Breath 2: frustrated to calm.
     Breath 3: calm holds. Arriving on the screen shows the overwhelmed
     parent at once, with no fade (the old flash). With it (Marc): the
     figure rises very slightly on each breath in, and blurs softly at the
     middle of each crossfade. */

  var breathe = (function () {
    var root = $('[data-ln-breathe]');
    if (!root) return { reset: function () {} };
    var circ = $('[data-ln-circ]', root), word = $('[data-ln-word]', root), btn = $('[data-ln-br]', root);
    var poses = $$('[data-ln-poses] img', root), idleLabel = btn.textContent, timers = [], on = false;
    var BR = 4200, ALT = ['An overwhelmed parent.', 'A parent, less tense now.', 'A parent, steadier.', 'A calm, smiling parent.'];
    var fig = $('[data-ln-poses]', root);
    function soft() { fig.removeAttribute('data-blur'); void fig.offsetWidth; fig.setAttribute('data-blur', 'yes'); }
    function pose(n) { poses.forEach(function (p, i) { p.setAttribute('data-on', i === n ? 'yes' : 'no'); p.alt = i === n ? ALT[i] : ''; }); if (fig) fig.setAttribute('data-gl', String(n)); }
    function instant(fn) { root.setAttribute('data-instant', 'yes'); fn(); void root.offsetWidth; root.removeAttribute('data-instant'); }
    function stop(done) {
      timers.forEach(clearTimeout); timers = []; on = false;
      circ.removeAttribute('data-phase');
      fig.removeAttribute('data-rise'); fig.removeAttribute('data-blur');
      word.textContent = done ? 'Nicely done.' : 'Ready when you are.';
      btn.textContent = done ? 'Breathe again' : idleLabel;
    }
    function reset() { stop(false); instant(function () { pose(0); }); }
    function start() {
      stop(false); instant(function () { pose(0); });
      on = true; H.tap(); btn.textContent = 'Stop';
      root.style.setProperty('--br-x', (BR * 2) + 'ms');
      root.style.setProperty('--br-h', BR + 'ms');
      for (var n = 0; n < 6; n++) (function (n) {
        timers.push(setTimeout(function () {
          var inb = n % 2 === 0;
          circ.setAttribute('data-phase', inb ? 'in' : 'out');
          fig.setAttribute('data-rise', inb ? 'in' : 'out');
          if (inb) soft();
          word.textContent = inb ? 'Breathe in\u2026' : 'Breathe out\u2026';
          if (inb) pose(n / 2 + 1);
          if (inb) say('Breathe in. ' + (n / 2 + 1) + ' of 3.'); else say('And out.');
        }, n * BR));
      })(n);
      timers.push(setTimeout(function () { stop(true); }, 6 * BR));
    }
    btn.addEventListener('click', function () { if (on) reset(); else start(); });
    circ.addEventListener('click', function () { if (!on) start(); });
    window.addEventListener('hashchange', function () { if (on) reset(); });
    return { reset: reset };
  })();

  /* ---- the steps (4.1, 4.3, 4.5) --------------------------------------
     19 Oct (Marc): a short arrow under the body copy. A click grows it and
     the next move's box fades in below it, with the next arrow. The grown
     arrows stay as the line between the boxes, so the order shows. The
     Coach (data-ln-after) comes once the last box is out. */

  function makeSteps(root) {
    var key = root.getAttribute('data-ln-steps');
    var arrows = $$('.ln-arrow', root), steps = $$('.ln-step', root);
    function count() { return Math.min(L()[key] || 0, steps.length); }
    function paint(anim) {
      var n = count();
      arrows.forEach(function (a, k) {
        a.hidden = k > n;
        a.setAttribute('data-done', k < n ? 'yes' : 'no');
        a.disabled = k < n;
        a.tabIndex = k < n ? -1 : 0;
      });
      steps.forEach(function (s, k) { s.hidden = k >= n; });
      paintAfter(key, anim);
    }
    arrows.forEach(function (a, k) {
      a.addEventListener('click', function () {
        if (k !== count()) return;
        H.tap();
        a.setAttribute('data-done', 'yes');
        var go = function () {
          save(kv(key, k + 1));
          paint(true);
          fade(steps[k], 420);
          if (arrows[k + 1]) fade(arrows[k + 1], 320, 260);
          var next = arrows[k + 1] || $('[data-ln-after="' + key + '"]');
          if (window.CDAH_FIT) window.CDAH_FIT(steps[k], next && !next.hidden ? next : steps[k]);
          var h = steps[k].querySelector('h2');
          if (arrows[k + 1]) arrows[k + 1].focus({ preventScroll: true }); else if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
        };
        if (reduced()) go(); else setTimeout(go, 240);
      });
    });
    return { paint: paint };
  }
  var stepSets = $$('[data-ln-steps]').map(makeSteps);

  /* ---- 4.2 / 4.4 helpful or hurtful ---------------------------------- */

  var LINES = {
    '42': [
      ['I won\u2019t let you kick. I\u2019m right here.', 'help', 'A safety limit, said once, and you stay close. That answers \u2018Am I safe right now?\u2019 with yes.'],
      ['Fine! Then you can stay home by yourself!', 'hurt', 'A threat to leave her makes \u2018Am I safe right now?\u2019 harder to answer, and drops her further.']
    ],
    '44': [
      ['Why are you so upset? They\u2019re just shoes.', 'hurt', 'A why-question asks her to reason, and she can\u2019t yet. \u2018Just shoes\u2019 tells her the feeling is wrong.'],
      ['Those shoes feel all wrong today. Do I get you?', 'help', 'It names the feeling and checks in. That answers \u2018Am I still loved?\u2019 with yes.']
    ]
  };
  $$('[data-ln-lines]').forEach(function (host) {
    var sid = host.getAttribute('data-ln-lines');
    LINES[sid].forEach(function (ln, n) {
      var key = sid + '-' + n;
      var box = document.createElement('div');
      box.className = 'ln-line';
      box.innerHTML = '<p class="ln-line-q">\u201C' + ln[0] + '\u201D</p>' +
        '<div class="ln-hh" role="group" aria-label="Helpful or hurtful?">' +
        '<button class="btn btn-quiet" type="button" aria-pressed="false" data-v="help">Helpful</button>' +
        '<button class="btn btn-quiet" type="button" aria-pressed="false" data-v="hurt">Hurtful</button></div>' +
        '<aside class="coach-says" hidden aria-live="polite"><img class="coach-fig" src="assets/img/coach-encouraging-sticker.png" alt="" width="56" height="84">' +
        '<div class="coach-txt"><p class="coach-k">Coach says</p><p class="coach-t"></p></div></aside>';
      host.appendChild(box);
      box._paint = function (anim) {
        var v = (L().h || {})[key], ok = v === ln[1], word = ln[1] === 'help' ? 'helpful' : 'hurtful';
        $$('.ln-hh .btn', box).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-v') === v ? 'true' : 'false'); });
        var c = $('.coach-says', box);
        c.hidden = !v;
        if (!v) return;
        $('.coach-fig', box).src = 'assets/img/' + (ok ? 'coach-encouraging-sticker.png' : 'coach-thinking-sticker.png');
        $('.coach-t', box).textContent = (ok ? 'Yes, ' + word + '. ' : 'Look again: this one is ' + word + '. ') + ln[2];
        if (anim) fade(c, 300);
      };
      $$('.ln-hh .btn', box).forEach(function (b) {
        b.addEventListener('click', function () {
          H.tap();
          var h = {}, cur = L().h || {}, k;
          for (k in cur) h[k] = cur[k];
          h[key] = b.getAttribute('data-v');
          save({ h: h });
          box._paint(true);
          /* 19 Oct (Marc): bring the Coach's answer into view. */
          if (window.CDAH_FIT) window.CDAH_FIT(box, $('.coach-says', box));
        });
      });
    });
  });
  function paintLines() { $$('.ln-line').forEach(function (b) { b._paint(false); }); }

  /* ---- the morning panel (2.2, 3.2, 4.2, 4.4) ------------------------
     19 Oct (Marc, 3a): arriving, the panel starts on the light ground and
     darkens over 1.2s. Reduced motion: it is simply dark. */
  function morning(id) {
    var p = $('#' + id + ' [data-ln-morning]');
    if (!p) return;
    clearTimeout(p._t);
    p.removeAttribute('data-fading');
    if (reduced()) { p.setAttribute('data-lit', 'yes'); return; }
    p.removeAttribute('data-lit');
    void p.offsetWidth;
    requestAnimationFrame(function () {
      p.setAttribute('data-fading', 'yes');
      p.setAttribute('data-lit', 'yes');
      p._t = setTimeout(function () { p.removeAttribute('data-fading'); }, 1300);
    });
  }
  $$('[data-ln-morning]').forEach(function (p) { p.setAttribute('data-lit', 'yes'); });

  /* ---- arrival, restart ---------------------------------------------- */

  function paintAll() {
    paintHome();
    Object.keys(splits).forEach(function (k) { splits[k].paint(); });
    reels.forEach(function (r) { r.idle(); });
    paint22(); paint32(); paintLines(); breathe.reset();
    stepSets.forEach(function (s) { s.paint(false); });
    paintBars();
  }
  (window.CDAH_AFTER_SHOW = window.CDAH_AFTER_SHOW || []).push(function (id) {
    if (id === 'scn-303') { morning(id); return; }  /* 20 Oct [MARC]: the 7:40 panel fades in here too */
    if (!/^lrn-/.test(id)) return;
    if (LAST[id] != null && !(L().seen || {})[LAST[id]]) { var sn = {}, cs = L().seen || {}, q; for (q in cs) sn[q] = cs[q]; sn[LAST[id]] = true; save({ seen: sn }); }
    paintBars();
    if (id === 'lrn-10') paintHome();
    if (splits[id]) splits[id].paint();
    if (id === 'lrn-12') reels[0].idle();
    if (id === 'lrn-13') reels[1].idle();
    if (id === 'lrn-23') breathe.reset();
    if (/^lrn-(22|32|42|44)$/.test(id)) morning(id);
  });
  document.addEventListener('cdah:restart', paintAll);
  paintAll();
})();
