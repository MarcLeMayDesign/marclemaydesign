/* Bring It Together (Draft 2, 16 Oct; built into the module 19 Oct).
   Two scenarios, one screen each (scr-200, scr-201), in guided steps, with
   the Coach answering in place, then Look back (scr-209, dark).
   State lives in state.bit: val, asked, pick, conf, self, cont (by step id),
   band (by scenario), a5 (Look back).

   19 Oct, Marc's slow-walk notes:
   - "Send", not "Ask the Coach". Cmd/Ctrl+Return sends from any box.
   - After the Coach answers, "Continue ↓" opens the next step. A self-read
     step needs no Continue: "Yes, that's me" (or a pick) moves it on.
   - Playground step 4 asks what you'd do or say FIRST, and the Coach reads
     the answer in order: calming and safety first, then reasons, is credited,
     with a note that the reasons can wait.
   - The model line's label follows the answer: "Another way you could word
     that" when the answer already does what the model does; "One more thing
     you could say" when it's partly there; "One thing you could say" only for
     a blank or an "I don't know". */

(function () {
  'use strict';
  var S = window.CDAH_STATE, H = window.CDAH_HAPTICS || { tap: function () {} }, FX = window.CDAH_FX;
  var hosts = document.querySelectorAll('[data-bit]');
  if (!S || !hosts.length) return;

  var IMG = 'assets/img/';
  var C = {
    surv: { name: 'Survival', img: 'brain-stem.png' },
    emo: { name: 'Emotional', img: 'brain-limbic.png' },
    exec: { name: 'Executive', img: 'brain-prefrontal.png' }
  };
  var W = {
    surv: ['tense', 'tight', 'jaw', 'fist', 'clench', ' hot', 'heart', 'racing', 'pounding', 'shaking', 'yell', 'scream', 'grab', 'drag', 'panic', 'freeze', 'frozen', 'give up', 'over with', 'get out', 'leave', 'run', 'numb', 'shut down', 'blank', 'explode', 'lose it', 'snap', 'throw it back', 'shove'],
    emo: ['embarrass', 'judg', 'watch', 'ashamed', 'shame', 'frustrat', 'annoy', 'angry', 'mad', 'hurt', 'unfair', 'ungrateful', 'spoiled', 'on purpose', 'always', 'never', 'resent', 'guilt', 'irritat', 'fed up', 'disrespect', 'bad parent', 'what will', 'people think', 'warned', 'warning', 'i told her', 'i gave her'],
    exec: ['calm', 'steady', 'breath', 'fine', 'okay', 'curious', 'wonder', 'patient', 'notice', 'relaxed', 'clear']
  };
  function norm(t) { return ' ' + (t || '').toLowerCase().replace(/[\u2018\u2019']/g, '') + ' '; }
  function h(t, list) { var x = norm(t); return list.some(function (w) { return x.indexOf(w) !== -1; }); }
  function n(t, list) { var x = norm(t); return list.filter(function (w) { return x.indexOf(w) !== -1; }).length; }
  /* Where in the answer a group first shows up (-1: not at all). */
  function at(t, list) { var x = norm(t), m = -1; list.forEach(function (w) { var i = x.indexOf(w); if (i !== -1 && (m === -1 || i < m)) m = i; }); return m; }
  /* 20 Oct: "not okay", "not calm at all", "can't breathe" must not read as
     Executive. A calm word after a negation is dropped before counting. */
  var NEG = /\b(not|never|isnt|arent|wasnt|dont feel|doesnt feel|cant|cannot|hardly|barely|far from)\s+(\w+\s+){0,2}?(calm|steady|breath\w*|fine|okay|ok|curious|patient|relaxed|clear)\b/g;
  function read(t) {
    t = norm(t).replace(NEG, ' ');
    var a = n(t, W.surv), b = n(t, W.emo), c = n(t, W.exec);
    if (!a && !b && !c) return null;
    if (a >= b && a >= c) return 'surv';
    return b >= c ? 'emo' : 'exec';
  }
  function blankish(t) {
    var x = norm(t);
    if (/dont know|do not know|not sure|no idea|idk|no clue/.test(x)) return true;
    return (x.match(/[a-z]{3,}/g) || []).length < 3;
  }

  var MORE = 'Tell me a little more. What\u2019s your body doing: your jaw, your hands, your breathing? And what\u2019s going through your head?';
  var WARN = ' And your five-minute warning was still the right move. Sometimes the drop comes anyway.';
  var COMP = ['breath', 'breathe', 'calm', 'myself', 'compose', 'pause', 'count'];
  var SAFE = ['wont let', 'stop', 'throw', 'dirt', 'safe', 'hands', 'hold', 'step back', 'out of range', 'away from', 'block', 'limit', 'move back'];
  var THREAT = ['no playground', 'leaving without', 'punish', 'time out', 'timeout', 'consequence', 'no more', 'take away', 'lost', 'never again', 'next time we wont'];
  var DESC = ['i see', 'i can see', 'i notice', 'youre on the', 'you are on the', 'on the ground', 'your hands', 'your face', 'your fists', 'your feet', 'your legs', 'youre throwing', 'you are throwing', 'youre crying', 'youre so mad', 'you are so mad', 'hands are full', 'describe'];
  var BREA = ['breathe together', 'breathe with', 'breath with', 'breathing with', 'with me', 'school breath', 'belly breath', 'smell the flower', 'blow out', 'in and out'];
  /* "Describing what you see" etc. for the Coach's credit line. */
  function extras(t) {
    var d = h(t, DESC), b = h(t, BREA);
    return d && b ? 'And you described the scene and breathed with her: the other two Survival moves. Both help her feel seen and safe.'
      : d ? 'And you described the scene, calmly, without judging it. That helps her feel seen, and it\u2019s the first step to connection.'
      : b ? 'And you breathed with her. Your slower breath gives her body something to follow.'
      : '';
  }
  var ARGUE = ['i told you', 'you had', 'i gave you', 'i warned', 'you knew', 'you agreed', 'thats fair', 'thats what you said', 'five minute warning', '5-minute warning', '5 minute warning'];

  var SCN = {
    s1: { where: 'At the checkout', next: 'scr-201', nextLabel: 'Go on to Scenario 2 \u2192', steps: [
      { id: '1a', type: 'self', tag: 'You', label: 'Before you say anything: what are you feeling right now, in your body and in your head?', ph: 'My jaw is tight, I\u2019m embarrassed\u2026',
        says: {
          surv: 'It sounds like the Survival State: your body is getting ready to fight, or to get out of there. With someone watching, that\u2019s where most of us land. Does that sound right?',
          emo: 'It sounds like the Emotional State. Feeling judged, or that it\u2019s unfair, is the clue: it\u2019s about how this looks and feels to you. Does that sound right?',
          exec: 'It sounds like you\u2019re steady, in the Executive State. With a stranger watching, that\u2019s not easy. Does that sound right?' },
        first: {
          surv: 'Then your first move is for you: Compose Yourself. One deep belly breath before a word comes out. \u201cI\u2019ve got this. She needs me.\u201d',
          emo: 'Then your first move is for you: Compose Yourself. Notice the feeling, name it to yourself (\u201cI\u2019m embarrassed\u201d), and take one breath before you answer her.',
          exec: 'Then hold on to it. Your calm is the first thing she\u2019ll read. Keep breathing, and turn to her.' } },
      { id: '1b', type: 'pick', tag: 'Maya', label: 'Which brain state is Maya in?', textLabel: 'What were the clues?', ph: 'What did you see or hear that told you?',
        crit: ['You read her state as Emotional.', 'Her state: she\u2019s in the Emotional State.'],
        ev: function (p, t) {
          var words = h(t, ['never', 'anything', 'shout', 'yell', 'words', 'said', 'saying', 'what she', 'blam']);
          var cap = h(t, ['tired', 'long day', 'full day', 'school', 'ballet', 'all afternoon', 'all day', 'end of the day', '5:30', 'hungry', 'capacity', 'drained', 'ran out', 'run out', 'held it together', 'holding it together', 'errand']);
          if (p === 'emo') return { ok: true, t: words && cap ? 'Yes. \u201cYou NEVER get me anything\u201d is the Emotional State talking: it shows up mostly in words. And you caught the capacity clue too: a full day at school, then ballet. She\u2019s running on empty.'
            : words ? 'Yes, her words gave it away: \u201cyou never\u201d is how the Emotional State talks. One more clue worth seeing: she\u2019s been holding it together all day, so her capacity is low.'
            : cap ? 'Yes. And you saw her capacity running out: a full day, then ballet. Listen to her words as well: \u201cyou NEVER\u201d is how the Emotional State talks.'
            : 'Right state. Look at the clues, too: \u201cyou NEVER\u201d is how the Emotional State talks, and a full day at school has drained her capacity.' };
          if (p === 'surv') return { ok: false, t: 'Close, but listen to her. She\u2019s shouting words at you, not hitting or running. \u201cYou NEVER get me anything\u201d is the Emotional State. She could still drop to Survival if this goes badly.' };
          return { ok: false, t: 'Not yet. A child who\u2019s ready to think can wait for an answer. \u201cYou NEVER get me anything\u201d is the Emotional State, and a long day has drained her capacity.' };
        } },
      { id: '1c', type: 'text', tag: 'What she needs', label: 'What would you do and say first?', ph: 'First I\u2019d\u2026 then I\u2019d say\u2026',
        model: '(a breath first, then down to her level) \u201cYou really wanted that chocolate. It\u2019s so hard when the answer is no, at the end of a long day. We\u2019re not buying it today.\u201d',
        crit: [['You put yourself first, then connection.', 'The moves: you first, then connection.'], ['Your words named her feeling first.', 'Your words: name her feeling before the no.']],
        ev: function (p, t) {
          var comp = h(t, ['breath', 'breathe', 'calm', 'myself', 'compose', 'pause', 'my own', 'me first', 'count']);
          var conn = h(t, ['name the feeling', 'feel', 'empath', 'connect', 'hug', 'get down', 'her level', 'kneel', 'understand', 'you really want', 'you wanted', 'hard', 'two options', 'two choices', 'options', 'choice', 'pick', 'choose', ' or ']);
          var threat = h(t, ['screen time', 'leaving right now', 'lost', 'take away', 'punish', 'consequence', 'time out', 'timeout']);
          var shout = /\b[A-Z]{3,}\b/.test(t) || t.indexOf('!!') !== -1 || h(t, ['stop it', 'enough', 'because i said']);
          var named = h(t, ['you really want', 'you wanted', 'you want', 'feel', 'hard', 'disappoint', 'frustrat', 'sad', 'mad', 'i know', 'i get it', 'i hear', 'tired', 'long day']);
          var okM = comp && conn && !threat, okW = named && !shout && !threat;
          return { ok: okM && okW, oks: [okM, okW], t: threat && !conn ? 'A consequence won\u2019t land while she\u2019s in the Emotional State; she can\u2019t hear it yet. What she needs first is connection: name the feeling, or give her two options.'
            : shout ? 'That has some heat in it, and she\u2019ll hear the heat before the words. Take your breath first, then try it again, a little lower and slower.'
            : okM && okW ? 'That\u2019s the order: you first, then connection. And your words named her feeling before the no. In the Emotional State she\u2019s asking \u201cAm I loved?\u201d, and that answers it. The limit can come next, and it can stay a no.'
            : conn ? 'Good move for her state: connection is exactly what the Emotional State needs. Don\u2019t skip yourself, though. With someone watching, one breath first.'
            : comp ? 'Good start: you first. Then what does she need? In the Emotional State, connection. Say what she\u2019s feeling, or give her two options, before the no.'
            : 'Think back to Part 4. For you: Compose Yourself. For her, in the Emotional State: Name the Feeling, or Give Two Options.' };
        } }
    ] },
    s2: { where: 'At the playground', next: 'scr-209', nextLabel: 'Look back \u2192', steps: [
      { id: '2a', type: 'pick', tag: 'Maya', label: 'Which brain state is Maya in right now?', textLabel: 'What are the signs?', ph: 'What did you see or hear?',
        crit: ['Before the drop, you saw the Executive State.', 'Before the drop: she was in the Executive State.'],
        ev: function (p, t) {
          var sign = h(t, ['okay', 'thank', 'smil', 'laugh', 'happy', 'ran off', 'runs off', 'back to', 'agree', 'listen', 'calm', 'play', 'heard', 'polite', 'fine', 'great']);
          if (p === 'exec') return { ok: true, t: sign ? 'Yes, the Executive State. She heard a limit, agreed to it, even said thank you, and went back to playing. Her thinking brain is online.' : 'Yes, the Executive State. Look at the signs, too: she heard a limit, agreed to it, and thanked you. That takes a thinking brain.' };
          if (p === 'emo') return { ok: false, t: 'Not here. Nothing in this moment is asking \u201cAm I loved?\u201d She heard the limit, agreed, and said thank you. That\u2019s the Executive State.' };
          return { ok: false, t: 'Not here. She\u2019s smiling, talking, agreeing. Survival is a body in fight, flight or freeze. This is the Executive State.' };
        } },
      { id: '2b', type: 'pick', tag: 'The drop', beatK: 'Five minutes later',
        beat: 'You walk over. \u201cAll right, it\u2019s time to go now.\u201d She screams, \u201cNO! You SAID I could have five more minutes!\u201d She throws herself on the ground, grabs big handfuls of dirt, and starts throwing them at you.',
        label: 'In terms of brain states, what just happened?', pickQ: 'Which state is she in now?', textLabel: 'And what happened, in your own words?', ph: 'She went from\u2026',
        crit: ['After it, you saw the drop to Survival.', 'After it: she dropped straight to Survival.'],
        ev: function (p, t) {
          var drop = h(t, ['drop', 'fell', 'fall', 'went from', 'straight', 'skip', 'jump', 'down to', 'all the way', 'flip', 'switch', 'lost it', 'melt', 'bottom']);
          var trig = h(t, ['transition', 'time to go', 'leav', 'stop', 'end', 'five minutes', '5 minutes', 'more time', 'promise', 'said i could', 'thought', 'unfair', 'fun', 'play']);
          if (p === 'surv') return { ok: true, t: (drop && trig ? 'Exactly. She dropped from Executive straight to Survival, skipping Emotional on the way down. Leaving set it off, and to her it was a broken promise (\u201cYou SAID\u2026\u201d). An irritation that feels like a threat can drop a child to Survival. Throwing dirt is her fight response.'
            : drop ? 'Yes, a drop: from Executive straight to Survival. What set it off? Leaving, and to her it felt like a broken promise (\u201cYou SAID\u2026\u201d). An irritation that feels like a threat can drop a child all the way, and the drop can skip straight to the bottom.'
            : trig ? 'Yes, leaving set it off. Name what happened in her brain, too: she dropped from Executive straight down to Survival. The throwing is fight.'
            : 'Yes, she\u2019s in Survival now: throwing dirt is a fight response. What happened is the drop, from Executive straight to the bottom. Having to leave felt like a broken promise to her, and an irritation that feels like a threat can do that.') + WARN };
          if (p === 'emo') return { ok: false, t: 'Her words sound Emotional (\u201cYou SAID\u2026\u201d), but watch her body: on the ground, throwing dirt at you. That\u2019s fight, the Survival State. She dropped all the way, in seconds.' };
          return { ok: false, t: 'Not anymore. Five minutes ago, yes. Throwing dirt is a fight response: she dropped from Executive straight to Survival.' };
        } },
      { id: '2c', type: 'self', tag: 'You', label: 'The dirt hits your pants. What\u2019s happening in you, in your body and in your head?', ph: 'I want to grab her arm\u2026',
        says: {
          surv: 'It sounds like the Survival State: your body getting ready to fight back, or to get out of there. Dirt flying at you would do that to anyone. Does that sound right?',
          emo: 'It sounds like the Emotional State. Feeling it\u2019s unfair, after you gave her a warning, is the clue. Does that sound right?',
          exec: 'It sounds like you\u2019re steady, in the Executive State. With dirt flying, that\u2019s not easy. Does that sound right?' },
        first: {
          surv: 'Then your first move is for you: Compose Yourself. Step back out of range, and take one deep belly breath before you say a word.',
          emo: 'Then your first move is for you: Compose Yourself. Name the feeling to yourself (\u201cI\u2019m so frustrated, I gave her a warning\u201d), and take one breath.',
          exec: 'Then hold on to it. She needs your calm before she needs anything else.' } },
      /* 19 Oct [MARC]: the question names "first", and the Coach reads in order. */
      { id: '2d', type: 'text', tag: 'What she needs', label: 'What would you do or say first to help Maya rise out of the Survival State?', ph: 'First I\u2019d\u2026',
        model: '(a breath, then down on one knee, out of range) \u201cI won\u2019t let you throw dirt at me. You\u2019re on the ground, your hands are full, you\u2019re so mad. I\u2019m right here.\u201d',
        crit: ['Your first moves put you first, then safety.', 'First moves: you first, then make it safe.'],
        ev: function (p, t) {
          var comp = h(t, COMP), safe = h(t, SAFE);
          var good = [at(t, COMP), at(t, SAFE)].filter(function (i) { return i >= 0; });
          var bad = [at(t, THREAT), at(t, ARGUE)].filter(function (i) { return i >= 0; });
          var g0 = good.length ? Math.min.apply(null, good) : -1, b0 = bad.length ? Math.min.apply(null, bad) : -1;
          var inOrder = b0 === -1 || (g0 !== -1 && g0 < b0);
          var ok = comp && safe && inOrder, ex = extras(t);
          return { ok: ok, t: ok && b0 !== -1 ? 'That\u2019s the order for the Survival State, and you did it first: Compose Yourself, then Make It Safe. Her brain is asking \u201cAm I safe?\u201d, and a calm limit answers it. The five minutes can wait, though. From Survival she can\u2019t hear reasons yet. Once she\u2019s climbed to the Emotional State, they have a better chance of landing.'
            : ok ? 'That\u2019s the order for the Survival State: Compose Yourself, then Make It Safe. Her brain is asking \u201cAm I safe?\u201d, and a calm limit answers it. ' + (ex || 'Describing what you see, or breathing together, can come next.')
            : b0 !== -1 && !inOrder ? 'She can\u2019t hear reasons or consequences from the Survival State, so they can\u2019t come first. Lead with the moves that help her feel safe: you first, then Make It Safe. The five minutes can come later.'
            : safe ? 'Good: Make It Safe comes early here, with dirt flying. Don\u2019t skip yourself, though. One breath first, so the limit comes out calm.' + (ex ? ' ' + ex : '')
            : comp && ex ? 'Good start: you first. ' + ex + ' With dirt flying, though, Make It Safe needs to be in there too: \u201cI won\u2019t let you throw dirt.\u201d'
            : comp ? 'Good start: you first. Then safety. She\u2019s throwing things, so the next move is Make It Safe: \u201cI won\u2019t let you throw dirt.\u201d'
            : 'Think back to Part 4. For the Survival State: Compose Yourself, Make It Safe, Describe the Scene, Breathe Together.' };
        } },
      { id: '2e', type: 'pick', tag: 'The climb', beatK: 'A minute later',
        beat: 'You took your breath and stayed close. The dirt stops. She sits in the sand and sobs, \u201cI wasn\u2019t DONE. I never get to finish ANYTHING.\u201d',
        label: 'Where is she now, and what does she need?', pickQ: 'Which state is she in now?', textLabel: 'What would you do and say now?', ph: 'I\u2019d sit down next to her and say\u2026',
        model: '(sitting down beside her) \u201cYou weren\u2019t done. It\u2019s so hard to stop when you\u2019re having fun. Do you want to walk to the car, or ride on my back?\u201d',
        crit: [['You saw her climb to the Emotional State.', 'The climb: she\u2019s up to the Emotional State.'], ['You gave her connection.', 'Connection: name the feeling, or give two options.']],
        ev: function (p, t) {
          var conn = h(t, ['feel', 'frustrat', 'hard', 'werent done', 'not done', 'wanted to', 'want to stay', 'fun', 'disappoint', 'sad', 'mad', 'upset', 'i know', 'i get it', 'i hear', 'understand', 'hug', 'hold her', 'sit', 'next to her', 'beside her', 'name the feeling']);
          var opts = h(t, [' or ', 'two options', 'two choices', 'choose', 'pick', 'you decide', 'which']);
          var no = h(t, ['i told you', 'you had', 'i gave you', 'i warned', 'you knew', 'you agreed', 'punish', 'time out', 'timeout', 'consequence', 'no more', 'take away', 'lost', 'stop crying', 'big girl', 'no big deal', 'just a playground']);
          var okS = p === 'emo', okC = (conn || opts) && !no;
          var mv = no ? 'Reasons and consequences still can\u2019t land: she\u2019s asking \u201cAm I still loved?\u201d Connection first: name the feeling.'
            : conn && opts ? 'And you gave her connection: you named the feeling and gave her a say. That answers \u201cAm I still loved?\u201d'
            : conn ? 'Naming the feeling is the right move. Two options can come next, so she gets a say in how you leave.'
            : opts ? 'Two options gives her a say. Name the feeling first, so she knows you get it.'
            : 'What she needs now is connection: Name the Feeling, or Give Two Options.';
          var st = okS ? 'Yes. She\u2019s climbed to the Emotional State: the dirt is down, and the words are back. '
            : p === 'surv' ? 'Look at her body: the throwing has stopped. Sobbing and \u201cI never get to\u2026\u201d are the Emotional State. She\u2019s climbed one step. '
            : 'Not yet. She\u2019s calmer, but sobbing and \u201cI never get to finish anything\u201d are the Emotional State. She can\u2019t problem-solve yet. ';
          return { ok: okS && okC, oks: [okS, okC], t: st + mv };
        } },
      /* 20 Oct [MARC]: the top of the climb is assessed too (LO3). */
      { id: '2f', type: 'pick', tag: 'Next time', beatK: 'In the car',
        beat: 'You\u2019ve made it to the car. She\u2019s buckled in, calm, looking out the window. \u201cCan we come back tomorrow?\u201d',
        label: 'She\u2019s calm. What now?', pickQ: 'Which state is she in now?', textLabel: 'What would you say now?', ph: 'Now that she\u2019s calm, I\u2019d say\u2026',
        model: '\u201cLeaving was really hard today. Next time I say five minutes, you get to pick your last slide. Which one will it be?\u201d',
        crit: [['You saw her back in the Executive State.', 'Her state: she\u2019s back in the Executive State.'], ['You used the calm to teach for next time.', 'Next time: teach the skill, a limit for next time, or solve it together.']],
        ev: function (p, t) {
          var teach = h(t, ['next time', 'tomorrow', 'what could', 'what can we', 'what would help', 'lets figure', 'lets think', 'lets plan', 'figure out', 'a plan', 'idea', 'you can say', 'you could say', 'you can tell me', 'when you feel', 'when its time', 'instead', 'pick your last', 'last slide', 'last turn', 'one more', 'practice', 'together', 'throwing dirt hurts', 'dirt hurts', 'not for throwing', 'ask me', 'try']);
          var no = h(t, ['punish', 'time out', 'timeout', 'consequence', 'no playground', 'no more playground', 'never again', 'take away', 'lost', 'you ruined', 'embarrass', 'bad girl', 'you should be', 'ashamed', 'next time we wont', 'not coming back']);
          var okS = p === 'exec', okT = teach && !no;
          var st = okS ? 'Yes. She\u2019s back in the Executive State: calm, talking, asking about tomorrow. Her thinking brain is online. '
            : p === 'emo' ? 'Look again: she\u2019s calm, and she\u2019s asking a question about tomorrow. That\u2019s the Executive State. She\u2019s climbed all the way back. '
            : 'Not anymore. She\u2019s quiet, buckled in, asking about tomorrow. That\u2019s the Executive State. ';
          var mv = no ? 'A consequence now would feel like the drop all over again. Now is the time to teach, not to punish: the skill she was missing, a limit for next time, or a plan together.'
            : okT ? 'And you used the calm to teach for next time. Now it can land.'
            : 'This is the moment to teach, while she can listen and think: The Missing Skill, Limits for Next Time, or Problem Solving.';
          return { ok: okS && okT, oks: [okS, okT], t: st + mv };
        } }
    ] }
  };

  /* ---- state ----------------------------------------------------------- */
  function B() { var b = S.get().bit || {}; ['val', 'asked', 'pick', 'conf', 'self', 'cont', 'band'].forEach(function (k) { b[k] = b[k] || {}; }); return b; }
  function put(k, id, v) { var b = B(), o = {}, x; for (x in b[k]) o[x] = b[k][x]; o[id] = v; b[k] = o; S.set({ bit: b }); }
  function reduced() { return !!(FX && FX.reduced && FX.reduced()); }
  function fade(nd, ms, delay) { if (nd && nd.animate && !reduced()) nd.animate([{ opacity: 0, translate: '0 6px' }, { opacity: 1, translate: '0 0' }], { duration: ms || 320, delay: delay || 0, easing: 'ease-out', fill: 'backwards' }); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  function done(st) {
    var b = B();
    if (st.type === 'self') return !!(b.self[st.id] || b.conf[st.id] === 'yes');
    return !!(b.asked[st.id] && b.cont[st.id]);
  }
  function result(st) { var b = B(); return b.asked[st.id] ? st.ev(b.pick[st.id], b.asked[st.id]) : null; }
  function modelLabel(st, r) {
    var a = B().asked[st.id] || '';
    if (!a.trim() || blankish(a)) return 'One thing you could say';
    if (r && r.ok) return 'Another way you could word that';
    return 'One more thing you could say';
  }
  function coachImg(ok) { return IMG + (ok ? 'coach-encouraging.png' : 'coach-thinking.png'); }

  /* ---- one scenario ---------------------------------------------------- */
  function scenario(host) {
    var key = host.getAttribute('data-bit'), sc = SCN[key];
    var list = host.querySelector('[data-bit-steps]'), tail = host.querySelector('[data-bit-tail]');
    var total = sc.steps.length;

    function stepNode(st, i) {
      var b = B(), v = b.val[st.id] || '', a = b.asked[st.id], p = b.pick[st.id];
      var sec = el('section', 'bt-step'); sec.setAttribute('data-step-id', st.id);
      if (st.beat) {
        var bt = el('div', 'bt-beat'); bt.setAttribute('data-k', 'surv');
        bt.appendChild(el('p', 'bt-beat-k', st.beatK)); bt.appendChild(el('p', 'bt-beat-t', st.beat));
        sec.appendChild(bt);
      }
      sec.appendChild(el('p', 'bt-k', 'Step ' + (i + 1) + ' of ' + total + ' \u00b7 ' + st.tag));
      var q = el('p', 'bt-q', st.label); q.id = 'bt-q-' + st.id; sec.appendChild(q);
      if (st.type === 'pick') {
        if (st.pickQ) sec.appendChild(el('p', 'bt-sub', st.pickQ));
        var g = el('div', 'bt-picks'); g.setAttribute('role', 'group'); g.setAttribute('aria-labelledby', q.id);
        ['surv', 'emo', 'exec'].forEach(function (k) {
          var btn = el('button', 'bt-pick'); btn.type = 'button'; btn.setAttribute('data-k', k);
          btn.setAttribute('aria-pressed', p === k ? 'true' : 'false');
          var im = el('img'); im.src = IMG + C[k].img; im.alt = ''; im.draggable = false;
          btn.appendChild(im); btn.appendChild(el('span', null, C[k].name));
          btn.addEventListener('click', function () { H.tap(); put('pick', st.id, k); put('asked', st.id, ''); paint(st.id); });
          g.appendChild(btn);
        });
        sec.appendChild(g);
        sec.appendChild(el('p', 'bt-sub', st.textLabel));
      }
      var ta = el('textarea', 'qz-field bt-in'); ta.rows = 3; ta.value = v; ta.placeholder = st.ph;
      ta.setAttribute('aria-label', st.type === 'pick' ? st.textLabel : st.label);
      ta.addEventListener('input', function () { put('val', st.id, ta.value); sendBtn.disabled = !canSend(); });
      ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send(); } });
      sec.appendChild(ta);
      var row = el('div', 'bt-row'), sendBtn = el('button', 'btn', a ? 'Send again' : 'Send');
      sendBtn.type = 'button';
      function canSend() { return st.type === 'pick' ? !!B().pick[st.id] : !!ta.value.trim(); }
      sendBtn.disabled = !canSend();
      function send() {
        if (!canSend()) return;
        H.tap();
        var t = ta.value;
        if (st.type === 'self') { put('asked', st.id, read(t) || 'none'); put('conf', st.id, null); put('self', st.id, null); }
        else put('asked', st.id, t.trim() ? t : ' ');
        paint(st.id, 'coach');
      }
      sendBtn.addEventListener('click', send);
      row.appendChild(sendBtn);
      row.appendChild(el('span', 'bt-keys', 'or \u2318/Ctrl + Return'));
      sec.appendChild(row);
      var c = coachNode(st);
      if (c) sec.appendChild(c);
      if (st.type !== 'self' && a && !b.cont[st.id]) {
        var go = el('button', 'bt-cont'); go.type = 'button';
        go.innerHTML = '<span>Continue</span><i aria-hidden="true"></i>';
        go.addEventListener('click', function () { H.tap(); put('cont', st.id, true); paint(st.id, 'next'); });
        sec.appendChild(go);
      }
      return sec;
    }

    function coachNode(st) {
      var b = B(), a = b.asked[st.id];
      if (!a) return null;
      var box = el('aside', 'coach-says bt-coach'); box.setAttribute('aria-live', 'polite');
      var fig = el('img', 'coach-fig'); fig.alt = ''; fig.width = 56; fig.height = 84;
      var txt = el('div', 'coach-txt');
      txt.appendChild(el('p', 'coach-k', 'Coach says'));
      box.appendChild(fig); box.appendChild(txt);
      if (st.type === 'self') {
        if (a === 'none') { fig.src = coachImg(false); txt.appendChild(el('p', 'coach-t', MORE)); return box; }
        fig.src = coachImg(true);
        txt.appendChild(el('p', 'coach-t', st.says[a]));
        var mine = b.self[st.id] || (b.conf[st.id] === 'yes' ? a : null);
        if (!b.conf[st.id]) {
          var yn = el('div', 'bt-yn');
          [['Yes, that\u2019s me', 'yes'], ['Not quite', 'no']].forEach(function (o) {
            var btn = el('button', 'btn btn-quiet', o[0]); btn.type = 'button';
            btn.addEventListener('click', function () { H.tap(); put('conf', st.id, o[1]); paint(st.id, o[1] === 'yes' ? 'next' : null); });
            yn.appendChild(btn);
          });
          txt.appendChild(yn);
        }
        if (b.conf[st.id] === 'no' && !b.self[st.id]) {
          txt.appendChild(el('p', 'coach-t', 'You know yourself best. Which is closest?'));
          var sb = el('div', 'bt-yn');
          ['surv', 'emo', 'exec'].forEach(function (k) {
            var btn = el('button', 'bt-selfpick', C[k].name); btn.type = 'button'; btn.setAttribute('data-k', k);
            btn.addEventListener('click', function () { H.tap(); put('self', st.id, k); paint(st.id, 'next'); });
            sb.appendChild(btn);
          });
          txt.appendChild(sb);
        }
        if (mine) txt.appendChild(el('p', 'coach-t', ((b.self[st.id] && b.self[st.id] !== a) ? 'Thanks. You know yourself better than I do. ' : '') + st.first[mine]));
        return box;
      }
      var r = st.ev(b.pick[st.id], a);
      fig.src = coachImg(r.ok);
      txt.appendChild(el('p', 'coach-t', r.t));
      if (st.model) {
        var m = el('div', 'bt-model');
        m.appendChild(el('p', 'bt-model-k', modelLabel(st, r)));
        m.appendChild(el('p', 'bt-model-t', st.model));
        txt.appendChild(m);
      }
      return box;
    }

    function bandNode() {
      var crit = [], oks = [];
      sc.steps.filter(function (st) { return st.crit; }).forEach(function (st) {
        var cl = Array.isArray(st.crit[0]) ? st.crit : [st.crit], r = result(st);
        cl.forEach(function (c, j) { crit.push(c); oks.push(!!r && (r.oks ? !!r.oks[j] : r.ok)); });
      });
      var nOk = oks.filter(Boolean).length;
      var bk = nOk === crit.length ? 'strong' : nOk >= Math.ceil(crit.length / 2) ? 'nearly' : 'notyet';
      if (B().band[key] !== bk) put('band', key, bk);
      var NAME = { strong: 'Strong', nearly: 'Nearly there', notyet: 'Not yet' };
      var box = el('div', 'bt-band');
      var hd = el('div', 'bt-band-h');
      hd.appendChild(el('span', 'bt-band-w', sc.where));
      var pill = el('span', 'bt-pill', NAME[bk]); pill.setAttribute('data-band', bk); hd.appendChild(pill);
      box.appendChild(hd);
      crit.forEach(function (c, i) {
        var r = el('div', 'bt-crit'); r.setAttribute('data-ok', oks[i] ? 'yes' : 'no');
        r.appendChild(el('span', 'bt-mark', oks[i] ? '\u2713' : '\u2192'));
        r.appendChild(el('span', null, oks[i] ? c[0] : c[1]));
        box.appendChild(r);
      });
      box.appendChild(el('p', 'bt-band-note', 'Change any answer above and send it again; the band updates.'));
      return box;
    }

    /* Rebuild the steps. `at` is the step that changed; `what` says where
       to take the parent: its new Coach box, or the step that just opened. */
    function paint(at, what) {
      list.innerHTML = ''; tail.innerHTML = '';
      var shown = 0;
      for (var i = 0; i < total; i++) { list.appendChild(stepNode(sc.steps[i], i)); shown = i; if (!done(sc.steps[i])) break; }
      var all = sc.steps.every(done);
      if (all) {
        tail.appendChild(bandNode());
        var nx = el('div'), btn = el('button', 'btn', sc.nextLabel); btn.type = 'button'; btn.setAttribute('data-show', sc.next);
        nx.appendChild(btn); tail.appendChild(nx);
      }
      if (!at) return;
      var me = list.querySelector('[data-step-id="' + at + '"]');
      if (what === 'coach' && me) {
        var c = me.querySelector('.bt-coach'); fade(c, 360);
        if (window.CDAH_FIT) window.CDAH_FIT(c, me.querySelector('.bt-cont') || c);
      }
      if (what === 'next') {
        var nxt = me && me.nextElementSibling;
        if (nxt) { fade(nxt, 420); if (window.CDAH_FIT) window.CDAH_FIT(nxt, nxt.querySelector('.bt-in') || nxt); var f = nxt.querySelector('.bt-pick, .bt-in'); if (f) f.focus({ preventScroll: true }); }
        else if (all) { fade(tail, 420); if (window.CDAH_FIT) window.CDAH_FIT(tail, tail); }
      }
    }
    return { paint: paint };
  }

  var views = {};
  Array.prototype.forEach.call(hosts, function (hst) { views[hst.closest('section').id] = scenario(hst); });

  /* ---- Look back (scr-209) ----------------------------------------------
     19 Oct [MARC]: its own screen, on the dark ground, because it comes back
     to 7:40. A parent who skipped the opening question gets their own copy:
     the "Then" box stays empty and the question asks what they'd say now. */
  var look = document.getElementById('scr-209');
  function paintLook() {
    if (!look) return;
    var a = S.get().answers || {}, hook = typeof a.baseline === 'string' ? a.baseline.trim() : '';
    var now = (B().asked['2d'] || '').trim();
    look.querySelectorAll('[data-lb-had]').forEach(function (n) { n.hidden = !hook; });
    look.querySelectorAll('[data-lb-skip]').forEach(function (n) { n.hidden = !!hook; });
    look.querySelector('[data-lb-then]').textContent = hook ? '\u201C' + hook + '\u201D' : '';
    look.querySelector('[data-lb-now]').textContent = now ? '\u201C' + now + '\u201D' : '';
    var f = look.querySelector('[data-lb-field]');
    if (document.activeElement !== f) f.value = B().a5 || '';
  }
  if (look) {
    var lf = look.querySelector('[data-lb-field]');
    lf.addEventListener('input', function () { var b = B(); b.a5 = lf.value; S.set({ bit: b }); });
  }

  (window.CDAH_AFTER_SHOW = window.CDAH_AFTER_SHOW || []).push(function (id) {
    if (views[id]) views[id].paint();
    if (id === 'scr-209') paintLook();
  });
  document.addEventListener('cdah:restart', function () { Object.keys(views).forEach(function (k) { views[k].paint(); }); paintLook(); });
  Object.keys(views).forEach(function (k) { views[k].paint(); });
  paintLook();
})();
