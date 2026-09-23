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

  function contains(haystack, phrase) {
    var p = ' ' + normalize(phrase).trim() + ' ';
    return haystack.indexOf(p) !== -1;
  }

  function any(haystack, list) {
    if (!list) return false;
    for (var i = 0; i < list.length; i++) if (contains(haystack, list[i])) return true;
    return false;
  }

  /* A veto cancels a pass that an accept phrase already earned. Only one
     criterion in the module uses it (qz-203 B: "I'd apologize if he
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
    var hay = normalize(text);
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

  window.CDAH_MATCH = {
    score: score,
    normalize: normalize,
    /* Exposed for package E: after a session, paste a parent's exact wording
       in the console against a criterion and see whether it would have
       passed, without loading the whole screen. */
    test: function (item, critId, text) {
      var crits = (item && item.criteria) || [];
      for (var i = 0; i < crits.length; i++) {
        if (crits[i].id === critId) return scoreCriterion(normalize(text), crits[i]);
      }
      return null;
    },
    BANDS: { strong: 'Strong', nearly: 'Nearly there', notyet: 'Not yet' }
  };
})();
