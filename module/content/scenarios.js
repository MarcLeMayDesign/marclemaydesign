/* content/scenarios.js — Try It Out, the role-plays.
   THIS IS A FILE YOU EDIT. Text between the quote marks is yours.

   SCN-301, SCN-302 (the pickup line) and SCN-303 (the shoes) are all wired. Maya is the
   child in all three (Marc, 30 Sept).

   How a scene runs
     The child sits at one of four levels, and the pose rail shows it:
       0 survival (overwhelmed)  1 emotional (upset)  2 ready  3 contented
     Each thing the parent says is scored silently against the four
     criteria. What was hit decides where she goes next (js/roleplay.js,
     step()), and that decides her reply and the coach's margin note.
     Nothing is scored on screen during the scene: no ticks, no numbers.

   criteria   accept lists, same rules as the quiz: lowercase, apostrophes
              dropped ("youre", "its", "dont"). `composure` is the other way
              round: its list is what BREAKS composure, and so is shouting
              (a word of three or more letters in capitals, or "!!").
   replies    keyed "level:what happened". Her line, then the coach's note.
              The note names the move and never a number.
   words      the Words to try strip, by her state (20 Oct [MARC]): surv = Learn
              4.1's moves, emo = 4.3's (the limit folded into Give Two Options),
              exec = 4.5's. It appears after her first reply.
   safe / describe / breathe / exec   optional extra accept lists; the shared
              ones are in js/roleplay.js (BASE).
   results    the end screen. Composure failing replaces everything else:
              one row to start with, the other moves greyed out.
   Reaching the Executive State always earns one more line, to teach for
   next time. That line ends the scene (replies 3:exec, 3:none, 3:fail).

   NOTE, for Marc: the Strong and plain Not yet results heads, and every
   reply except the three taken from the read-through and the pose
   prototype, are new copy. Marked NEW below. */

