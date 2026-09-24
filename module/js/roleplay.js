/* The role-play engine. One controller per [data-scene] section, driven by
   content/scenarios.js.

   Each turn, in order:
     safety check (role-play context) → silent scoring → step() → reply +
     coach note → pose → state
   The safety check fires only on the parent's REAL child in here (the
   scripted child is expected to be upset), and when it fires nothing is
   scored and the turn is not used.

   Scoring is silent during the scene. The four criteria add up over the
   whole scene: a criterion hit on any turn counts. Composure broken on any
   turn caps the result: the composure result replaces everything. */

(function () {
  'use strict';

  var S = window.CDAH_STATE;
  var M = window.CDAH_MATCH;
  var H = window.CDAH_HAPTICS;
  var FX = window.CDAH_FX;
  var DATA = window.CDAH_SCENES;
  if (!DATA || !M) return;

  var ORDER = ['composure', 'connect', 'limit', 'choices'];

  /* Shouting is read from the raw text, before normalizing throws case
     away. "I", "OK" and "TV" are not shouting. */
  function shouting(raw) {
    if (/!!/.test(raw)) return true;
    var words = raw.match(/\b[A-Z]{3,}\b/g) || [];
    for (var i = 0; i < words.length; i++) if (words[i] !== 'TV' && words[i] !== 'OK') return true;
    return false;
  }

  function hitAny(hay, list) {
    for (var i = 0; i < list.length; i++) {
      var p = M.normalize(list[i]).trim();
      if (p && hay.indexOf(' ' + p + ' ') !== -1) return true;
    }
    return false;
  }

  /* Filler words dropped before matching, as the safety check does: "you
     really wanted" has to meet "you wanted". */
  function strip(hay) {
    var f = / (just|really|so|honestly|actually|totally|very|super|kind of|sort of) /g;
    return hay.replace(f, ' ').replace(f, ' ');
  }

  function score(scene, raw) {
    var hay = strip(M.normalize(raw));
    var c = scene.criteria;
    return {
      fail: shouting(raw) || hitAny(hay, c.composure.breaks),
      connect: hitAny(hay, c.connect.accept),
      limit: hitAny(hay, c.limit.accept),
      choices: hitAny(hay, c.choices.accept),
      words: raw.trim().split(/\s+/).length
    };
  }

  /* The state machine, as a lookup. Connection before correction is
     enforced here: at the emotional level a limit, even with choices,
     does not move her until she has felt heard. */
  function step(level, h) {
    if (h.fail) return { to: Math.max(0, level - 1), key: 'fail' };
    if (level === 0) return (h.connect || h.words <= 10) ? { to: 1, key: 'calm' } : { to: 0, key: 'still' };
    if (level === 1) {
      if (h.connect) return { to: 2, key: 'connect' };
      if (h.limit) return { to: 1, key: 'limitOnly' };
      return { to: 1, key: 'none' };
    }
    if (h.limit && h.choices) return { to: 3, key: 'both' };
    if (h.limit) return { to: 2, key: 'limitOnly' };
    if (h.choices) return { to: 2, key: 'choicesOnly' };
    return { to: 2, key: 'connectAgain' };
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function build(section) {
    var id = section.getAttribute('data-scene');
    var scene = DATA[id];
    if (!scene) return;

    var play    = section.querySelector('[data-rp-play]');
    var log     = section.querySelector('[data-rp-log]');
    var compose = section.querySelector('[data-rp-compose]');
    var field   = section.querySelector('[data-rp-field]');
    /* The guidance shows on the first turn only; after the parent's first
       line it has been read, and repeating it every turn is noise. */
    var FIRST_PH = field ? field.placeholder : '';
    var say     = section.querySelector('[data-rp-say]');
    var safety  = section.querySelector('[data-rp-safety]');
    var result  = section.querySelector('[data-rp-result]');
    var railEl  = section.querySelector('[data-rp-rail]');
    var body    = section.querySelector('.rp-body');
    var rail    = FX && FX.layers(railEl);
    var railY   = 0;

    var run;

    /* Maya travels down beside the transcript and sits next to her latest
       line, crossfading to the new pose on the way. Same motion as the quiz
       answer slide (850ms, eased, a small proportional overshoot) so the
       module has one vocabulary for "this moved here". Translate only; the
       grid column stays put. The body is given enough height to hold her
       wherever she lands. Reduced motion: she jumps, and CSS has already
       zeroed the fade. */
    function place(instant) {
      if (!railEl || !body) return;
      var kids = log.querySelectorAll('.rp-child');
      var last = kids[kids.length - 1];
      /* Her new bubble is still rising (rp-in starts 8px low), so take its
         current lift out of the measurement or she lands 8px short. */
      var lift = 0;
      if (last && window.DOMMatrix) {
        var tf = getComputedStyle(last).transform;
        if (tf && tf !== 'none') lift = new DOMMatrix(tf).m42;
      }
      var to = last ? Math.max(0, Math.round(last.getBoundingClientRect().top - lift - body.getBoundingClientRect().top)) : 0;
      body.style.minHeight = (to + railEl.offsetHeight) + 'px';
      var from = railY;
      railY = to;
      railEl.style.transform = to ? 'translateY(' + to + 'px)' : '';
      var dy = to - from;
      if (instant || Math.abs(dy) < 4 || !railEl.animate || (FX && FX.reduced())) return;
      var os = to + Math.sign(dy) * Math.min(6, Math.abs(dy) * 0.03);
      railEl.animate([
        { transform: 'translateY(' + from + 'px)', easing: 'cubic-bezier(.55,0,.45,1)' },
        { transform: 'translateY(' + os + 'px)', offset: 0.8, easing: 'cubic-bezier(.3,0,.4,1)' },
        { transform: 'translateY(' + to + 'px)' }
      ], { duration: 850 });
    }

    function reset() {
      run = { level: scene.start, turns: 0, fail: false, connect: false, limit: false,
              choices: false, lines: [] };
      log.innerHTML = '';
      addChild(scene.opening);
      if (rail) rail.to(String(run.level));
      if (field) { field.value = ''; field.placeholder = FIRST_PH; }
      if (say) say.disabled = false;
      compose.hidden = false;
      if (safety) safety.hidden = true;
      result.hidden = true;
      play.hidden = false;
      railY = 0;
      if (railEl) railEl.style.transform = '';
      if (body) body.style.minHeight = '';
    }

    function addChild(text) {
      var b = el('div', 'rp-child rp-in');
      b.appendChild(el('p', 'rp-who rp-who-child', scene.child.toUpperCase()));
      b.appendChild(el('p', 'rp-line', text));
      log.appendChild(b);
      run.lines.push(scene.child + ': ' + text);
    }

    function addParent(text, note) {
      var b = el('div', 'rp-you rp-in');
      b.appendChild(el('p', 'rp-who rp-who-you', 'YOU'));
      b.appendChild(el('p', 'rp-line', text));
      if (note) b.appendChild(el('p', 'rp-note', note));
      log.appendChild(b);
      run.lines.push('You: ' + text);
    }

    function turn() {
      /* Cmd/Ctrl+Enter reaches here without the button, so the typing hold
         has to be checked here too. */
      if (say.disabled) return;
      var raw = (field.value || '').replace(/\s+$/, '');
      if (!raw) { field.focus(); return; }

      if (window.CDAH_SAFETY && safety) {
        var sr = window.CDAH_SAFETY.check(raw, { context: 'roleplay' });
        if (sr) {
          compose.hidden = true;
          window.CDAH_SAFETY.render(safety, sr, function () {
            safety.hidden = true; compose.hidden = false; field.focus();
          });
          return;
        }
      }

      var h = score(scene, raw);
      if (h.fail) run.fail = true;
      if (h.connect) run.connect = true;
      if (h.limit) run.limit = true;
      if (h.choices) run.choices = true;

      var s = step(run.level, h);
      var r = scene.replies[run.level + ':' + s.key] || {};
      run.level = s.to;
      run.turns++;
      H.tap();

      /* Paced like texting: your line goes up, the log scrolls to it, Maya
         is seen typing, then her reply lands and the log scrolls again. The
         wait scales a little with her reply's length. Say it is held while
         she types so a second line cannot overtake her answer; the field
         keeps focus so the phone keyboard stays up. */
      var token = run;
      field.value = '';
      field.placeholder = '';
      say.disabled = true;
      addParent(raw, r.note);
      toBottom();
      var quick = FX && FX.reduced();
      var dots = null;
      setTimeout(function () {
        if (run !== token) return;
        dots = typing();
        toBottom();
      }, quick ? 0 : 350);
      var wait = quick ? 500 : 900 + Math.min(900, (r.child || '').length * 14);
      setTimeout(function () {
        if (run !== token) return;
        if (dots) dots.remove();
        if (r.child) addChild(r.child);
        /* Pose and position change together: one gesture, not two. */
        if (rail) rail.to(String(run.level));
        place();
        toBottom();
        say.disabled = false;
        if (run.level === 3 || run.turns >= scene.maxTurns) finish();
        else field.focus({ preventScroll: true });
      }, wait);
      field.focus({ preventScroll: true });
    }

    function typing() {
      var b = el('div', 'rp-child rp-typing');
      b.setAttribute('aria-label', scene.child + ' is typing');
      b.appendChild(el('p', 'rp-who rp-who-child', scene.child.toUpperCase()));
      var d = el('p', 'rp-dots');
      for (var i = 0; i < 3; i++) d.appendChild(el('i'));
      b.appendChild(d);
      log.appendChild(b);
      return b;
    }

    function toBottom() {
      var stage = document.getElementById('stage');
      if (!stage) return;
      var top = stage.scrollHeight;
      if (stage.scrollTo && !(FX && FX.reduced())) stage.scrollTo({ top: top, behavior: 'smooth' });
      else stage.scrollTop = top;
    }

    function finish() {
      compose.hidden = true;
      var cap = run.fail;
      var missed = (run.connect ? 0 : 1) + (run.limit ? 0 : 1) + (run.choices ? 0 : 1);
      /* Strong needs her to have actually got there. All four hit in the
         wrong order (the limit before she felt heard) leaves her stuck, and
         that is Nearly there, not Strong. */
      var band = cap ? 'notyet'
        : (missed === 0 ? (run.level === 3 ? 'strong' : 'nearly') : missed === 1 ? 'nearly' : 'notyet');
      var copy = cap ? scene.results.composure : scene.results[band];

      S.answer(id, run.lines.join('\n'), band);

      /* Let the last reply land before the result replaces the scene. */
      var token = run;
      setTimeout(function () { if (run === token) paintResult(band, cap, copy); }, FX && FX.reduced() ? 0 : 1400);
    }

    function paintResult(band, cap, copy) {
      result.querySelector('[data-rp-head]').textContent = copy.head || '';
      var pill = result.querySelector('[data-rp-band]');
      pill.textContent = M.BANDS[band];
      pill.setAttribute('data-band', band);

      /* Same rule as the quiz: no body on Nearly there, the rows carry it. */
      var body = result.querySelector('[data-rp-body]');
      body.textContent = copy.body || '';
      body.hidden = !copy.body || band === 'nearly';

      var frame = result.querySelector('[data-rp-frame]');
      frame.innerHTML = copy.frame || '';
      frame.hidden = !copy.frame;

      var rows = result.querySelector('[data-rp-rows]');
      rows.innerHTML = '';
      for (var i = 0; i < ORDER.length; i++) {
        var k = ORDER[i], row = scene.rows[k];
        var passed = k === 'composure' ? !run.fail : run[k];
        var p = el('p', 'qz-row');
        var g = el('span', 'qz-g');
        g.setAttribute('aria-hidden', 'true');
        var t = el('span', 'qz-t');
        var sr = el('span', 'sr');
        if (cap && k !== 'composure') {
          /* Composure failed: the other three are named, greyed, unticked. */
          p.setAttribute('data-passed', 'muted');
          g.textContent = '\u00b7';
          sr.textContent = 'Later. ';
          t.appendChild(sr);
          t.appendChild(document.createTextNode(row.name));
        } else {
          p.setAttribute('data-passed', passed ? 'yes' : 'no');
          g.textContent = passed ? '\u2713' : '\u2014';
          sr.textContent = passed ? 'Covered. ' : 'Not yet. ';
          t.appendChild(sr);
          t.appendChild(document.createTextNode(passed ? row.hit : row.miss));
        }
        p.appendChild(g); p.appendChild(t);
        rows.appendChild(p);
      }

      var coach = result.querySelector('[data-rp-coach]');
      var ct = result.querySelector('[data-rp-coach-t]');
      if (coach && ct) {
        /* Same list as the quiz, same pick-in-order rule. The line is handed
           out on the first Not yet here and kept for this scene. */
        var line = band === 'notyet' ? S.coachLine(id, window.CDAH_COACH_LINES) : '';
        ct.textContent = line;
        coach.hidden = !line;
      }

      play.hidden = true;
      result.hidden = false;
      var stage = document.getElementById('stage');
      if (stage) stage.scrollTop = 0;
      var hd = result.querySelector('[data-rp-head]');
      hd.setAttribute('tabindex', '-1');
      hd.focus({ preventScroll: true });
    }

    say.addEventListener('click', turn);
    field.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); turn(); }
    });
    result.querySelector('[data-rp-again]').addEventListener('click', function () {
      reset(); field.focus();
    });
    document.addEventListener('cdah:restart', reset);

    reset();
  }

  var scenes = document.querySelectorAll('[data-scene]');
  for (var i = 0; i < scenes.length; i++) build(scenes[i]);

  window.CDAH_RP = { _score: score, _step: step };
})();
