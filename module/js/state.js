/* State. One object, one localStorage key, no transmission.
   Everything the module remembers about a parent lives here. */

(function () {
  'use strict';

  var KEY = 'cdah.state.v1';

  var BLANK = {
    version: 1,
    screen: null,        // last screen id reached
    visited: [],         // screen ids seen, in order first seen
    answers: {},         // { itemId: "what they typed" }
    bands: {},           // { itemId: "strong" | "nearly" | "notyet" }
    best: {},            // { itemId: band } — best stands
    claims: {},          // { itemId: true } — "I think my answer covered this"
    stripOpen: false,    // Words to try: remembered once they open it
    coach: { given: {}, next: 0 }, // { itemId: line index }, next line to hand out
    savedAt: null        // ms epoch of last write
  };

  function read() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return clone(BLANK);
      var obj = JSON.parse(raw);
      if (!obj || obj.version !== 1) return clone(BLANK);
      // fill any key added since this parent last visited
      for (var k in BLANK) if (!(k in obj)) obj[k] = clone(BLANK[k]);
      return obj;
    } catch (e) {
      return clone(BLANK);
    }
  }

  function clone(v) { return JSON.parse(JSON.stringify(v)); }

  var state = read();
  var listeners = [];

  function write() {
    state.savedAt = Date.now();
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      /* Private browsing or a full quota. The module keeps working for this
         sitting; it just will not be there tomorrow. Nothing is claimed in
         the UI that this would make untrue — the panel reads the timestamp. */
      state.savedAt = null;
    }
    for (var i = 0; i < listeners.length; i++) listeners[i](state);
  }

  var API = {
    get: function () { return state; },

    set: function (patch) {
      for (var k in patch) state[k] = patch[k];
      write();
    },

    reached: function (screenId) {
      state.screen = screenId;
      if (state.visited.indexOf(screenId) === -1) state.visited.push(screenId);
      write();
    },

    answer: function (itemId, text, band) {
      state.answers[itemId] = text;
      if (band) {
        state.bands[itemId] = band;
        var rank = { notyet: 0, nearly: 1, strong: 2 };
        var prev = state.best[itemId];
        if (prev === undefined || rank[band] > rank[prev]) state.best[itemId] = band;
      }
      write();
    },

    /* The coach line for one item. First ask assigns the next line in the
       list and remembers it; every later ask returns the same one. */
    coachLine: function (itemId, lines) {
      if (!lines || !lines.length) return '';
      var c = state.coach || (state.coach = { given: {}, next: 0 });
      if (!(itemId in c.given)) {
        c.given[itemId] = c.next % lines.length;
        c.next = c.next + 1;
        write();
      }
      return lines[c.given[itemId] % lines.length] || '';
    },

    onChange: function (fn) { listeners.push(fn); },

    savedAt: function () { return state.savedAt; },

    hasProgress: function () { return state.visited.length > 1; },

    /* The resume code: the whole state object, for the different-device case.
       Base64 of the JSON, chunked for readability. Not a secret, not an
       account — just the same object, carried by hand. */
    code: function () {
      try {
        var json = JSON.stringify(state);
        var b64 = window.btoa(unescape(encodeURIComponent(json)));
        return (b64.match(/.{1,4}/g) || []).join('-');
      } catch (e) { return ''; }
    },

    applyCode: function (code) {
      try {
        var b64 = String(code).replace(/[-\s]/g, '');
        var json = decodeURIComponent(escape(window.atob(b64)));
        var obj = JSON.parse(json);
        if (!obj || obj.version !== 1) return false;
        state = obj;
        write();
        return true;
      } catch (e) { return false; }
    },

    restart: function () {
      state = clone(BLANK);
      write();
    }
  };

  window.CDAH_STATE = API;
})();
