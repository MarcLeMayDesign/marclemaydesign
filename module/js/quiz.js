/* The quiz screen: ask, submit, result. One controller, driven entirely by
   content/quiz.js, so items 2–4 need a screen section and nothing else.

   The submit chain, in order:
     safety check → matcher → band → coach feedback → state
   The safety check is package D's (content/safety.js, not written yet) and
   the hook below is the single place it goes in. It is written as an
   early return on purpose: when it fires, nothing downstream runs, nothing
   is scored, and nothing is saved.

   Two screens' worth of content in one section, swapped: the ask pane and
   the result pane. It is one place in the module, not two — the parent's
   answer is still there behind the result, "Back to the question" returns to
   it unedited, and the router never has to know about a result URL. */

(function () {
  'use strict';

  var S = window.CDAH_STATE;
  var M = window.CDAH_MATCH;
  var H = window.CDAH_HAPTICS;
  var DATA = window.CDAH_QUIZ;
  if (!DATA || !M) return;

  var sections = document.querySelectorAll('[data-quiz]');

  function build(section) {
    var id = section.getAttribute('data-quiz');
    var item = DATA[id];
    if (!item) return;

    var ask    = section.querySelector('[data-qz-ask]');
    var result = section.querySelector('[data-qz-result]');
    var field  = section.querySelector('[data-qz-field]');
    var submit = section.querySelector('[data-qz-submit]');
    var skip   = section.querySelector('[data-qz-skip]');
    var safety = section.querySelector('[data-qz-safety]');

    /* Content into the ask pane. The prompt and question live here rather
       than in the HTML because the other three items arrive as data. */
    fill(section, '[data-qz-setup]', item.setup);
    fill(section, '[data-qz-ask-q]', item.ask);
    fill(section, '[data-qz-say-lead]', item.say && item.say.lead);
    fill(section, '[data-qz-say-line]', item.say && item.say.line);

    var saved = (S.get().answers || {})[id];
    if (field && typeof saved === 'string') field.value = saved;

    function showAsk(focus) {
      result.hidden = true;
      if (safety) safety.hidden = true;
      ask.hidden = false;
      if (focus && field) field.focus();
    }

    function showResult() {
      ask.hidden = true;
      result.hidden = false;
      var h = result.querySelector('[data-qz-head]');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    }

    function paint(res, text) {
      var pill = result.querySelector('[data-qz-band]');
      var head = result.querySelector('[data-qz-head]');
      var wrote = result.querySelector('[data-qz-wrote]');
      var rows = result.querySelector('[data-qz-rows]');
      var coach = result.querySelector('[data-qz-coach]');

      if (head) head.textContent = (res.coach && res.coach.head) || '';
      if (pill) {
        pill.textContent = M.BANDS[res.band];
        pill.setAttribute('data-band', res.band);
      }
      if (wrote) wrote.textContent = text;

      /* One row per criterion, in the item's order — never reordered to put
         the passes first. The parent wrote one answer; the rows are a reading
         of it, not a ranked list. The glyph carries the verdict and the line
         stays ink, so a missed row does not shout. */
      if (rows) {
        rows.innerHTML = '';
        for (var i = 0; i < res.criteria.length; i++) {
          var c = res.criteria[i];
          var row = document.createElement('p');
          row.className = 'qz-row';
          row.setAttribute('data-passed', c.passed ? 'yes' : 'no');
          var g = document.createElement('span');
          g.className = 'qz-g';
          g.setAttribute('aria-hidden', 'true');
          g.textContent = c.passed ? '\u2713' : '\u2014';
          var t = document.createElement('span');
          t.className = 'qz-t';
          /* The verdict word is for screen readers only — the glyph is
             decorative and "dash" is not a verdict. It must not render
             visibly: a printed "Not in your answer." weights the misses
             over the hits in words, on the one screen that has to do both
             evenly, and it doubles the negation in the line that follows. */
          var sr = document.createElement('span');
          sr.className = 'sr';
          sr.textContent = c.passed ? 'Covered. ' : 'Not in your answer. ';
          t.appendChild(sr);
          t.appendChild(document.createTextNode(c.line));
          row.appendChild(g);
          row.appendChild(t);
          rows.appendChild(row);
        }
      }

      /* The body is suppressed on Nearly there. By then the screen has said
         the verdict three times — the headline, the band, and the rows, one
         of which names exactly what was missing — and the body restated it a
         fourth time. Kept on Strong (the one moment of real praise) and on
         Not yet (where the rows alone do not teach).
         TO REVERT: drop the `&& res.band !== 'nearly'` below. */
      var sayK = result.querySelector('[data-qz-say-k]');
      if (sayK) {
        sayK.textContent = res.band === 'strong'
          ? 'One further suggestion'
          : 'One thing you could say';
      }

      if (coach) {
        var showBody = !!(res.coach && res.coach.body) && res.band !== 'nearly';
        coach.textContent = showBody ? res.coach.body : '';
        coach.hidden = !showBody;
      }

      /* The reminder that a principle does not land every time appears on
         Not yet only. On Strong it would take the compliment back, and on
         Nearly there it is the fourth thing in a row telling a parent how to
         feel about one answer — the band already says they were close.
         Fixed copy per item, so returning to a question does not produce a
         different sentence. */
      var prac = result.querySelector('[data-qz-practice]');
      var pracT = result.querySelector('[data-qz-practice-t]');
      /* Only asked for on Not yet, so a line is handed out on a real miss
         and not spent on a Strong the parent never sees it on. */
      var line = res.band === 'notyet'
        ? (S.coachLine(id, window.CDAH_COACH_LINES) || item.practice || '') : '';
      if (prac && pracT) {
        pracT.textContent = line;
        prac.hidden = !line || res.band !== 'notyet';
      }

      var claim = result.querySelector('[data-qz-claim]');
      var claimed = (S.get().claims || {})[id];
      if (claim) claim.hidden = res.band === 'strong' || !!claimed;
      var note = result.querySelector('[data-qz-claimed]');
      if (note) note.hidden = !claimed;
    }

    function run() {
      if (!field) return;
      var text = field.value.replace(/\s+$/, '');
      if (!text) { field.focus(); return; }

      /* Safety first. When it fires nothing below runs: no band, no
         attempt, nothing saved. Their words stay in the field. */
      if (window.CDAH_SAFETY && safety) {
        var sr = window.CDAH_SAFETY.check(text, { context: 'quiz' });
        if (sr) {
          ask.hidden = true;
          result.hidden = true;
          window.CDAH_SAFETY.render(safety, sr, function () { showAsk(true); });
          return;
        }
      }

      /* Where the field is now, measured before the panes swap. */
      var from = field.getBoundingClientRect();
      var res = M.score(item, text);
      H.tap();
      /* Best stands — state.answer only raises a band, never lowers it, so a
         retake can never cost a parent the reading they already earned. */
      S.answer(id, text, res.band);
      paint(res, text);
      showResult();
      moveAnswer(from);
    }

    /* Proximity by motion. The answer box starts exactly where the field was
       and slides up to its place, so the parent sees their own words travel
       rather than having to find them again. Translate only: the two boxes
       share size and type, so nothing reflows on the way. Everything else on
       the result screen fades in behind it. Reduced motion: no move. */
    function moveAnswer(from) {
      var stage = document.getElementById('stage');
      if (stage) stage.scrollTop = 0;
      var wrote = result.querySelector('[data-qz-wrote]');
      if (!wrote || !window.CDAH_FX || window.CDAH_FX.reduced()) return;
      var to = wrote.getBoundingClientRect();
      var dy = from.top - to.top;
      if (Math.abs(dy) < 4) return;
      var others = [];
      for (var k = 0; k < result.children.length; k++) {
        var ch = result.children[k];
        if (!ch.contains(wrote) && !ch.hidden) others.push(ch);
      }
      wrote.style.transition = 'none';
      wrote.style.transform = 'translateY(' + dy + 'px)';
      wrote.style.position = 'relative';
      wrote.style.zIndex = '2';
      for (var m = 0; m < others.length; m++) {
        others[m].style.transition = 'none';
        others[m].style.opacity = '0';
      }
      void wrote.offsetHeight;
      /* Leaves slowly, gathers speed, eases off just before landing, runs a
         few pixels past its place and settles back. The overshoot is small
         and proportional (at most 6px) so it reads as weight rather than
         a bounce toy. */
      var os = -Math.sign(dy) * Math.min(6, Math.abs(dy) * 0.03);
      wrote.style.transition = 'none';
      wrote.style.transform = '';
      if (wrote.animate) {
        wrote.animate([
          { transform: 'translateY(' + dy + 'px)', easing: 'cubic-bezier(.55,0,.45,1)' },
          { transform: 'translateY(' + os + 'px)', offset: 0.8, easing: 'cubic-bezier(.3,0,.4,1)' },
          { transform: 'translateY(0)' }
        ], { duration: 850 });
      }
      for (var p = 0; p < others.length; p++) {
        others[p].style.transition = 'opacity 340ms ease 460ms';
        others[p].style.opacity = '1';
      }
      setTimeout(function () {
        wrote.style.transition = wrote.style.transform = wrote.style.zIndex = '';
        for (var q = 0; q < others.length; q++) others[q].style.transition = others[q].style.opacity = '';
      }, 1150);
    }

    if (submit) submit.addEventListener('click', run);

    /* Cmd/Ctrl+Enter submits. A bare Enter must not: this is a multi-line
       field and a parent writing two sentences will press it. */
    if (field) {
      field.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); run(); }
      });
    }

    if (skip) {
      skip.addEventListener('click', function () {
        var next = document.getElementById('navNext');
        if (next) next.click();
      });
    }

    var again = result && result.querySelector('[data-qz-again]');
    if (again) again.addEventListener('click', function () { showAsk(true); });

    /* "I think my answer covered this" — the only protection against a right
       answer no phrase list anticipated, and it is not a negotiation: the
       parent says it covered the point and the module takes their word,
       raising the item to Strong. Nobody is grading them, so there is
       nothing to defend. The claim is kept in state so package E's sessions
       can see which items it lands on — the phrase lists get fixed there,
       not here. */
    var claimBtn = result && result.querySelector('[data-qz-claim]');
    if (claimBtn) {
      claimBtn.addEventListener('click', function () {
        var st = S.get();
        var claims = st.claims || {};
        claims[id] = true;
        S.set({ claims: claims });
        S.answer(id, (S.get().answers || {})[id] || '', 'strong');
        H.tap();
        claimBtn.hidden = true;
        var note = result.querySelector('[data-qz-claimed]');
        if (note) note.hidden = false;
        var pill = result.querySelector('[data-qz-band]');
        if (pill) { pill.textContent = M.BANDS.strong; pill.setAttribute('data-band', 'strong'); }
      });
    }

    /* Start again wipes the fields as well as the state. Without this the
       parent is handed their previous answer to delete before they can
       write — the exact thing a fresh start is for. */
    document.addEventListener('cdah:restart', function () {
      if (field) field.value = '';
      showAsk(false);
    });

    /* Returning to the item later shows the ask pane with their answer in
       it, not the old result. The band is already saved; what a parent
       coming back wants is the question and their words, and re-reading a
       verdict they have already read is not useful. */
    showAsk(false);
  }

  function fill(root, sel, html) {
    var el = root.querySelector(sel);
    if (el && html) el.innerHTML = html;
  }

  for (var i = 0; i < sections.length; i++) build(sections[i]);
})();
