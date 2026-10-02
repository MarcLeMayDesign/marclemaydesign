/* The criterion matcher — Build Plan v5 §3.5, and the module's only scoring
   mechanism. Used by the quiz now and by the role-plays in package D.

   Each criterion owns a list of accepted phrasings. A criterion passes when
   the answer contains any of them, after lowercasing, stripping punctuation
   and collapsing a small synonym table. All pass → Strong. One missed →
   Nearly there. Two or more → Not yet. No percentage is produced anywhere in
   this file, and there is deliberately no score to expose: the band and the
   list of which criteria passed is the whole output.

   The known failure mode is a parent who is right in words no list
   anticipated. That is not solvable by cleverness here — it is solvable by
   the parent sessions in package E, and in the meantime by the "I think my
   answer covered this" path on the result screen. Both of those are the
   design; this file just has to be generous and legible enough that adding
   a phrase after a session is one line in content/quiz.js. */

(function () {
  'use strict';

  /* Multi-word entries are collapsed before single words, longest first, so
     "really going on" is not eaten by a shorter rule. Each group becomes its
     first member. Keep this table small: every entry is a claim that two
     phrasings mean the same thing to a five-year-old's parent, and a long
     table is how a matcher starts passing answers it should not. */
  var SYNONYMS = [
    ['calm', ['settle', 'settled', 'steady', 'regulate', 'regulated', 'composed', 'composure']],
    ['underneath', ['behind', 'driving', 'really going on', 'going on underneath', 'root of']],
    ['tired', ['worn out', 'shattered', 'knackered', 'spent']],
    ['wont hear', ['cant take it in', 'cant process', 'not listening', 'wont take it in']]
  ];

  /* Contractions are stripped of their apostrophe rather than expanded:
     "won't" and "wont" both have to match the list's "wont", and expanding
     to "will not" would need a second list. */
  function normalize(text) {
    var s = String(text == null ? '' : text).toLowerCase();
    s = s.replace(/[\u2018\u2019\u02bc`']/g, '');       // apostrophes vanish
    s = s.replace(/[^a-z0-9]+/g, ' ');                   // everything else spaces
    s = ' ' + s.replace(/\s+/g, ' ').trim() + ' ';       // padded, for word-edge tests
    for (var i = 0; i < SYNONYMS.length; i++) {
      var canon = SYNONYMS[i][0], alts = SYNONYMS[i][1];
      for (var j = 0; j < alts.length; j++) {
        var alt = ' ' + alts[j].replace(/[^a-z0-9]+/g, ' ').trim() + ' ';
        while (s.indexOf(alt) !== -1) s = s.replace(alt, ' ' + canon + ' ');
      }
    }
    return s;
  }

  /* Draft 2 (2 Oct). Light stemming, applied to both the answer and every
     list phrase, so "calmer", "calming" and "calmed" all meet "calm", and
     "feelings" meets "feeling". Up to two suffixes off a word of five
     letters or more, never leaving fewer than three. It is crude on purpose:
     because both sides get the same treatment, an odd stem ("shoes" ->
     "sho") still matches itself. Marc's Draft 1 answers missed on exactly
     this ("he was calmer", "we had to go"). */
  var SUFFIX = ['ing', 'ed', 'er', 'es', 'ly', 's'];
  function stemWord(w) {
    for (var pass = 0; pass < 2; pass++) {
      if (w.length < 5) break;
      var cut = false;
      for (var i = 0; i < SUFFIX.length; i++) {
        var sx = SUFFIX[i];
        if (w.length - sx.length >= 3 && w.slice(-sx.length) === sx) { w = w.slice(0, -sx.length); cut = true; break; }
      }
      if (!cut) break;
    }
    return w;
  }
  function stem(padded) {
    return ' ' + padded.trim().split(' ').map(stemWord).join(' ') + ' ';
  }
  function prep(text) { return stem(normalize(text)); }

  function contains(haystack, phrase) {
    var p = ' ' + prep(phrase).trim() + ' ';
    return haystack.indexOf(p) !== -1;
  }

  function any(haystack, list) {
    if (!list) return false;
    for (var i = 0; i < list.length; i++) if (contains(haystack, list[i])) return true;
    return false;
  }

  /* A veto cancels a pass that an accept phrase already earned. Only one
     criterion in the module uses it (qz-204 B: "I'd apologize if she
     apologizes" contains "apologize" and is not a repair), and it should
     stay that rare — a veto is the matcher overruling a parent, which is
     the thing this module is most careful about. */
  function scoreCriterion(haystack, crit) {
    var hit = any(haystack, crit.accept);
    if (hit && any(haystack, crit.veto)) hit = false;
    return hit;
  }

  function bandFor(missed) {
    if (missed === 0) return 'strong';
    if (missed === 1) return 'nearly';
    return 'notyet';
  }

  /* Which coach branch speaks. One miss gets the criterion-specific branch
     if the item wrote one — coach.missB and so on — because naming which
     one is the whole value of the middle band. Falls back to `many` only if
     the copy is not there, which is a content bug worth seeing rather than
     papering over. */
  function branchFor(item, results) {
    var missed = [];
    for (var i = 0; i < results.length; i++) if (!results[i].passed) missed.push(results[i].id);
    var c = item.coach || {};
    if (missed.length === 0) return c.all || null;
    if (missed.length === 1) return c['miss' + missed[0]] || c.many || null;
    return c.many || null;
  }

  function score(item, text) {
    var hay = prep(text);
    var results = [];
    var missed = 0;
    var crits = item.criteria || [];
    for (var i = 0; i < crits.length; i++) {
      var passed = scoreCriterion(hay, crits[i]);
      if (!passed) missed++;
      results.push({
        id: crits[i].id,
        passed: passed,
        line: passed ? crits[i].hit : crits[i].miss
      });
    }
    return {
      band: bandFor(missed),
      missed: missed,
      criteria: results,
      coach: branchFor(item, results)
    };
  }

  /* Gibberish (30 Sept, Marc). A keyboard mash used to come back as a
     full set of misses, which reads as the Coach grading nonsense. Checked
     only when nothing matched: if no everyday English word appears at all,
     or most of the "words" have no vowel, the answer is treated as not
     understood — nothing scored, nothing saved, no turn used. A real
     one-word answer that also missed everything gets the same gentle ask
     for a sentence, which is the right nudge anyway. */
  var COMMON = ('i im id ive me my myself you your youre he hes him his she shes her it its we were us our they them their ' +
    'a an the and or but so if then than because that this what why how when where who which not no yes dont cant wont ' +
    'is are was be been being am do does did have has had will would could should can may might must just really ' +
    'to of in on at for with about from up down out off over after before now later first then again still also ' +
    'say said tell ask go get let make feel think know want need see look help try stop time okay ok like calm ' +
    'mom mum dad son daughter child kid kids boy girl baby sorry please thank ' +
    'whatever whatevs fine nope yeah yep yup nah huh ugh hey hi hmm oh oops uh um wow cool great good bad hate love').split(' ');
  /* 1 Oct (Marc): "Whatevs" was flagged. A one-word answer outside the list
     isn't gibberish if it looks like a word, so the no-common-word rule now
     needs at least half the tokens to look mashed: no vowel, four consonants
     in a row, a letter three times running, or a run along a keyboard row. */
  var ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
  function mashed(t) {
    if (/^[0-9]+$/.test(t)) return false;
    if (!/[aeiouy]/.test(t)) return true;
    if (/[^aeiouy0-9]{5,}/.test(t) || /(.)\1\1/.test(t)) return true;
    for (var r = 0; r < ROWS.length; r++) for (var k = 0; k + 4 <= t.length; k++) if (ROWS[r].indexOf(t.substr(k, 4)) !== -1) return true;
    return false;
  }
  function nonsense(text) {
    var toks = normalize(text).trim().split(' ').filter(Boolean);
    if (!toks.length) return true;
    var common = 0, vowelless = 0, mash = 0;
    for (var i = 0; i < toks.length; i++) {
      if (COMMON.indexOf(toks[i]) !== -1) common++;
      if (!/[aeiouy]/.test(toks[i]) && !/^[0-9]+$/.test(toks[i])) vowelless++;
      if (mashed(toks[i])) mash++;
    }
    return vowelless / toks.length > 0.5 || (common === 0 && mash / toks.length >= 0.5);
  }
  /* The note under a field that says so. One element per field, made on
     first use, cleared as soon as they type again. */
  function huh(field, msg) {
    if (!field) return;
    var n = field._huh;
    if (!n) {
      n = field._huh = document.createElement('p');
      n.className = 'huh'; n.setAttribute('role', 'status'); n.hidden = true;
      field.insertAdjacentElement('afterend', n);
      field.addEventListener('input', function () { n.hidden = true; });
    }
    n.textContent = msg || ''; n.hidden = !msg;
    if (msg) field.focus();
  }

  window.CDAH_MATCH = {
    score: score,
    nonsense: nonsense,
    huh: huh,
    normalize: normalize,
    stem: stem,
    prep: prep,
    /* Exposed for package E: after a session, paste a parent's exact wording
       in the console against a criterion and see whether it would have
       passed, without loading the whole screen. */
    test: function (item, critId, text) {
      var crits = (item && item.criteria) || [];
      for (var i = 0; i < crits.length; i++) {
        if (crits[i].id === critId) return scoreCriterion(prep(text), crits[i]);
      }
      return null;
    },
    BANDS: { strong: 'Strong', nearly: 'Nearly there', notyet: 'Not yet' }
  };
})();
