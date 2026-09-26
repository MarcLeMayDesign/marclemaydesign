/* The safety check. First in the submit chain on every free-text field:
     safety check → matcher → band → coach feedback → state
   When it fires, nothing downstream runs: no band, no attempt, nothing
   written to state. The parent's text stays in the field.

   Detection is the matcher's technique on its own normalizer (the matcher's
   synonym table must not leak in here). Two errors, not symmetrical: a miss
   scores a disclosure as an answer; a false fire hands a good answer a crisis
   line. Hence the narrower role-play lists and SR-4's second signal.

   "Once per category per session" is per sitting, held in memory on
   purpose: nothing about a safety response is ever written to storage. */

(function () {
  'use strict';

  var D = window.CDAH_SAFETY_DATA;
  if (!D) return;

  var fired = {};

  function norm(text) {
    var s = String(text == null ? '' : text).toLowerCase();
    s = s.replace(/[\u2018\u2019\u02bc`']/g, '');
    s = s.replace(/[^a-z0-9]+/g, ' ');
    s = ' ' + s.replace(/\s+/g, ' ').trim() + ' ';
    /* Filler words dropped, so "I just can't do this" meets "I can't do
       this". Safety only — the matcher keeps its own normalizer. */
    s = s.replace(/ (just|really|honestly|literally|actually|simply|so|totally|seriously) /g, ' ');
    s = s.replace(/ (just|really|honestly|literally|actually|simply|so|totally|seriously) /g, ' ');
    return s;
  }

  function hasWord(hay, list) {
    for (var i = 0; i < list.length; i++) {
      if (hay.indexOf(' ' + list[i] + ' ') !== -1) return true;
    }
    return false;
  }

  function has(hay, list) {
    if (!list) return false;
    for (var i = 0; i < list.length; i++) {
      if (hay.indexOf(' ' + norm(list[i]).trim() + ' ') !== -1) return true;
    }
    return false;
  }

  function inList(word, list) { return list.indexOf(word) !== -1; }

  /* verb + person, with a first-person word shortly before and no
     negation in that same stretch. Works on words, not substrings. */
  function patternHit(hay, p) {
    var w = hay.trim().split(' ');
    for (var k = 0; k < w.length; k++) {
      if (!inList(w[k], p.verbs)) continue;
      var next = w[k + 1] || '', next2 = next + ' ' + (w[k + 2] || '');
      var objOk = inList(next, p.objects) || inList(next2, p.objects);
      if (!objOk) continue;
      if (p.unless && inList(w[k + 2] || '', p.unless)) continue;
      /* The nearest pronoun before the verb decides who is doing it, so
         "I'd stay calm even if she wanted to hit him" stays silent while
         "I'd yell at him and smack him" fires. */
      var from = Math.max(0, k - p.window), subj = false, neg = false;
      for (var b = k - 1; b >= from; b--) {
        if (inList(w[b], p.negate)) neg = true;
        if (inList(w[b], p.subjects)) { subj = true; break; }
        if (p.others && inList(w[b], p.others)) break;
      }
      if (subj && !neg) return true;
    }
    return false;
  }

  function matches(hay, cat, context) {
    if (context === 'roleplay' && cat.homeOnly && !has(hay, D.home)) return false;
    /* "I hurt her feelings" is qz-203's own subject matter, not a
       disclosure. The pattern's `unless` words cancel a fixed phrase too. */
    var h2 = hay;
    if (cat.pattern && cat.pattern.unless) {
      for (var u = 0; u < cat.pattern.unless.length; u++) {
        h2 = h2.replace(new RegExp(' (him|her|them|his|my \\w+) ' + cat.pattern.unless[u] + ' ', 'g'), ' _ ');
      }
    }
    if (has(h2, cat.phrases)) return true;
    if (cat.pattern && patternHit(h2, cat.pattern)) return true;
    if (cat.pair && has(hay, cat.pair.a) && hasWord(hay, cat.pair.b) && !has(hay, cat.pair.unless)) return true;
    if (cat.weak && has(hay, cat.weak) && has(hay, cat.second)) return true;
    if (cat.needs && has(hay, cat.needs.ask) && has(hay, cat.needs.child)) return true;
    return false;
  }

  /* Returns null, or { id, html, action, repeat }. Marks the category as
     fired for this sitting as a side effect, so call it once per submit. */
  function check(text, opts) {
    var context = (opts && opts.context) || 'quiz';
    var hay = norm(text);
    for (var i = 0; i < D.categories.length; i++) {
      var cat = D.categories[i];
      if (!matches(hay, cat, context)) continue;
      var repeat = !!fired[cat.id];
      fired[cat.id] = true;
      return { id: cat.id, html: repeat ? cat.again : cat.say, action: cat.action, repeat: repeat };
    }
    return null;
  }

  function openPanelAt(cardId) {
    if (typeof window.CDAH_OPEN_PANEL === 'function') window.CDAH_OPEN_PANEL();
    setTimeout(function () {
      var card = document.getElementById(cardId);
      var panel = document.getElementById('panel');
      if (!card || !panel) return;
      panel.scrollTop = Math.max(0, card.offsetTop - 16);
      var h = card.querySelector('h3');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    }, 60);
  }

  /* Fills `host` in the coach's voice and slot: no modal, no red, no alert
     role. The interface must not flinch. onBack returns them to the field. */
  function render(host, hit, onBack) {
    host.innerHTML = '';
    var p = document.createElement('p');
    p.className = 'safety-t';
    p.setAttribute('tabindex', '-1');
    p.innerHTML = hit.html;
    host.appendChild(p);

    var row = document.createElement('div');
    row.className = 'qz-acts';
    if (hit.action) {
      var a;
      /* A phone number is a link, not a button. On a phone, tapping it gets
         the operating system's own "Call?" prompt, which never dials on its
         own; on a laptop it may offer a calling app, or do nothing. The number
         is printed in the link either way, so it works as plain text. */
      if (hit.action.href) {
        a = document.createElement('a');
        a.href = hit.action.href;
        a.className = 'safety-link';
      } else {
        a = document.createElement('button');
        a.type = 'button';
        a.className = 'btn';
        a.addEventListener('click', function () { openPanelAt(hit.action.panel); });
      }
      a.textContent = hit.action.label;
      row.appendChild(a);
    }
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn-link';
    b.textContent = 'Back to the question';
    b.addEventListener('click', function () { if (onBack) onBack(); });
    row.appendChild(b);
    host.appendChild(row);

    host.hidden = false;
    p.focus({ preventScroll: true });
  }

  window.CDAH_SAFETY = { check: check, render: render, _norm: norm };
})();