window.CDAH_SCENES = {

  'scn-301': {
    start: 1,
    maxTurns: 3,
    opening: 'Five more minutes. FIVE MORE MINUTES. I\u2019m almost done!',
    child: 'Maya',
    /* The field's placeholder on the parent's final reply, so the end of the
       scene never arrives as a surprise. */
    lastPrompt: 'Your last reply.',  // NEW

    criteria: {
      composure: {
        breaks: ['or else', 'right now or', 'no tablet for', 'no more tablet for', 'for a week',
                 'rest of the week', 'im taking it', 'i will take it', 'ill take it', 'take it away',
                 'taking it away', 'because i said', 'i said so', 'how many times', 'ask twice',
                 'told you already', 'dont make me', 'last warning', 'im counting', 'one two three',
                 '1 2 3', 'grounded', 'punish', 'naughty', 'bad girl', 'spoiled', 'ungrateful',
                 'stop whining', 'shut up', 'i dont care', 'you never listen',
                 'you always', 'or you lose', 'or youll lose',
                 /* Draft 2 (Marc): guilt aimed back at her. */
                 'you make me', 'is how i feel', 'how i feel when you', 'what about me']
      },
      connect: {
        accept: ['hard to stop', 'really hard', 'so hard', 'its hard', 'thats hard', 'tough',
                 'you really want', 'you want to', 'you wish', 'you wanted', 'you love',
                 'having fun', 'so fun', 'fun game', 'in the middle', 'almost done',
                 'i know', 'i can see', 'i get it', 'i understand', 'i hear you',
                 'sad', 'upset', 'frustrated', 'disappointed', 'mad', 'annoying', 'feel',
                 'feeling', 'dont want to stop', 'dont want it to end', 'hate stopping',
                 'hate having to stop']
      },
      limit: {
        accept: ['time to stop', 'time to turn', 'turn it off', 'switch it off', 'switching it off',
                 'turning it off', 'goes off', 'going off', 'screen time is over',
                 'screen time is done', 'time is up', 'times up', 'all done', 'tablet is done',
                 'put it away', 'its time', 'time for dinner', 'dinner time', 'dinners ready',
                 'finished for today', 'no more tablet', 'enough tablet', 'thats enough for today', 'tablet time is over', 'were stopping',
                 'we are stopping', 'stopping now', 'it has to stop', 'has to go off',
                 'the tablet is going', 'need to stop', 'have to stop',
                 /* Draft 2 (Marc: "your forty minutes are up"). */
                 'are up', 'is up', 'minutes are up', 'time is over', 'all finished', 'done for today',
                 'done now', 'off now', 'turn off', 'shut it off', 'tablet off', 'no more', 'stop now',
                 'time to', 'were done', 'we are done', 'thats it for', 'thats enough']
      },
      choices: {
        accept: ['or you can', 'you pick', 'you choose', 'you can choose', 'which one',
                 'which do you', 'would you rather', 'do you want to', 'would you like to',
                 'your choice', 'you decide', 'either', 'or turn it off', 'or pause',
                 'pause it or', 'save it or', 'or save']
      }
    },

    /* Words to try: the strip above the answer field. One phrase per move,
       in the order they work. `what` is the small label, `say` is the line
       that goes into the field. Each `say` is checked against the accept
       lists above, so using one really does count. */
    words: {
      surv: [
        { what: 'Make It Safe',      say: 'I won\u2019t let you kick the couch. I\u2019m right here.' },
        { what: 'Describe the Scene', say: 'You\u2019re face-down in the cushion, and your feet are kicking.' },
        { what: 'Breathe Together',  say: 'I\u2019m taking a slow breath. Breathe with me if you want.' } ],
      emo: [
        { what: 'Name the Feeling',  say: 'It\u2019s really hard to stop when you\u2019re almost done.' },
        { what: 'Give Two Options',  say: 'The tablet is going off now. You can pause it or save it. You pick.' } ],
      exec: [
        { what: 'The Missing Skill',    say: 'When it\u2019s hard to stop, you can say, \u201cI need one minute to save it.\u201d' },
        { what: 'Limits for Next Time', say: 'Tomorrow, when the timer rings, the tablet goes off.' },
        { what: 'Problem Solving',      say: 'Stopping was really hard tonight. What could help tomorrow?' } ]
    },

    replies: {
      '1:fail':        { child: '(she throws herself face-down on the couch) NO! You\u2019re so MEAN!',
                         again: '(face still in the cushion) Go AWAY! I DON\u2019T wanna talk to you!',  // NEW
                         note: 'She heard the heat, not the words.' },               // NEW
      '1:none':        { child: 'Five more minutes! Please please please!',
                         again: '(louder) Please! Just FIVE!',  // NEW
                         note: 'Nothing here names what she\u2019s feeling yet.' },   // NEW
      '1:limitOnly':   { child: 'But I\u2019m ALMOST DONE. Just five minutes!',
                         again: 'You\u2019re not even listening to me!',  // NEW
                         note: 'The limit is clear, but it arrived before she felt heard.' }, // NEW
      '1:connect':     { child: 'So then I can finish it. You said it\u2019s hard, so let me finish it.',
                         note: 'You named what she was feeling before you named the rule.' },
      '2:fail':        { child: '(her voice goes up) You ALWAYS do this!',
                         again: '(arms crossed) I\u2019m not talking to you.',  // NEW
                         note: 'You had her, and then the heat came back into it.' },  // NEW
      '2:connectAgain':{ child: 'Yeah. So I can finish it, right?',
                         again: 'Mm-hm. But I can finish, right?',  // NEW
                         note: 'She knows you understand. Now she needs to hear what happens next.' }, // NEW
      '2:limitOnly':   { child: 'But it\u2019s not fair. I\u2019m almost done.',
                         again: '(quieter) It\u2019s still not fair.',  // NEW
                         note: 'The limit is said. Nothing in it gives her a way to move.' }, // NEW
      '2:choicesOnly': { child: 'Okay, I pick\u2026 five more minutes!',
                         again: 'I choose\u2026 not stopping!',  // NEW
                         note: 'Choices without the limit said out loud turn into a negotiation.' }, // NEW
      '2:both':        { child: '(a big sigh) Fine. \u2026Can I finish it tomorrow?',  // NEW 2 Oct: no longer names a choice she may not have been given
                         note: 'Two real choices inside one limit, and she stopped.' },
      '0:still':       { child: '(she turns away from you)',
                         again: '(she pulls a cushion over her head)',  // NEW
                         note: 'She\u2019s past words. Keep your voice low and slow, and keep it short.' }, // NEW
      '0:fail':        { child: '(she screams into the cushion)',  // 2 Oct: there was no reply here, so a second sharp line stalled the scene
                         again: '(she kicks the arm of the couch, face still hidden)',
                         note: 'She was already past words, and that pushed her further away.' },
      '0:calm':        { child: '(still face-down, quieter) \u2026I was almost done.',
                         note: 'Your calm reached her before any words did.' },       // NEW
      '3:exec':        { child: '(leaning on you) \u2026Can I set the timer myself tomorrow?',
                         note: 'She was calm enough to learn, and you taught for next time.' },
      '3:none':        { child: '(she hands you the tablet) \u2026Okay.',
                         note: 'She stopped. Now that she\u2019s calm is the time to teach for next time.' },
      '3:fail':        { child: '(she pulls away) You\u2019re still MAD at me.',
                         note: 'She\u2019d made it back up, and the heat in that brought her down again.' }
    },

    results: {
      strong:    { head: 'She stopped, and nobody lost',                             // NEW
                   body: 'You named the feeling, gave her two ways to stop inside the limit, and used the calm after to teach for next time \u2014 without your voice going up.' },
      /* Strong, reached mostly on the Words to try cards sent as written (two
         or more phrases). Same band, same ticks. The Coach names what each
         phrase did and asks for the parent's own words: the cards show the
         move, the parent's own words show they can make it. */
      cards:     { head: 'She stopped, and nobody lost',
                   coach: 'Those were my words, and they worked. Now try it again in your own \u2014 yours are the ones you\u2019ll have at bath time.' }, // NEW
      nearly:    { head: 'You stayed with her' },
      notyet:    { head: 'She\u2019s still in the middle of it',                     // NEW
                   body: 'The scene ended with her still stuck. Start with the first row below that isn\u2019t ticked \u2014 the others build on it.' },
      composure: { head: 'This one got away from you',
                   body: 'Once your voice went up, she heard the anger, not the limit. Anything good you said after that didn\u2019t reach her.',
                   frame: '<strong>The old frame.</strong> She\u2019s testing me and I need to win this. What\u2019s actually happening: she\u2019s five, she\u2019s absorbed in something, and her brain hasn\u2019t finished the part that makes stopping easy.' }
    },

    rows: {
      composure: { hit: 'You kept your own composure \u2014 no threat, no raised voice, no bargaining the limit away.',
                   miss: 'Compose Yourself \u2014 start here next time. The other moves only work from a calm voice.',
                   name: 'Compose Yourself' },
      surv:      { miss: 'She stayed in the Survival State. There, she needs to feel safe before anything else: Make It Safe, Describe the Scene, or Breathe Together.',
                   name: 'Make It Safe, Describe the Scene, Breathe Together' },
      connect:   { hit: 'You connected before correcting.',
                   miss: 'Her feeling didn\u2019t get named before the rule.',
                   name: 'Name the Feeling' },
      choices:   { hit: 'You gave her two ways to stop, inside the limit.',
                   miss: 'No two options inside a limit. If you only sympathize and never say the limit, a five-year-old hears \u201cyes.\u201d Say the limit, then two acceptable ways to stop.',
                   nolimit: 'You offered choices, but the limit wasn\u2019t said, so they turned into a negotiation. Two options sit inside a limit you\u2019ve said out loud.',
                   early: 'You offered choices, but before she felt heard, so she couldn\u2019t use them yet.',
                   name: 'Give Two Options' },
      exec:      { hit: 'Once she was calm, you used it to teach for next time.',
                   miss: 'She got to the Executive State, and that was the moment to teach: The Missing Skill, Limits for Next Time, or Problem Solving.',
                   name: 'The Missing Skill, Limits for Next Time, Problem Solving' }
    }
  },

  /* ===== SCN-302 · Scenario 2 · The pickup line (NEW, 30 Sept) ==========
     Marc's scene: the parent's own hurt. Maya, the same child all week.
     Parked in the pickup line, so you can turn round but can't get down to
     her level: the voice carries all of it.
     20 Oct [MARC]: she starts in the Emotional State, words only, and won't
     buckle. A sharp reply drops her to Survival, and only then does the
     kicking start (Learn 3.1: kicking is fight). The limit is the buckle. */
  'scn-302': {
    start: 1,
    maxTurns: 3,
    opening: '(arms crossed, glaring out the window, buckle not done) I don\u2019t want YOU! I wanted Grandma to pick me up, not YOU!',
    child: 'Maya',
    lastPrompt: 'Your last reply.',

    criteria: {
      composure: {
        breaks: ['fine then', 'grandma can', 'go with grandma', 'hurts my feelings', 'hurt my feelings',
                 'you hurt me', 'makes me sad', 'make me sad', 'made me sad', 'makes mommy sad', 'makes daddy sad',
                 'thats not nice', 'thats rude', 'so rude', 'ungrateful', 'after everything', 'all this way',
                 'should be grateful', 'be grateful', 'how dare', 'dont talk to me', 'watch your tone',
                 'or else', 'no tv', 'no tablet', 'no screen', 'no treat', 'no snack', 'im counting',
                 'one two three', '1 2 3', 'last warning', 'because i said', 'i said so', 'naughty',
                 'bad girl', 'spoiled', 'i dont care', 'you always', 'you never', 'stop it right now',
                 /* Draft 2 (Marc): sarcasm and guilt aimed back at her. */
                 'whats great about', 'what is great about', 'whats special about', 'better than me', 'what about me', 'whats wrong with me',
                 'not good enough', 'you make me', 'is how i feel', 'how i feel when you']
      },
      connect: {
        accept: ['you wanted grandma', 'wanted it to be grandma', 'you were hoping', 'hoping', 'you wish', 'wished',
                 'miss grandma', 'you miss', 'disappointed', 'disappointing', 'disappointment', 'not who you expected',
                 'expected', 'thought grandma', 'surprise', 'long day', 'hard day', 'big day', 'tired', 'upset',
                 'mad', 'frustrated', 'sad', 'i know', 'i hear you', 'i get it', 'i understand', 'makes sense',
                 'feel', 'feeling', 'big feelings', 'you love grandma', 'love grandma']
      },
      limit: {
        accept: ['buckle', 'buckled', 'seatbelt', 'seat belt', 'straps', 'clip', 'click it', 'before we drive',
                 'before i drive', 'cant drive', 'can\u2019t drive', 'drive home', 'going home', 'were going home',
                 'we are going home', 'grandma isnt', 'grandma is not', 'not coming today', 'its me today',
                 'im picking you up', 'i am picking you up', 'time to go', 'its time']
      },
      choices: {
        accept: ['or you can', 'or should i', 'or i can', 'you or me', 'yourself or', 'by yourself or', 'you pick',
                 'you choose', 'you can choose', 'which one', 'which do you', 'would you rather', 'do you want to',
                 'either', 'your choice', 'you decide', 'pick the song', 'pick the music', 'hold bun', 'squeeze bun']
      },
      safe: { accept: ['kick', 'kicking', 'feet still', 'feet down', 'keep your feet', 'safely', 'safety', 'my seat'] }
    },

    words: {
      surv: [
        { what: 'Make It Safe',      say: 'I won\u2019t let you kick my seat. I\u2019m right here.' },
        { what: 'Describe the Scene', say: 'Your feet are kicking hard, and your face is all scrunched up.' },
        { what: 'Breathe Together',  say: 'I\u2019m taking a big breath. Want to do your school breath with me?' } ],
      emo: [
        { what: 'Name the Feeling',  say: 'You were hoping it\u2019d be Grandma today. That\u2019s a big disappointment.' },
        { what: 'Give Two Options',  say: 'Your buckle goes on before we drive. Do you want to click it yourself, or should I? You pick.' } ],
      exec: [
        { what: 'The Missing Skill',    say: 'When you\u2019re disappointed, you can tell me, \u201cI wanted Grandma.\u201d I\u2019ll listen.' },
        { what: 'Limits for Next Time', say: 'Next time, the buckle goes on first, even when you\u2019re sad.' },
        { what: 'Problem Solving',      say: 'You really miss Grandma. What could we do to see her this week?' } ]
    },

    replies: {
      '1:fail':        { child: '(she starts kicking the back of your seat, hard) I want GRANDMA!',
                         again: '(kick, kick) Go AWAY!',
                         note: 'She heard the sting in your voice, not the words, and the kicking started.' },
      '1:none':        { child: 'I don\u2019t WANT you! I want GRANDMA!',
                         again: '(louder) GRANDMA!',
                         note: 'Nothing yet names what she was hoping for.' },
      '1:limitOnly':   { child: 'But I WANTED Grandma.',
                         again: 'You don\u2019t even care.',
                         note: 'The limit is clear, but it arrived before she felt heard.' },
      '1:connect':     { child: '(her arms loosen) \u2026Grandma always brings the fruit snacks.',
                         note: 'You named what she was hoping for, and you didn\u2019t take \u201cnot you\u201d personally.' },
      '2:fail':        { child: '(arms crossed again) See? You\u2019re MEAN. That\u2019s why I want Grandma.',
                         again: '(turning to the window) I\u2019m not talking to you.',
                         note: 'You had her, and then the hurt came through.' },
      '2:connectAgain':{ child: 'Yeah. Can we go to Grandma\u2019s house?',
                         again: '(buckle still undone) Can we, though?',
                         note: 'She knows you understand. Now she needs to hear what happens next.' },
      '2:limitOnly':   { child: '(holding the buckle, not clicking it) But I don\u2019t WANT to go home.',
                         again: '(quieter) I still don\u2019t want to.',
                         note: 'The limit is said. Nothing in it gives her a way to move.' },
      '2:choicesOnly': { child: 'I pick\u2026 Grandma\u2019s house!',
                         again: 'I choose no buckle!',
                         note: 'Choices without the limit said out loud turn into a negotiation.' },
      '2:both':        { child: '(click) \u2026Can we get fruit snacks?',
                         note: 'Two real choices inside one limit, and the buckle went on.' },
      '0:still':       { child: '(she screams and kicks with both feet)',
                         again: '(she buries her face in her backpack)',
                         note: 'She\u2019s past words. Keep your voice low and slow, and keep it short. You don\u2019t have to drive off yet.' },
      '0:fail':        { child: '(she screams) GO AWAY!',
                         again: '(she kicks with both feet, hard)',
                         note: 'She was already past words, and that pushed her further away.' },
      '0:calm':        { child: '(the kicking slows, quieter) \u2026I wanted Grandma.',
                         note: 'Your calm reached her before any words did.' },
      '3:exec':        { child: '(holding Bun-Bun, quieter) \u2026Can Grandma come on Saturday?',
                         note: 'She was calm enough to learn, and you used it.' },
      '3:none':        { child: '(she looks out the window) \u2026Okay. Let\u2019s go.',
                         note: 'She\u2019s ready. Now that she\u2019s calm is the time to teach for next time.' },
      '3:fail':        { child: '(her face crumples) You\u2019re still MAD.',
                         note: 'She\u2019d made it back up, and the sting in that brought her down again.' }
    },

    results: {
      strong:    { head: 'It wasn\u2019t about you, and you knew it',
                   body: 'You heard the disappointment, gave her two ways to buckle up inside the limit, and used the calm to teach for next time. And you didn\u2019t take \u201cnot you\u201d personally.' },
      cards:     { head: 'It wasn\u2019t about you, and you knew it',
                   coach: 'Those were my words, and they worked. Now try it again in your own.' },
      nearly:    { head: 'You stayed with her' },
      notyet:    { head: 'She\u2019s still stuck on Grandma',
                   body: 'The scene ended with her still stuck. Start with the first row below that isn\u2019t ticked \u2014 the others build on it.' },
      composure: { head: 'This one got under your skin',
                   body: '\u201cNot you\u201d is built to sting, and it did. That\u2019s normal. But once your voice changed, she heard the hurt, not the limit, and her feelings had nowhere to go but her feet.',
                   frame: '<strong>The old frame.</strong> She\u2019s rejecting me, and she needs to know it hurt. What\u2019s actually happening: she held it together all day. Kids often fall apart with the person they feel safest with. It feels like rejection, but it means she trusts you.' }
    },

    rows: {
      composure: { hit: 'You kept your composure \u2014 you didn\u2019t take \u201cnot you\u201d personally, and nothing you said asked her to look after your feelings.',
                   miss: 'Compose Yourself \u2014 start here next time. The other moves only work from a calm voice.',
                   name: 'Compose Yourself' },
      surv:      { miss: 'She stayed in the Survival State. There, she needs to feel safe before anything else: Make It Safe, Describe the Scene, or Breathe Together.',
                   name: 'Make It Safe, Describe the Scene, Breathe Together' },
      connect:   { hit: 'You named what she was hoping for.',
                   miss: 'What she was hoping for didn\u2019t get named.',
                   name: 'Name the Feeling' },
      choices:   { hit: 'You gave her two ways to buckle up, inside the limit.',
                   miss: 'No two options inside a limit. Say the limit (the buckle goes on), then two acceptable ways to do it.',
                   nolimit: 'You offered choices, but the limit wasn\u2019t said, so they turned into a negotiation. Two options sit inside a limit you\u2019ve said out loud.',
                   early: 'You offered choices, but before she felt heard, so she couldn\u2019t use them yet.',
                   name: 'Give Two Options' },
      exec:      { hit: 'Once she was calm, you used it to teach for next time.',
                   miss: 'She got to the Executive State, and that was the moment to teach: The Missing Skill, Limits for Next Time, or Problem Solving.',
                   name: 'The Missing Skill, Limits for Next Time, Problem Solving' }
    }
  },

  /* ===== SCN-303 · Scenario 3 · The shoes (NEW, 30 Sept) ================
     The capstone: the 7:40 morning from the very first screen, played live.
     What the parent says here is what the Bookend (SCR-304) puts beside
     their first answer. Structure after the original spec; wording new. */
  'scn-303': {
    /* 16 Oct: opens on the Hook line, so Maya starts in the Survival State,
       as at 7:40 in Learn (3.2). One more turn for the climb. */
    start: 0,
    maxTurns: 4,
    opening: '(her shoe hits the wall, and she kicks your hand away) NO! I\u2019m NOT going to school!',
    child: 'Maya',
    lastPrompt: 'Your last reply.',

    criteria: {
      composure: {
        breaks: ['or else', 'no tv', 'no tablet', 'no screen', 'no treat', 'acting like a baby', 'like a baby',
                 'big girls', 'stop being', 'ridiculous', 'because i said', 'i said so', 'how many times',
                 'told you already', 'last warning', 'im counting', 'one two three', '1 2 3', 'ill give you',
                 'if you put them on ill', 'sticker if', 'candy if', 'treat if', 'dont make me', 'i dont care',
                 'you always', 'you never', 'naughty', 'bad girl', 'spoiled', 'right now or', 'im leaving without you',
                 'ill leave you',
                 /* Draft 2 (Marc): her word turned back on her ("Weird is how I feel when you say these things!"). */
                 'is how i feel', 'how i feel when you', 'you make me', 'when you say these', 'when you say that',
                 'when you act like', 'when you talk like']
      },
      connect: {
        accept: ['feel weird', 'feels weird', 'weird', 'scratchy', 'itchy', 'tight', 'uncomfortable', 'dont feel right',
                 'dont like how', 'you dont want', 'dont want to wear', 'hard', 'tough', 'frustrated', 'upset', 'mad',
                 'annoyed', 'i know', 'i hear you', 'i get it', 'i understand', 'i can see', 'feel', 'feeling',
                 'feels', 'hate those', 'hate them',
                 /* 16 Oct: the Hook line */
                 'dont want to go', 'not going to school', 'dont want school', 'school is hard', 'big feelings']
      },
      limit: {
        accept: ['shoes go on', 'shoes are going on', 'shoes on', 'need shoes', 'need your shoes', 'have to wear',
                 'need to wear', 'time to go', 'its time', 'the bus', 'bus is coming', 'need to leave', 'have to leave',
                 'we are leaving', 'were leaving', 'feet need', 'cant go without', 'before the bus']
      },
      /* 20 Oct: Make It Safe, for the kick, now scored as a Survival move. */
      safe: { accept: ['no kicking', 'kicking hurts', 'stop kicking', 'keep my hands safe', 'feet safe'] },
      choices: {
        accept: ['left or right', 'left one or', 'right one or', 'which shoe', 'which one first', 'you or me',
                 'by yourself or', 'yourself or', 'or i can help', 'or should i', 'do you want to', 'would you rather',
                 'you pick', 'you choose', 'either', 'your choice', 'hop or', 'loose or']
      }
    },

    words: {
      surv: [
        { what: 'Make It Safe',      say: 'I won\u2019t let you kick. I\u2019m right here.' },
        { what: 'Describe the Scene', say: 'Your shoe went flying, and your feet are kicking hard.' },
        { what: 'Breathe Together',  say: 'I\u2019m taking a big belly breath. Show me your school breath?' } ],
      emo: [
        { what: 'Name the Feeling',  say: 'Those shoes feel really weird right now.' },
        { what: 'Give Two Options',  say: 'Shoes go on before the bus comes. Left one first or right one first? You pick.' } ],
      exec: [
        { what: 'The Missing Skill',    say: 'When something feels scratchy, you can show me where, and we\u2019ll fix it.' },
        { what: 'Limits for Next Time', say: 'Kicking hurts. When shoes feel wrong, you can say, \u201cHelp me.\u201d' },
        { what: 'Problem Solving',      say: 'Those shoes felt weird this morning. What could we try tomorrow?' } ]
    },

    replies: {
      '1:fail':        { child: '(she throws the other shoe) NO! You\u2019re MEAN!',
                         again: '(she pulls her feet under her) I\u2019m NOT going.',
                         note: 'She heard the hurry, not the words.' },
      '1:none':        { child: 'They\u2019re STUPID! I\u2019m not wearing them!',
                         again: '(louder) NOT wearing them!',
                         note: 'Nothing yet names what she\u2019s feeling.' },
      '1:limitOnly':   { child: 'NO! You can\u2019t MAKE me!',
                         again: '(kicks at the shoe) I\u2019m NOT going to school!',
                         note: 'The limit is clear, but it arrived before she felt heard.' },
      '1:connect':     { child: '(sniffs) \u2026It\u2019s scratchy on my big toe.',
                         note: 'You named the feeling before the rule, and she told you what was underneath.' },
      '2:fail':        { child: '(she kicks the shoe away again) You\u2019re not LISTENING!',
                         again: '(arms crossed) I\u2019m not doing it.',
                         note: 'You had her, and then the hurry came back into it.' },
      '2:connectAgain':{ child: 'Yeah. So I can just wear socks?',
                         again: 'Just socks. Please?',
                         note: 'She knows you understand. Now she needs to hear what happens next.' },
      '2:limitOnly':   { child: 'But it\u2019s SCRATCHY.',
                         again: '(quieter) It\u2019s still scratchy.',
                         note: 'The limit is said. Nothing in it gives her a way to move.' },
      '2:choicesOnly': { child: 'I pick\u2026 no shoes!',
                         again: 'I choose socks!',
                         note: 'Choices without the limit said out loud turn into a negotiation.' },
      '2:both':        { child: '(she sniffs and holds out her foot) \u2026Okay. Help me?',  // NEW 2 Oct (Marc: "Loosen my left shoe" answered a choice he never offered)
                         note: 'One limit, two ways in. The shoes went on.' },
      '0:still':       { child: '(she kicks at the air) NO! NO! NO!',  // NEW 16 Oct
                         again: '(she pulls her feet away, screaming)',
                         note: 'She\u2019s past words. Keep your voice low and slow, and keep it short, even with the bus coming.' },
      '0:fail':        { child: '(she wails and drums her heels on the rug)',
                         again: '(she rolls away from you)',
                         note: 'She was already past words, and that pushed her further away.' },
      '0:calm':        { child: '(she stops kicking and drops onto the rug, sobbing) But these shoes feel WEIRD.',  // NEW 16 Oct, Learn 4.3's line
                         note: 'Your calm reached her before any words did.' },
      '3:exec':        { child: '(wiggling her toes) \u2026Maybe the socks with no bumps?',
                         note: 'She was calm enough to learn, and you taught for next time.' },
      '3:none':        { child: '(she stands up, shoes on) \u2026Okay. Bus?',
                         note: 'Shoes on. Now that she\u2019s calm is the time to teach for next time.' },
      '3:fail':        { child: '(she sits back down) You\u2019re grumpy.',
                         note: 'She\u2019d made it back up, and the hurry in that brought her down again.' }
    },

    results: {
      strong:    { head: 'Shoes on, out the door',
                   body: 'You helped her feel safe, named the feeling, gave her two ways in inside the limit, and used the calm to teach for next time \u2014 with the bus coming, and without your voice going up.' },
      cards:     { head: 'Shoes on, out the door',
                   coach: 'Those were my words, and they worked. Now try it again in your own.' },
      nearly:    { head: 'You stayed with her' },
      notyet:    { head: 'She\u2019s still on the rug',
                   body: 'The scene ended with her still stuck. Start with the first row below that isn\u2019t ticked \u2014 the others build on it.' },
      composure: { head: 'The clock won this one',
                   body: 'With the bus coming, she heard the rush in your voice before anything else. Anything good you said after that didn\u2019t reach her.',
                   frame: '<strong>The old frame.</strong> If I don\u2019t get her out the door right now, the morning has failed. What\u2019s actually happening: you can\u2019t rush a five-year-old out of a feeling. Dealing with the feeling first is usually the fastest way out the door.' }
    },

    rows: {
      composure: { hit: 'You kept your composure \u2014 no threat, no bribe, no hurry in your voice.',
                   miss: 'Compose Yourself \u2014 start here next time. The other moves only work from a calm voice.',
                   name: 'Compose Yourself' },
      surv:      { miss: 'She stayed in the Survival State. There, she needs to feel safe before anything else: Make It Safe, Describe the Scene, or Breathe Together.',
                   name: 'Make It Safe, Describe the Scene, Breathe Together' },
      connect:   { hit: 'You named how the shoes felt before the rule.',
                   miss: 'How the shoes felt didn\u2019t get named before the rule.',
                   name: 'Name the Feeling' },
      choices:   { hit: 'You gave her two ways in, inside the limit: the shoes go on.',
                   miss: 'No two options inside a limit. If you only sympathize and never say the limit, a five-year-old hears \u201cno shoes today.\u201d',
                   nolimit: 'You offered choices, but the limit wasn\u2019t said, so they turned into a negotiation. Two options sit inside a limit you\u2019ve said out loud.',
                   early: 'You offered choices, but before she felt heard, so she couldn\u2019t use them yet.',
                   name: 'Give Two Options' },
      exec:      { hit: 'Once she was calm, you used it to teach for next time.',
                   miss: 'She got to the Executive State, and that was the moment to teach: The Missing Skill, Limits for Next Time, or Problem Solving.',
                   name: 'The Missing Skill, Limits for Next Time, Problem Solving' }
    }
  }
};
