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

  /* Where in the line the first phrase from a list starts, or -1. */
  function hitAt(hay, list) {
    var best = -1;
    for (var i = 0; i < list.length; i++) {
      var p = M.prep(list[i]).trim();
      var at = p ? hay.indexOf(' ' + p + ' ') : -1;
      if (at !== -1 && (best === -1 || at < best)) best = at;
    }
    return best;
  }

  function hitAny(hay, list) {
    for (var i = 0; i < list.length; i++) {
      var p = M.prep(list[i]).trim();
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
    var hay = M.stem(strip(M.normalize(raw)));
    var c = scene.criteria;
    var at = { connect: hitAt(hay, c.connect.accept), limit: hitAt(hay, c.limit.accept), choices: hitAt(hay, c.choices.accept) };
    return {
      fail: shouting(raw) || hitAny(hay, c.composure.breaks),
      connect: at.connect !== -1,
      limit: at.limit !== -1,
      choices: at.choices !== -1,
      at: at,
      words: raw.trim().split(/\s+/).length
    };
  }

  /* The state machine, as a lookup. Connection before correction is
     enforced here: at the emotional level a limit, even with choices,
     does not move her until she has felt heard. */
  function step(level, h, run, scene) {
    if (h.fail) return { to: Math.max(0, level - 1), key: 'fail' };
    if (level === 0) return (h.connect || h.words <= 10) ? { to: 1, key: 'calm' } : { to: 0, key: 'still' };
    if (level === 1) {
      /* Draft 2 pass 2 (Marc, SCN-302): one line that names the feeling and
         THEN gives the limit and the choices is the order Learn teaches, said
         in one breath. The feeling comes first in the line, so she has heard
         it before the rest arrives: it counts, and she can stop. A limit
         said before the feeling still has to wait (except a safety limit). */
      if (h.connect && h.choices && h.at.choices > h.at.connect &&
          ((h.limit && (h.at.limit > h.at.connect || scene.limitAnytime)) || run.limit))
        return { to: 3, key: 'both', reply: '2:both', inOrder: true };
      /* Oct 5 (Marc): the feeling first, then the limit or the choices, in
         the same line, is the right order too, even without the third move.
         She moves to ready, the move counts, and the Coach says so. */
      if (h.connect && ((h.limit && h.at.limit > h.at.connect) || (h.choices && h.at.choices > h.at.connect)))
        return { to: 2, key: 'connect', orderOk: true };
      if (h.connect) return { to: 2, key: 'connect' };
      if (h.limit) return { to: 1, key: 'limitOnly' };
      return { to: 1, key: 'none' };
    }
    /* At ready, the limit and the choices can arrive in separate lines:
       what she heard on an earlier turn at this level still holds. */
    if ((h.limit || run.limit) && (h.choices || run.choices)) return { to: 3, key: 'both' };
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
    var pose    = FX && FX.layers(result.querySelector('[data-rp-pose]'));
    var railY   = 0;
    /* Desktop: the result's Coach is as tall as his feedback, so his width
       follows the text's height (2:3). CSS can't size a flex item's width
       from its stretched height, so it is set here and on resize. */
    var poseEl = result.querySelector('[data-rp-pose]');
    var fbTxt  = result.querySelector('.rp-fb-txt');
    function sizePose() {
      if (!poseEl || !fbTxt || result.hidden) return;
      if (window.matchMedia('(max-width:600px)').matches) { poseEl.style.width = ''; return; }
      var hgt = Math.max(180, Math.min(504, fbTxt.offsetHeight));
      poseEl.style.width = Math.round(hgt * 2 / 3) + 'px';
    }
    if (window.ResizeObserver && fbTxt) new ResizeObserver(sizePose).observe(fbTxt);
    window.addEventListener('resize', sizePose);

    var backBtn = section.querySelector('[data-rp-back]');
    var resetBtn = section.querySelector('[data-rp-reset]');
    /* Her face at each level, for the phone's chat layout: every bubble
       keeps the face she had when she said it. */
    var FACES = ['overwhelmed', 'upset', 'ready', 'contented'];

    var run;
    var busy = false;   // Maya is typing
    var prov = null;    // the Words to try card being previewed, or null
    var draft = '';     // what the parent had typed before a preview
    var provLbl = section.querySelector('[data-wt-prov]');
    /* The label takes Back/Start over's place in the button row while a
       preview is up. Above the field it grew the sticky compose bar, which
       pushed the cards up mid double-tap so the second tap missed. */
    var sideEl  = section.querySelector('.rp-side');
    function showLbl(on) { if (provLbl) provLbl.hidden = !on; if (sideEl) sideEl.hidden = on; }
    /* Touch-first devices keep with a double-tap. Mouse-first ones keep with
       Enter (Return on a Mac): double-click was unreliable on a draggable
       card and gave no feedback between the two clicks. */
    var fine = !!(window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches);
    /* The label names one way to keep: the gesture. Use it is a visible
       button and says so itself; Enter is what a keyboard user already
       tries on a focused card, so it works without being taught. The word
       follows the layout as well as the pointer, so a phone-width frame on
       a desktop (the Flow board) says what a phone says. */
    var dblWord = section.querySelector('[data-wt-dbl]');
    function setDblWord() {
      if (!dblWord) return;
      var phone = matchMedia('(max-width:600px)').matches;
      /* At phone width the "Preview ·" lead-in is hidden, so the word leads. */
      dblWord.textContent = phone ? 'Double-tap' : fine ? 'double-click' : 'double-tap';
    }
    setDblWord();
    if (window.matchMedia) { var mq = matchMedia('(max-width:600px)'); if (mq.addEventListener) mq.addEventListener('change', setDblWord); }
    /* A textarea can only style all of its text at once, so the preview is
       drawn by a mirror layer: the parent's own words upright, only the
       previewed phrase in italic. The real text goes transparent underneath
       (caret stays), and the mirror goes away the moment the preview ends. */
    var ghost = null;
    if (field) {
      var wrap = document.createElement('div');
      wrap.className = 'qz-fieldwrap';
      field.parentNode.insertBefore(wrap, field);
      wrap.appendChild(field);
      ghost = document.createElement('div');
      ghost.className = 'qz-field qz-ghost';
      ghost.setAttribute('aria-hidden', 'true');
      ghost.hidden = true;
      wrap.appendChild(ghost);
      field.addEventListener('scroll', function () { ghost.scrollTop = field.scrollTop; });
    }
    function drawGhost(base, add) {
      if (!ghost) return;
      var full = join(base, add);
      var head = full.slice(0, full.length - add.length);
      ghost.textContent = '';
      ghost.appendChild(document.createTextNode(head));
      var em = document.createElement('em');
      em.textContent = add;
      ghost.appendChild(em);
      ghost.appendChild(document.createTextNode('\u200b'));
      ghost.hidden = false;
      ghost.scrollTop = field.scrollTop;
    }
    function hideGhost() { if (ghost) { ghost.hidden = true; ghost.textContent = ''; } }

    /* ---- Words to try --------------------------------------------------
       Collapsed at the start of every conversation so the parent tries in
       their own words first, and it never opens itself. (It used to remember
       being opened, per device; a returning tester then met it open.)
       Tap a card: the phrase previews in the field on the tinted band, and
       Say it waits. Use it (or typing into it) makes it theirs to edit and
       send. Tap another card to swap, the same card to put their own text
       back. Cards can also be dragged into the field; nothing depends on it. */
    var strip  = section.querySelector('[data-wt]');
    var pill   = section.querySelector('[data-wt-toggle]');
    var cards  = section.querySelector('[data-wt-cards]');
    var useBtn = section.querySelector('[data-wt-use]');
    var words  = scene.words || [];
    var cardEls = [];
    var lastTap = 0, lastCard = -1;

    function syncSay() { if (say) say.disabled = busy || prov !== null; }

    /* The compose area is pinned to the bottom on a phone, so when it grows
       (the strip opens, a preview lengthens the field) it grows up over her
       latest line. These changes come from a parent working in the compose
       area, not rereading, so the stage is anchored to the bottom every time
       and instantly (a smooth scroll still running from her reply would
       otherwise lose the race). */
    function keepBottom(change) {
      change();
      var stage = document.getElementById('stage');
      if (stage) stage.scrollTop = stage.scrollHeight;
    }

    function stripOpen() { return !!(pill && pill.getAttribute('aria-expanded') === 'true'); }

    function setStrip(open, remember) {
      if (!pill) return;
      pill.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (!open) clearPreview(true);
      slide(open);
    }

    /* The cards open and close like a drawer: height and fade together,
       300ms open, 240ms close. Reduce Motion gets the plain show/hide. */
    var drawer = null;
    function slide(open) {
      if (drawer) { drawer.cancel(); drawer = null; }
      var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (still || !cards.animate) { cards.hidden = !open; return; }
      var wasHidden = cards.hidden;
      cards.hidden = false;
      var h = cards.scrollHeight;
      var shut = { height: '0px', marginTop: '-10px', opacity: 0 };
      var full = { height: h + 'px', marginTop: '0px', opacity: 1 };
      if (open && !wasHidden) return;
      if (!open && wasHidden) { cards.hidden = true; return; }
      cards.style.overflowY = 'hidden';
      drawer = cards.animate(open ? [shut, full] : [full, shut],
        { duration: open ? 300 : 240, easing: open ? 'cubic-bezier(.2,.7,.2,1)' : 'cubic-bezier(.4,0,.8,.4)' });
      drawer.onfinish = function () {
        drawer = null;
        cards.style.overflowY = '';
        if (!open) cards.hidden = true;
      };
    }

    /* Cards build on what is already in the field: a phrase goes after it,
       never over it, with the joining punctuation a sentence needs. The
       parent can reorder by hand; appending is the predictable default. */
    function join(base, add) {
      var t = (base || '').replace(/\s+$/, '');
      if (!t) return add;
      return t + (/[.!?\u2026,;:\u201D"')]$/.test(t) ? ' ' : '. ') + add;
    }

    function preview(i) {
      if (prov === null) draft = field.value;
      prov = i;
      field.value = join(draft, words[i].say);
      field.setAttribute('data-prov', '');
      drawGhost(draft, words[i].say);
      if (provLbl) { showLbl(true); field.setAttribute('aria-describedby', provLbl.id); }
      for (var k = 0; k < cardEls.length; k++) cardEls[k].setAttribute('aria-pressed', k === i ? 'true' : 'false');
      if (useBtn) useBtn.hidden = false;
      syncSay();
    }

    function clearPreview(restore) {
      if (prov === null) return;
      prov = null;
      if (restore) field.value = draft;
      field.removeAttribute('data-prov');
      hideGhost();
      if (provLbl) { showLbl(false); field.removeAttribute('aria-describedby'); }
      for (var k = 0; k < cardEls.length; k++) cardEls[k].setAttribute('aria-pressed', 'false');
      if (useBtn) useBtn.hidden = true;
      syncSay();
    }

    function commit() {
      clearPreview(false);
      /* On a phone the keyboard stays down: the parent keeps reading with the
         cards open, and taps the field when they want to type. */
      if (fine) {
        field.focus();
        var n = field.value.length;
        try { field.setSelectionRange(n, n); } catch (e) {}
      }
    }

    if (strip && words.length) {
      section.querySelector('[data-wt-count]').textContent = words.length;
      words.forEach(function (w, i) {
        var c = el('button', 'wt-card');
        c.type = 'button';
        c.setAttribute('aria-pressed', 'false');
        c.draggable = true;
        c.appendChild(el('span', 'wt-what', w.what));
        /* Said words carry quotation marks on the card, the module's rule
           for speech; the phrase goes into the field without them. */
        c.appendChild(el('span', 'wt-say', '\u201C' + w.say + '\u201D'));
        /* Touch: a quick second tap on the same card keeps it, same as Use
           it; a slow one takes the preview back off. Same for a mouse
           double-click. Space (a click with detail 0) is one tap that
           previews and never takes it back off; Enter is handled below. */
        c.addEventListener('click', function (e) {
          if (busy) return;
          if (e.detail === 0) { if (prov !== i) keepBottom(function () { preview(i); }); return; }
          var now = Date.now();
          keepBottom(function () {
            /* Two quick taps on the same card keep it, whatever state it
               was in: the first tap on a previewed card clears it, the
               second puts it back and keeps it. */
            if (lastCard === i && now - lastTap < 500) { lastTap = 0; if (prov !== i) preview(i); commit(); return; }
            lastTap = now; lastCard = i;
            if (prov === i) clearPreview(true); else preview(i);
          });
        });
        c.addEventListener('dragstart', function (e) {
          clearPreview(true);
          e.dataTransfer.setData('text/plain', w.say);
        });
        cards.appendChild(c);
        cardEls.push(c);
      });
      /* Oct 5 (Marc, VoiceOver): each card says how to use it. NEW copy. */
      var hint = el('p', 'sr-only', fine ? 'Press Return to preview it in your reply, and Return again to use it.' : 'Double-tap to preview it in your reply, then choose Use it.');
      hint.id = id + '-wt-hint';
      strip.appendChild(hint);
      for (var ce = 0; ce < cardEls.length; ce++) cardEls[ce].setAttribute('aria-describedby', hint.id);
      pill.addEventListener('click', function () { keepBottom(function () { setStrip(!stripOpen(), true); }); });
      if (useBtn) useBtn.addEventListener('click', function () { keepBottom(commit); });
      /* Enter keeps a preview from anywhere in the scene: on a card, in the
         field, or with focus nowhere in particular. On a card not yet
         previewed it previews first. Other buttons keep their own Enter. */
      /* On the document, not the section: Safari doesn't focus a clicked
         button, so after a mouse click focus is on the page body. */
      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' || e.shiftKey || e.metaKey || e.ctrlKey || e.altKey || e.isComposing || busy) return;
        if (!section.getClientRects().length) return;
        var t = e.target;
        if (t !== document.body && !section.contains(t)) return;
        var card = t.closest && t.closest('.wt-card');
        if (card) {
          e.preventDefault();
          var ci = cardEls.indexOf(card);
          keepBottom(function () { if (prov === ci) commit(); else preview(ci); });
          return;
        }
        if (prov === null) return;
        if (t.closest && t.closest('button,a,summary,select,input') && t !== field) return;
        e.preventDefault();
        keepBottom(commit);
      });
      field.addEventListener('input', function () { if (prov !== null) clearPreview(false); });
      /* A dropped card lands after the text, not wherever the pointer
         happens to be, same as a tapped one. */
      field.addEventListener('dragover', function (e) { if (!busy) e.preventDefault(); });
      field.addEventListener('drop', function (e) {
        var text = e.dataTransfer && e.dataTransfer.getData('text/plain');
        if (!text || busy) return;
        e.preventDefault();
        if (prov !== null) clearPreview(true);
        field.value = join(field.value, text);
        commit();
      });
      setStrip(false, false);
      strip.hidden = true;
    } else if (strip) {
      strip.hidden = true;
    }

    /* Maya travels down beside the transcript and sits next to her latest
       line, crossfading to the new pose on the way. Same motion as the quiz
       answer slide (850ms, eased, a small proportional overshoot) so the
       module has one vocabulary for "this moved here". Translate only; the
       grid column stays put. The body is given enough height to hold her
       wherever she lands. Reduced motion: she jumps, and CSS has already
       zeroed the fade. */
    function place(instant) {
      if (!railEl || !body) return;
      /* Phone chat layout: no rail, her face rides on each bubble instead. */
      if (!railEl.offsetWidth) { body.style.minHeight = ''; railY = 0; railEl.style.transform = ''; return; }
      var kids = log.querySelectorAll('.rp-child');
      var last = kids[kids.length - 1];
      /* Measured in layout offsets, which ignore the rp-in rise (a
         transform), so there is no animation timing to correct for.
         Seat her so her mouth meets the tail's tip (3px above the bubble's
         foot), not her head at the bubble's top: a one-line reply and a
         three-line one both point at the mouth. Measured on the 168x252
         rail from pose-ready.png. */
      var MOUTH = Math.round(85 * (railEl.offsetHeight || 252) / 252), TIP = 3;
      /* .rp-body is position:relative, so it is the bubble's offsetParent. */
      var foot = last ? last.offsetTop + last.offsetHeight : 0;
      var to = last ? Math.max(0, Math.round(foot - TIP - MOUTH)) : 0;
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
              choices: false, lines: [], used: [] };
      log.innerHTML = '';
      addChild(scene.opening, run.level);
      if (rail) rail.to(String(run.level));
      if (field) { field.value = ''; field.placeholder = FIRST_PH; }
      busy = false;
      /* Words to try waits until she has answered once: the first line is
         the parent's own. */
      if (strip) { strip.hidden = true; setStrip(false, false); }
      if (resetBtn) resetBtn.hidden = true;
      prov = null; draft = '';
      if (field) { field.removeAttribute('data-prov'); field.removeAttribute('aria-describedby'); }
      showLbl(false);
      hideGhost();
      for (var k = 0; k < cardEls.length; k++) cardEls[k].setAttribute('aria-pressed', 'false');
      if (useBtn) useBtn.hidden = true;
      syncSay();
      hold(false);
      compose.hidden = false;
      if (safety) safety.hidden = true;
      result.hidden = true;
      play.hidden = false;
      railY = 0;
      if (railEl) railEl.style.transform = '';
      if (body) body.style.minHeight = '';
    }

    function face(lv) {
      var f = el('img', 'rp-face');
      f.src = 'assets/img/face-' + FACES[Math.max(0, Math.min(3, lv))] + '.png';
      f.alt = ''; f.width = 34; f.height = 34;
      return f;
    }

    /* Only her newest bubble carries the tail on desktop: it is the one
       beside her, so it points at her mouth. */
    function latest(b) {
      var old = log.querySelectorAll('.rp-child.is-latest');
      for (var i = 0; i < old.length; i++) old[i].classList.remove('is-latest');
      b.classList.add('is-latest');
    }

    function addChild(text, lv) {
      var b = el('div', 'rp-child rp-in');
      b.appendChild(face(lv));
      var bub = el('div', 'rp-bub');
      bub.appendChild(el('p', 'rp-who rp-who-child', scene.child.toUpperCase()));
      bub.appendChild(el('p', 'rp-line', text));
      b.appendChild(bub);
      log.appendChild(b);
      latest(b);
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
      if (busy || prov !== null) return;
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
      /* Gibberish: nothing hit, composure intact, no English in it. She
         doesn't answer and no turn is used. */
      var MM = window.CDAH_MATCH;
      if (MM && MM.nonsense && !h.fail && !h.connect && !h.limit && !h.choices && MM.nonsense(raw)) {
        MM.huh(field, ((window.CDAH_STRINGS || {}).huh || {}).roleplay);
        return;
      }
      if (MM && MM.huh) MM.huh(field, '');
      /* Words to try phrases sent exactly as the card gave them. Any edit
         inside a phrase breaks the match, and that is the rule: an edited
         phrase is the parent's own words. Counted as phrases, not lines, so
         two cards stacked in one line count twice. */
      for (var wi = 0; wi < words.length; wi++) {
        var at = raw.indexOf(words[wi].say);
        while (at !== -1) { run.used.push(wi); at = raw.indexOf(words[wi].say, at + 1); }
      }
      /* A limit or choices said before she has felt heard don't land, so
         they don't count yet: that row reads "said too early" rather than a
         tick. This keeps the rows and the band telling the same story. */
      var s = step(run.level, h, run, scene);
      var ready = run.level >= 2 || !!s.inOrder;
      function inLine(k) { return run.level >= 1 && h.connect && h[k] && h.at[k] > h.at.connect; }
      if (h.fail) run.fail = true;
      else {
        if (h.connect) run.connect = true;
        /* A safety limit doesn't wait (scene.limitAnytime, SCN-302): said at
           any point, it counts. */
        if (h.limit) { if (ready || inLine('limit') || scene.limitAnytime) run.limit = true; else run.limitEarly = true; }
        if (h.choices) { if (ready || inLine('choices')) run.choices = true; else run.choicesEarly = true; }
      }
      var rk = s.reply || (run.level + ':' + s.key);
      /* A missing reply must never stall the scene (Oct 2: '0:fail' was missing
         in all three, so a second sharp line got no answer). */
      var r = scene.replies[rk] || scene.replies[s.to + ':still'] || scene.replies[s.to + ':none'] || scene.replies[s.to + ':connectAgain'] || {};
      /* The same state twice in a row would repeat her line word for word,
         which reads as a glitch. The second time she uses the 'again' line. */
      var line = (rk === run.lastKey && r.again) ? r.again : r.child;
      run.lastKey = rk;
      /* A miss, with the strip closed: the coach offers the phrases in words,
         once per scene, instead of springing the panel open. */
      var note = r.note;
      if (s.orderOk) note = (note ? note + ' ' : '') + ((window.CDAH_STRINGS || {}).orderOk || 'Good order: the feeling came first, so she could hear what came after it.');  // NEW
      var good = s.key === 'connect' || s.key === 'both' || s.key === 'calm';
      if (!good && words.length && !stripOpen() && !run.offered) {
        run.offered = true;
        note = (note ? note + ' ' : '') + 'There are ' + ['', 'one phrasing', 'two phrasings', 'three phrasings', 'four phrasings'][Math.min(words.length, 4)] +
          ' under Words to try, if you want ' + (words.length === 1 ? 'it' : 'them') + '.';
      }
      var fromLevel = run.level;
      run.level = s.to;
      run.turns++;
      if (resetBtn) resetBtn.hidden = false;
      H.tap();

      /* Paced like texting: your line goes up, the log scrolls to it, Maya
         is seen typing, then her reply lands and the log scrolls again. The
         wait scales a little with her reply's length. Say it is held while
         she types so a second line cannot overtake her answer; the field
         keeps focus so the phone keyboard stays up. */
      var token = run;
      field.value = '';
      field.placeholder = '';
      busy = true; syncSay();
      addParent(raw, note);
      toBottom();
      var dots = null;
      setTimeout(function () {
        if (run !== token) return;
        dots = typing(fromLevel);
        toBottom();
      }, 350);
      /* Timing is not motion: Reduce Motion keeps the same pace, it only
         drops the slides and smooth scrolls. */
      var wait = 900 + Math.min(900, (line || '').length * 14);
      setTimeout(function () {
        if (run !== token) return;
        /* Oct 2 (Marc: "jumpy"): her reply grows out of the typing bubble
           rather than replacing it, so the log moves once, not twice. */
        if (line && dots) land(dots, line, run.level);
        else { if (dots) dots.remove(); if (line) addChild(line, run.level); }
        if (run.turns === scene.maxTurns - 1 && scene.lastPrompt) field.placeholder = scene.lastPrompt;
        /* Pose and position change together: one gesture, not two. */
        if (rail) rail.to(String(run.level));
        /* Draft 2 (Marc, after the shake was dropped): on a drop, the new
           pose sinks into place as it fades in, so the drop reads in her
           body rather than in the screen. 8px, heavy ease-in; desktop rail
           only (the phone shows her face in the bubble). */
        if (run.level < fromLevel && railEl && railEl.offsetParent && !(FX && FX.reduced())) {
          var sunk = railEl.querySelector('[data-xfade="' + run.level + '"]');
          if (sunk && sunk.animate && window.CSS && CSS.supports('translate', '0 1px'))
            sunk.animate([{ translate: '0 -8px' }, { translate: '0 0' }], { duration: 420, easing: 'cubic-bezier(.5,0,.75,0)' });
        }
        place();
        toBottom();
        busy = false; syncSay();
        var stripNew = false;
        if (strip && words.length && run.level < 3) {
          var wasHid = strip.hidden;
          stripNew = wasHid;
          strip.hidden = false;
          if (wasHid && strip.animate && !(FX && FX.reduced())) strip.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: 'ease-out' });
          toBottom();
        }
        var ending = run.level === 3 || run.turns >= scene.maxTurns;
        /* Oct 5 (Marc, VoiceOver on the Mac): the log isn't a live region any
           more. One message says the turn in order: your line, the Coach's
           note, her reply, then what's next. */
        if (window.CDAH_SAY) {
          var msg = 'You said: ' + raw + ' ' + (note ? 'Coach: ' + note + ' ' : '') + (line ? scene.child + ': ' + line : '');
          if (!ending) {
            if (stripNew) msg += ' Words to try is now open to you, after the text box.';  // NEW
            msg += ' ' + ((run.turns === scene.maxTurns - 1 && scene.lastPrompt) ? scene.lastPrompt : 'Your turn.');  // NEW
          }
          window.CDAH_SAY(msg);
        }
        if (ending) finish();
        else if (fine) field.focus({ preventScroll: true });
      }, wait);
      /* Say it on a phone drops the keyboard, and it stays down through
         Maya's reply: the conversation gets the screen back to read. */
      if (fine) field.focus({ preventScroll: true }); else field.blur();
    }

    function typing(lv) {
      var b = el('div', 'rp-child rp-typing');
      b.setAttribute('aria-label', scene.child + ' is typing');
      b.appendChild(face(lv));
      var bub = el('div', 'rp-bub');
      bub.appendChild(el('p', 'rp-who rp-who-child', scene.child.toUpperCase()));
      var d = el('p', 'rp-dots');
      for (var i = 0; i < 3; i++) d.appendChild(el('i'));
      bub.appendChild(d);
      b.appendChild(bub);
      log.appendChild(b);
      latest(b);
      return b;
    }

    function land(b, text, lv) {
      var bub = b.querySelector('.rp-bub'), d = b.querySelector('.rp-dots');
      var w0 = bub.offsetWidth, h0 = bub.offsetHeight;
      var p = el('p', 'rp-line', text);
      d.parentNode.replaceChild(p, d);
      var f = b.querySelector('.rp-face'); if (f) f.src = face(lv).src;
      b.classList.remove('rp-typing'); b.removeAttribute('aria-label');
      latest(b);
      run.lines.push(scene.child + ': ' + text);
      if (FX && FX.reduced() || !bub.animate) return;
      var w1 = bub.offsetWidth, h1 = bub.offsetHeight;
      bub.animate([{ width: w0 + 'px', height: h0 + 'px' }, { width: w1 + 'px', height: h1 + 'px' }], { duration: 300, easing: 'cubic-bezier(.2,.7,.3,1)' });
      p.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 280, delay: 120, easing: 'ease-out', fill: 'backwards' });
    }

    /* One eased scroll that follows the bottom as it grows, instead of the
       browser's smooth scroll, which restarts on every call and stacks. A
       touch or wheel hands control straight back. */
    var scrolling = null;
    function toBottom() {
      var stage = document.getElementById('stage');
      if (!stage) return;
      if ((FX && FX.reduced()) || !window.requestAnimationFrame) { stage.scrollTop = stage.scrollHeight; return; }
      if (scrolling) { scrolling.from = stage.scrollTop; scrolling.t0 = performance.now(); return; }
      var s = scrolling = { from: stage.scrollTop, t0: performance.now(), stop: false };
      function stop() { s.stop = true; }
      stage.addEventListener('touchstart', stop, { passive: true, once: true });
      stage.addEventListener('wheel', stop, { passive: true, once: true });
      (function frame(now) {
        if (s.stop) { scrolling = null; return; }
        var k = Math.min(1, (now - s.t0) / 480), e = 1 - Math.pow(1 - k, 3);
        var to = stage.scrollHeight - stage.clientHeight;
        stage.scrollTop = s.from + (to - s.from) * e;
        if (k < 1) requestAnimationFrame(frame);
        else { scrolling = null; stage.removeEventListener('touchstart', stop); stage.removeEventListener('wheel', stop); }
      })(performance.now());
    }

    /* Between her last reply and the result the footer stays hidden, or it
       reappears first and looks like the way on. Cleared by the result or a
       restart. */
    function hold(on) {
      var app = document.getElementById('app');
      if (!app) return;
      if (on) app.setAttribute('data-rp-ending', '');
      else app.removeAttribute('data-rp-ending');
    }

    function finish() {
      hold(true);
      compose.hidden = true;
      var cap = run.fail;
      var missed = (run.connect ? 0 : 1) + (run.limit ? 0 : 1) + (run.choices ? 0 : 1);
      /* Strong needs her to have actually got there. All four hit in the
         wrong order (the limit before she felt heard) leaves her stuck, and
         that is Nearly there, not Strong. */
      var band = cap ? 'notyet'
        : (missed === 0 ? (run.level === 3 ? 'strong' : 'nearly') : missed === 1 ? 'nearly' : 'notyet');
      /* Strong on two or more card phrases sent as written: same band and
         ticks, but the coach hands the words back (Decision Record §3). */
      var variant = (band === 'strong' && run.used.length >= 2 && scene.results.cards) ? 'cards' : band;
      var copy = cap ? scene.results.composure : scene.results[variant];

      S.answer(id, run.lines.join('\n'), band);
      run.nth = band === 'notyet' ? S.notYet() : S.notYets();

      /* Let the last reply land before the result replaces the scene. */
      var token = run;
      /* Her last reply is her reaction to your last line, so it stays up long
         enough to read before the result replaces the scene. */
      /* 1 Oct (Marc): a bar under her last reply, so the wait reads as the
         Coach reading the scene, not a stall. Same 2.8s. */
      var think = el('div', 'rp-think');
      think.setAttribute('role', 'status');
      think.appendChild(el('p', 'rp-think-t', (window.CDAH_STRINGS || {}).coachThinking || 'The Coach is looking over your conversation\u2026'));
      var bar = el('div', 'rp-think-bar'); bar.appendChild(el('i'));
      think.appendChild(bar);
      setTimeout(function () { if (run !== token) return; log.appendChild(think); toBottom(); }, 500);
      setTimeout(function () { think.remove(); if (run === token) paintResult(band, cap, copy, variant); }, 2800);
    }

    function paintResult(band, cap, copy, variant) {
      /* Thinking for Not yet, Neutral for Nearly there, Happy for a Strong
         on the cards, Celebratory for a Strong in their own words. */
      if (pose) pose.to(variant);

      var cardsBox = result.querySelector('[data-rp-cards]');
      if (cardsBox) {
        var list = cardsBox.querySelector('[data-rp-used]');
        list.innerHTML = '';
        if (variant === 'cards') {
          cardsBox.querySelector('[data-rp-cards-t]').textContent = copy.coach || '';
          var seen = {};
          for (var u = 0; u < run.used.length; u++) {
            var wi = run.used[u];
            if (seen[wi]) continue;
            seen[wi] = true;
            var li = el('li');
            li.appendChild(el('span', 'rp-used-what', words[wi].what));
            li.appendChild(el('span', 'rp-used-say', '\u201C' + words[wi].say + '\u201D'));
            list.appendChild(li);
          }
        }
        cardsBox.hidden = variant !== 'cards';
      }

      result.querySelector('[data-rp-head]').textContent = copy.head || '';
      var pill = result.querySelector('[data-rp-band]');
      pill.innerHTML = '<span class="sr-only">Your result: </span>' + M.BANDS[band];
      pill.setAttribute('role', 'text');
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
          var early = !passed && run[k + 'Early'] && row.early;
          p.setAttribute('data-passed', passed ? 'yes' : 'no');
          g.textContent = passed ? '\u2713' : '\u2014';
          sr.textContent = passed ? 'Covered. ' : 'Not yet. ';
          t.appendChild(sr);
          t.appendChild(document.createTextNode(passed ? row.hit : early ? row.early : row.miss));
        }
        p.appendChild(g); p.appendChild(t);
        rows.appendChild(p);
      }

      var coach = result.querySelector('[data-rp-coach]');
      var ct = result.querySelector('[data-rp-coach-t]');
      if (coach && ct) {
        /* Same list as the quiz, same pick-in-order rule. The line is handed
           out on the first Not yet here and kept for this scene. */
        var line = (band === 'notyet' && run.nth >= 2) ? S.coachLine(id, window.CDAH_COACH_LINES) : '';
        ct.textContent = line;
        coach.hidden = !line;
      }

      /* Package J: the way on. Scenes 1 and 2 go to the next scene (once it
         exists); scene 3 carries Finish (once the finish screen exists). */
      var nx = result.querySelector('[data-rp-next]');
      if (nx) {
        var C2 = (window.CDAH_STRINGS && window.CDAH_STRINGS.close2) || {};
        var n = +id.slice(-1);
        /* Scene 3 is the 7:40 morning, so it leads to the Bookend, not Finish. */
        var to = n < 3 ? 'scn-30' + (n + 1) : 'scr-304';
        nx.textContent = n < 3 ? (C2.next || 'Next scenario') : (C2.toBookend || C2.finish || 'Finish');
        nx.setAttribute('data-to', to);
        nx.hidden = !document.getElementById(to);
      }
      play.hidden = true;
      result.hidden = false;
      sizePose();
      hold(false);
      var stage = document.getElementById('stage');
      if (stage) stage.scrollTop = 0;
      var hd = result.querySelector('[data-rp-head]');
      hd.setAttribute('tabindex', '-1');
      /* Oct 5 (Marc, VoiceOver): focus straight after unhiding was lost on the
         Mac, so the result wasn't read from the top. Wait a beat. */
      setTimeout(function () { if (stage) stage.scrollTop = 0; hd.focus({ preventScroll: true }); }, 120);
    }

    /* A resize or rotation reflows the transcript, so Maya is re-seated
       beside her latest line, without the travel animation. */
    var rz = 0;
    window.addEventListener('resize', function () {
      clearTimeout(rz);
      rz = setTimeout(function () { if (!play.hidden) place(true); }, 120);
    });

    /* Say it with the phone keyboard up. The tap blurred the field first,
       the keyboard dropped, the layout jumped and the tap was lost, so it
       took two. Now the touch is handled at touchend, before the blur, and
       on desktop mousedown keeps focus in the field. A drag that started on
       the button (a scroll) is ignored. */
    var tx = null;
    say.addEventListener('touchstart', function (e) {
      var t = e.touches[0]; tx = { x: t.clientX, y: t.clientY };
    }, { passive: true });
    say.addEventListener('touchend', function (e) {
      var t = e.changedTouches[0];
      var moved = !tx || Math.abs(t.clientX - tx.x) > 10 || Math.abs(t.clientY - tx.y) > 10;
      tx = null;
      if (moved || say.disabled) return;
      e.preventDefault();
      turn();
    });
    say.addEventListener('mousedown', function (e) { if (document.activeElement === field) e.preventDefault(); });
    say.addEventListener('click', turn);

    /* The scene has no footer: Back goes to the Try It Out intro, and
       Start over clears this conversation. It shows once there is
       something to clear. */
    if (backBtn) backBtn.addEventListener('click', function () {
      var to = backBtn.getAttribute('data-to');
      if (to) location.hash = to;
    });
    if (resetBtn) resetBtn.addEventListener('click', function () {
      reset();
      var stage = document.getElementById('stage');
      if (stage) stage.scrollTop = 0;
    });
    field.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); turn(); }
    });
    var nxBtn = result.querySelector('[data-rp-next]');
    if (nxBtn) nxBtn.addEventListener('click', function () {
      H.tap();
      var to = nxBtn.getAttribute('data-to');
      if (to) location.hash = to;
    });
    result.querySelector('[data-rp-again]').addEventListener('click', function () {
      reset(); field.focus();
    });
    document.addEventListener('cdah:restart', reset);
    if (strip && words.length) {
      STRIPS.push({ section: section, toggle: function () {
        var open = !stripOpen();
        setStrip(open, true);
        if (open && cardEls[0]) cardEls[0].focus();
        else if (pill) pill.focus();
      } });
    }

    reset();
  }

  var STRIPS = [];
  /* R toggles the strip on whichever scene is showing (js/app.js). */
  window.CDAH_STRIP = { toggle: function () {
    for (var i = 0; i < STRIPS.length; i++) {
      var sec = STRIPS[i].section;
      var st = sec.querySelector('[data-wt]');
      if (!sec.hidden && !sec.querySelector('[data-rp-play]').hidden && st && !st.hidden) { STRIPS[i].toggle(); return; }
    }
  } };

  var scenes = document.querySelectorAll('[data-scene]');
  for (var i = 0; i < scenes.length; i++) build(scenes[i]);

  window.CDAH_RP = { _score: score, _step: step };
})();
