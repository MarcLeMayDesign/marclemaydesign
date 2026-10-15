/* Learn, Alpha Draft 2 (15 Oct). Every interaction on the lrn-* screens.
   Part ticks and picks live in state.learn:
     split, drop, rise          1.1 split seen; 1.2 / 1.3 played (Part 1 = both)
     p22                        2.2 self-read (Part 2)
     s32, c32                   3.2 state + clue (Part 3)
     h { '42-0': 'help', … }    4.2 + 4.4 lines (Part 4 = all four)
     wheel                      4.1 moves seen
   Reduced motion: the split, the reels and the wheel all land in their end
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
  function say(t) { if (window.CDAH_SAY) window.CDAH_SAY(t); }
  function fade(n, ms, delay) {
    if (!n || !n.animate || reduced()) return;
    n.animate([{ opacity: 0, translate: '0 6px' }, { opacity: 1, translate: '0 0' }], { duration: ms || 280, delay: delay || 0, easing: 'ease-out', fill: 'backwards' });
  }

  /* A detent for the wheel. Android: a short vibrate. iPhone (iOS 18+):
     Safari has no vibrate, but toggling a switch checkbox gives the system's
     own light tick, so a hidden one is toggled. Off under reduced motion. */
  var sw = null;
  function detent() {
    if (reduced()) return;
    if (navigator.vibrate) { try { navigator.vibrate(8); } catch (e) {} return; }
    try {
      if (!sw) {
        sw = document.createElement('label');
        sw.setAttribute('aria-hidden', 'true');
        sw.style.cssText = 'position:fixed;left:-200px;top:0;width:1px;height:1px;overflow:hidden;opacity:0';
        var inp = document.createElement('input');
        inp.type = 'checkbox'; inp.setAttribute('switch', ''); inp.tabIndex = -1;
        sw.appendChild(inp); document.body.appendChild(sw);
      }
      sw.click();
    } catch (e) {}
  }

  /* ---- parts and the header bars ------------------------------------- */

  var PART = { 'lrn-11': 1, 'lrn-12': 1, 'lrn-13': 1, 'lrn-21': 2, 'lrn-22': 2, 'lrn-23': 2, 'lrn-31': 3, 'lrn-32': 3,
    'lrn-41': 4, 'lrn-42': 4, 'lrn-43': 4, 'lrn-44': 4, 'lrn-45': 4, 'lrn-46': 4 };
  var NAMES = ['The three brain states model', 'Your state first', 'Your child\u2019s state', 'What their state needs'];
  function parts() {
    var l = L(), h = l.h || {};
    return [!!(l.drop && l.rise), !!l.p22, !!(l.s32 && l.c32), !!(h['42-0'] && h['42-1'] && h['44-0'] && h['44-1'])];
  }
  function current() { return location.hash.slice(1); }
  function paintBars() {
    var id = current();
    if (!/^lrn-/.test(id)) return;
    var d = parts(), cur = PART[id] || 0;
    $$('#headProg i').forEach(function (b, k) { b.className = cur === k + 1 ? 'on' : d[k] ? 'done' : ''; });
    $$('#headProg button').forEach(function (b, k) { b.setAttribute('aria-label', 'Part ' + (k + 1) + ': ' + NAMES[k] + (d[k] ? ', done' : '')); });
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

  /* ---- 1.1 the brain splits into its three states --------------------- */

  var brain = (function () {
    var root = $('[data-ln-brain]');
    if (!root) return { paint: function () {} };
    var all = $('.ln-brain-all', root), cue = $('.ln-brain-cue', root), list = $('[data-ln-states]', root);
    var again = $('[data-ln-resplit]', root), cards = $$('.ln-state', list), running = [];
    function stop() { running.forEach(function (a) { a.cancel(); }); running = []; }
    function land() { all.hidden = true; cue.hidden = true; list.hidden = false; again.hidden = false; root.setAttribute('data-split', 'yes'); }
    function whole() { stop(); all.hidden = false; cue.hidden = false; list.hidden = true; again.hidden = true; root.removeAttribute('data-split'); }
    function split() {
      if (root.getAttribute('data-split') === 'yes') return;
      H.tap();
      var from = all.querySelector('img').getBoundingClientRect();
      land();
      save({ split: true });
      say('The brain splits into its three states: Executive, Emotional, and Survival.');
      if (reduced() || !list.animate) return;
      cards.forEach(function (c, n) {
        var img = c.querySelector('img'), to = img.getBoundingClientRect();
        if (!to.width) return;
        var dx = (from.left + from.width / 2) - (to.left + to.width / 2);
        var dy = (from.top + from.height / 2) - (to.top + to.height / 2);
        var sc = from.width / to.width;
        running.push(img.animate([
          { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + sc + ')' },
          { transform: 'translate(' + dx * 0.15 + 'px,' + dy * 0.15 + 'px) scale(' + (1 + (sc - 1) * 0.12) + ')', offset: 0.7 },
          { transform: 'none' }
        ], { duration: 1500 + n * 160, delay: 120 + n * 90, easing: 'cubic-bezier(.45,.05,.25,1)', fill: 'backwards' }));
        running.push(c.querySelector('.ln-state-bg').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: 1050 + n * 160, easing: 'ease-out', fill: 'backwards' }));
        running.push(c.querySelector('.ln-state-txt').animate([{ opacity: 0, translate: '0 10px' }, { opacity: 1, translate: '0 0' }], { duration: 650, delay: 1200 + n * 180, easing: 'ease-out', fill: 'backwards' }));
      });
    }
    $$('[data-ln-split]', root).forEach(function (b) { b.addEventListener('click', split); });
    again.addEventListener('click', function () { whole(); requestAnimationFrame(split); });
    return { paint: function () { if (L().split) { stop(); land(); } else whole(); } };
  })();

  /* ---- 1.2 the drop, 1.3 the way back up -------------------------------
     Each is a box with one pane per state, stacked top to bottom
     (Executive, Emotional, Survival). Before it plays, the box is locked on
     the first pane. Playing glides the box from pane to pane (down for the
     drop, up for the rise) and each pane's text fades in as it arrives.
     After that the box scrolls freely, so a parent can go back and read.
     Reduced motion: no box, the three panes sit in a column, all visible. */

  function reel(wrap) {
    var kind = wrap.getAttribute('data-ln-reel');
    var box = $('.ln-reel', wrap), panes = $$('.ln-pane', box);
    var btn = $('[data-ln-play]', wrap), hint = $('[data-ln-hint]', wrap);
    var order = kind === 'drop' ? [0, 1, 2] : [2, 1, 0];
    var label = btn.textContent, timers = [], raf = 0, playing = false;
    function clear() { timers.forEach(clearTimeout); timers = []; cancelAnimationFrame(raf); playing = false; }
    function y(i) { return panes[i].offsetTop; }
    function show(i, on) { panes[i].setAttribute('data-shown', on ? 'yes' : 'no'); }
    function glide(to, ms, done) {
      var from = box.scrollTop, t0 = 0;
      function step(t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / ms), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        box.scrollTop = from + (to - from) * e;
        if (k < 1) raf = requestAnimationFrame(step); else if (done) done();
      }
      raf = requestAnimationFrame(step);
    }
    function idle() {
      clear();
      var played = !!L()[kind];
      if (reduced()) { box.setAttribute('data-state', 'still'); panes.forEach(function (p, i) { show(i, true); }); btn.hidden = true; hint.hidden = true; if (!played) save(kv(true)); return; }
      box.setAttribute('data-state', played ? 'free' : 'locked');
      panes.forEach(function (p, i) { show(i, played || i === order[0]); });
      box.scrollTop = y(order[0]);
      btn.textContent = played ? 'Play again' : label;
      btn.disabled = false;
      hint.hidden = !played;
    }
    function kv(v) { var o = {}; o[kind] = v; return o; }
    function play() {
      if (playing) return;
      clear(); playing = true; H.tap();
      box.setAttribute('data-state', 'locked');
      panes.forEach(function (p, i) { show(i, i === order[0]); });
      box.scrollTop = y(order[0]);
      btn.disabled = true; btn.textContent = kind === 'drop' ? 'Dropping\u2026' : 'Rising\u2026';
      hint.hidden = true;
      var at = 900;
      [1, 2].forEach(function (s) {
        timers.push(setTimeout(function () {
          glide(y(order[s]), 1700, function () {
            show(order[s], true);
            say(panes[order[s]].querySelector('h2').textContent + '. ' + panes[order[s]].querySelector('.ln-pane-t').textContent);
          });
        }, at));
        at += 1700 + 2600;
      });
      timers.push(setTimeout(function () {
        playing = false;
        save(kv(true));
        box.setAttribute('data-state', 'free');
        btn.disabled = false; btn.textContent = 'Play again';
        hint.hidden = false;
      }, at - 1600));
    }
    btn.addEventListener('click', play);
    box.addEventListener('click', function () { if (box.getAttribute('data-state') === 'locked' && !playing) play(); });
    box.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && box.getAttribute('data-state') === 'locked') { e.preventDefault(); play(); } });
    window.addEventListener('hashchange', function () { if (playing) idle(); });
    return { idle: idle };
  }
  var reels = $$('[data-ln-reel]').map(reel);

  /* ---- expand boxes (2.1, 3.1, 4.3) ---------------------------------- */

  $$('[data-ln-more]').forEach(function (b) {
    var t = document.getElementById(b.getAttribute('aria-controls'));
    var shut = b.getAttribute('data-ln-more');
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      t.hidden = !open;
      if (shut) b.textContent = open ? 'Hide the signs' : shut;
      if (open) { H.tap(); fade(t, 300); }
    });
  });
  function closeAll() {
    $$('[data-ln-more]').forEach(function (b) {
      b.setAttribute('aria-expanded', 'false');
      document.getElementById(b.getAttribute('aria-controls')).hidden = true;
      if (b.getAttribute('data-ln-more')) b.textContent = b.getAttribute('data-ln-more');
    });
  }

  /* ---- 2.2 the self-read --------------------------------------------- */

  var T22 = {
    fight: 'That\u2019s the Survival State: your body getting ready to fight. It\u2019s the most common drop at 7:40 a.m., and the one to watch out for first.',
    freeze: 'That\u2019s the Survival State too. Freeze (surrender) is giving up to make it stop. It\u2019s quieter than fight, but it\u2019s the same drop.',
    emo: 'That\u2019s the Emotional State. Taking it personally is the clue: \u201Con purpose\u201D is a story your feelings are telling you, not what\u2019s going on in her brain.',
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
    if (s === 'surv' && c === 'words') return 'Right state. But look at her body, not just her words. \u201CI\u2019m not going\u201D could be Emotional. The throw and the kick are a fight response, and fight is Survival.';
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
    $('[data-ln-c32img]').src = 'assets/img/' + (s === 'surv' && c === 'body' ? 'coach-encouraging.png' : 'coach-thinking.png');
    if (anim && t) fade(fb, 320);
  }
  $$('[data-ln-s32]').forEach(function (b) { b.addEventListener('click', function () { H.tap(); save({ s32: b.getAttribute('data-ln-s32') }); paint32(true); }); });
  $$('[data-ln-c32]').forEach(function (b) { b.addEventListener('click', function () { H.tap(); save({ c32: b.getAttribute('data-ln-c32') }); paint32(true); }); });

  /* ---- 2.3 breathe with me ------------------------------------------- */

  (function () {
    var root = $('[data-ln-breathe]');
    if (!root) return;
    var circ = $('[data-ln-circ]', root), word = $('[data-ln-word]', root), btn = $('[data-ln-br]', root);
    var poses = $$('[data-ln-poses] img', root), idleLabel = btn.textContent, timers = [], on = false;
    var ALT = ['An overwhelmed parent.', 'A parent, less tense now.', 'A calm parent.'];
    function pose(n) { poses.forEach(function (p, i) { p.setAttribute('data-on', i === n ? 'yes' : 'no'); p.alt = i === n ? ALT[i] : ''; }); }
    function stop(done) {
      timers.forEach(clearTimeout); timers = []; on = false;
      circ.removeAttribute('data-phase');
      word.textContent = done ? 'Nicely done' : 'Ready';
      btn.textContent = done ? 'Breathe again' : idleLabel;
      if (!done) pose(0);
    }
    function start() {
      stop(false); on = true; H.tap(); btn.textContent = 'Stop';
      for (var n = 0; n < 6; n++) (function (n) {
        timers.push(setTimeout(function () {
          var inb = n % 2 === 0;
          circ.setAttribute('data-phase', inb ? 'in' : 'out');
          word.textContent = inb ? 'Breathe in' : 'Breathe out';
          pose(Math.floor(n / 2));
          if (inb) say('Breathe in. ' + (n / 2 + 1) + ' of 3.'); else say('And out.');
        }, n * 4200));
      })(n);
      timers.push(setTimeout(function () { stop(true); pose(2); }, 6 * 4200));
    }
    btn.addEventListener('click', function () { if (on) stop(false); else start(); });
    circ.addEventListener('click', function () { if (!on) start(); });
    window.addEventListener('hashchange', function () { if (on) stop(false); });
  })();

  /* ---- 4.1 the wheel --------------------------------------------------
     A white disc with the four moves at its compass points, under a tinted
     cover with one wedge cut out at the top. The arrows turn the disc a
     quarter at a time. First run: only clockwise, until a move has been
     seen; once all four have been seen, it turns freely both ways. The
     full text of the move in the window reads beside the wheel. */

  var MOVES = [
    ['Compose Yourself', 'Catch yourself before your voice goes up. Deep belly breaths. Say to yourself: \u201CI\u2019ve got this. I\u2019m the parent, they need me. Getting angry and yelling back won\u2019t do any good right now.\u201D'],
    ['Make It Safe', 'A limit is the line around what\u2019s OK. Stop anything that is physically dangerous, and state only limits that keep the danger from continuing: \u201CI won\u2019t let you kick.\u201D'],
    ['Describe the Scene', 'Calmly say what\u2019s going on with your child\u2019s body and words. No judgment here, just say what you see. This is the first step to connection, and you might be surprised at how well this disarms your child and makes them feel seen: \u201CI see your face is all in a scowl, you\u2019re crying, and your legs are in the air.\u201D'],
    ['Breathe Together', 'Ask your child to teach you a deep belly breath they learned at school, then do it together. If they\u2019re not quite ready for that, keep breathing yourself, and encourage them through your actions to breathe with you.']
  ];
  var wheel = (function () {
    var root = $('[data-ln-wheel]');
    if (!root) return { paint: function () {} };
    var disc = $('[data-ln-disc]', root), w = $('.ln-wheel', root);
    var cw = $('.ln-turn.cw', root), ccw = $('.ln-turn.ccw', root);
    var rk = $('[data-ln-rk]', root), rn = $('[data-ln-rn]', root), rt = $('[data-ln-rt]', root), hub = $('[data-ln-hub]', root);
    var dots = $$('.ln-dots i', root), slots = $$('.ln-slot', root), read = $('.ln-read', root);
    var turns = 0;
    function idx() { return ((turns % 4) + 4) % 4; }
    function seen() { return L().wheel || [0]; }
    function paint(anim) {
      var k = idx(), sv = seen();
      disc.style.rotate = (-turns * 90) + 'deg';
      rk.textContent = 'Move ' + (k + 1) + ' of 4';
      rn.textContent = MOVES[k][0];
      rt.textContent = MOVES[k][1];
      hub.textContent = (k + 1) + ' of 4';
      dots.forEach(function (d, i) { d.setAttribute('data-on', i === k ? 'yes' : sv.indexOf(i) !== -1 ? 'seen' : 'no'); });
      slots.forEach(function (s, i) { s.setAttribute('aria-hidden', i === k ? 'false' : 'true'); });
      ccw.hidden = sv.length < 4 && k === 0;
      if (anim) fade(read, 340, 180);
    }
    function turn(d) {
      if (d < 0 && ccw.hidden) return;
      turns += d; detent();
      var k = idx(), sv = seen().slice();
      if (sv.indexOf(k) === -1) { sv.push(k); save({ wheel: sv }); }
      paint(true);
    }
    cw.addEventListener('click', function () { turn(1); });
    ccw.addEventListener('click', function () { turn(-1); });
    w.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); turn(1); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); turn(-1); }
    });
    /* A sideways swipe on the disc turns it too. */
    var x0 = null;
    disc.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
    disc.addEventListener('pointerup', function (e) { if (x0 === null) return; var dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) turn(dx < 0 ? 1 : -1); });
    return { paint: function () { turns = 0; paint(false); } };
  })();

  /* ---- 4.2 / 4.4 helpful or hurtful ---------------------------------- */

  var LINES = {
    '42': [
      ['I won\u2019t let you kick. I\u2019m right here.', 'help', 'A safety limit, said once, and you stay close. That answers \u201CAm I safe right now?\u201D with yes.'],
      ['Fine! Then you can stay home by yourself!', 'hurt', 'A threat to leave her makes \u201CAm I safe right now?\u201D harder to answer, and drops her further.']
    ],
    '44': [
      ['Why are you so upset? They\u2019re just shoes.', 'hurt', 'A why-question asks her to reason, and she can\u2019t yet. \u201CJust shoes\u201D tells her the feeling is wrong.'],
      ['Those shoes feel all wrong today. Do I get you?', 'help', 'It names the feeling and checks in. That answers \u201CAm I still loved?\u201D with yes.']
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
        '<aside class="coach-says" hidden aria-live="polite"><img class="coach-fig" src="assets/img/coach-encouraging.png" alt="" width="56" height="84">' +
        '<div class="coach-txt"><p class="coach-k">Coach says</p><p class="coach-t"></p></div></aside>';
      host.appendChild(box);
      box._paint = function (anim) {
        var v = (L().h || {})[key], ok = v === ln[1], word = ln[1] === 'help' ? 'helpful' : 'hurtful';
        $$('.ln-hh .btn', box).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-v') === v ? 'true' : 'false'); });
        var c = $('.coach-says', box);
        c.hidden = !v;
        if (!v) return;
        $('.coach-fig', box).src = 'assets/img/' + (ok ? 'coach-encouraging.png' : 'coach-thinking.png');
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
        });
      });
    });
  });
  function paintLines() { $$('.ln-line').forEach(function (b) { b._paint(false); }); }

  /* ---- arrival, restart ---------------------------------------------- */

  function paintAll() { paintHome(); brain.paint(); reels.forEach(function (r) { r.idle(); }); paint22(); paint32(); paintLines(); wheel.paint(); paintBars(); }
  (window.CDAH_AFTER_SHOW = window.CDAH_AFTER_SHOW || []).push(function (id) {
    if (!/^lrn-/.test(id)) return;
    paintBars();
    if (id === 'lrn-10') paintHome();
    if (id === 'lrn-11') brain.paint();
    if (id === 'lrn-12') reels[0].idle();
    if (id === 'lrn-13') reels[1].idle();
    if (id === 'lrn-41') wheel.paint();
  });
  document.addEventListener('cdah:restart', function () { closeAll(); paintAll(); });
  paintAll();
})();
