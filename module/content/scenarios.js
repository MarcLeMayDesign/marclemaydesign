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
   words      the Words to try strip. It appears after her first reply.
   results    the end screen. Composure failing replaces everything else:
              one row to start with, the other three greyed out.

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
                 'you always', 'or you lose', 'or youll lose']
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
    words: [
      { what: 'Name the feeling', say: 'It\u2019s really hard to stop when you\u2019re almost done.' },  // NEW
      { what: 'State the limit',  say: 'The tablet is going off now. It\u2019s time for bath.' },        // NEW
      { what: 'Give two options',  say: 'You can pause it or save it. You pick.' }                        // NEW
    ],

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
      '0:calm':        { child: '(still face-down, quieter) \u2026I was almost done.',
                         note: 'Your calm reached her before any words did.' }        // NEW
    },

    results: {
      strong:    { head: 'She stopped, and nobody lost',                             // NEW
                   body: 'You named the feeling, said the limit plainly, and gave her two ways to move inside it \u2014 without your voice going up.' },
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
                   miss: 'Composure \u2014 start here next time. The other three only work from a calm voice.',
                   name: 'Composure' },
      connect:   { hit: 'You connected before correcting.',
                   miss: 'Her feeling didn\u2019t get named before the rule.',
                   name: 'Name the feeling' },
      limit:     { hit: 'You said the limit out loud.',
                   miss: 'The limit didn\u2019t get said. If you only sympathize and never say the limit, a five-year-old hears \u201cyes.\u201d',
                   early: 'You said the limit, but before she felt heard, so it didn\u2019t land yet.',  // NEW
                   name: 'State the limit' },
      choices:   { hit: 'You gave her two ways to move.',
                   miss: 'No two choices offered. Two acceptable ways to stop let her do it without losing.',
                   early: 'You offered choices, but before she felt heard, so she couldn\u2019t use them yet.',  // NEW
                   name: 'Give two options' }
    }
  },

  /* ===== SCN-302 · Scenario 2 · The pickup line (NEW, 30 Sept) ==========
     Marc's scene: the parent's own hurt. Maya, the same child all week.
     Parked in the pickup line, so you can turn round but can't get down to
     her level: the voice carries all of it. The limit is SAFETY, not
     manners (kicking the driver's seat), so it is the one scene where a
     limit said before she feels heard still counts: limitAnytime. */
  'scn-302': {
    start: 1,
    maxTurns: 3,
    limitAnytime: true,
    opening: '(kicking the back of your seat) I don\u2019t want YOU! I wanted Grandma to pick me up, not YOU!',
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
                 'bad girl', 'spoiled', 'i dont care', 'you always', 'you never', 'stop it right now']
      },
      connect: {
        accept: ['you wanted grandma', 'wanted it to be grandma', 'you were hoping', 'hoping', 'you wish', 'wished',
                 'miss grandma', 'you miss', 'disappointed', 'disappointing', 'disappointment', 'not who you expected',
                 'expected', 'thought grandma', 'surprise', 'long day', 'hard day', 'big day', 'tired', 'upset',
                 'mad', 'frustrated', 'sad', 'i know', 'i hear you', 'i get it', 'i understand', 'makes sense',
                 'feel', 'feeling', 'big feelings', 'you love grandma', 'love grandma']
      },
      limit: {
        accept: ['kick', 'kicking', 'kicks', 'feet stay', 'feet still', 'stay still', 'keep your feet', 'feet down',
                 'feet on the floor', 'feet off', 'i wont let you', 'safe', 'safely', 'safety', 'drive', 'driving',
                 'the seat', 'my seat']
      },
      choices: {
        accept: ['or you can', 'you can stomp', 'stomp', 'squeeze', 'or squeeze', 'you pick', 'you choose',
                 'you can choose', 'which one', 'which do you', 'would you rather', 'do you want to', 'either',
                 'your choice', 'you decide', 'push your feet', 'press your feet']
      }
    },

    words: [
      { what: 'Name the feeling', say: 'You were hoping it\u2019d be Grandma today. That\u2019s a big disappointment.' },
      { what: 'State the limit',  say: 'I won\u2019t let you kick my seat. I need to drive us home safely.' },
      { what: 'Give two options',  say: 'You can stomp on your seat or squeeze your Bun-Bun. You pick.' }
    ],

    replies: {
      '1:fail':        { child: '(kicks harder) I want GRANDMA!',
                         again: '(face pressed to the window) Go AWAY.',
                         note: 'She heard the sting in your voice, not the words.' },
      '1:none':        { child: '(kick) I don\u2019t WANT you! I want GRANDMA!',
                         again: '(kick, kick) GRANDMA!',
                         note: 'Nothing yet names what she was hoping for, and the kicking hasn\u2019t been stopped.' },
      '1:limitOnly':   { child: '(the kick stops halfway) But I WANTED Grandma.',
                         again: 'You don\u2019t even care.',
                         note: 'Safety first was right. Now she needs to hear that you get it.' },
      '1:connect':     { child: '(the kicking slows) \u2026Grandma always brings the fruit snacks.',
                         note: 'You named what she was hoping for, and you didn\u2019t take \u201cnot you\u201d personally.' },
      '2:fail':        { child: '(kicks again) See? You\u2019re MEAN. That\u2019s why I want Grandma.',
                         again: '(arms crossed, one more kick) I\u2019m not talking to you.',
                         note: 'You had her, and then the hurt came through.' },
      '2:connectAgain':{ child: 'Yeah. Can we go to Grandma\u2019s house?',
                         again: '(foot swinging close to your seat) Can we, though?',
                         note: 'She knows you understand. Now she needs to hear where her feet go.' },
      '2:limitOnly':   { child: '(foot hovering) But my legs are ANGRY.',
                         again: '(quieter) They\u2019re still angry.',
                         note: 'The limit is said. Nothing gives those angry legs somewhere to go.' },
      '2:choicesOnly': { child: 'I pick\u2026 stomping. On your seat!',
                         again: 'Squeezing your seat with my feet!',
                         note: 'Choices without the limit said out loud turn into a loophole.' },
      '2:both':        { child: '(the kicking stops) \u2026Can we get fruit snacks?',  // NEW 2 Oct: as above
                         note: 'A limit that keeps you both safe, and two places for the feeling to go. She stopped kicking.' },
      '0:still':       { child: '(she screams and kicks with both feet)',
                         again: '(she buries her face in her backpack)',
                         note: 'She\u2019s past words. Keep your voice low and slow, and keep it short. You don\u2019t have to drive off yet.' },
      '0:calm':        { child: '(the kicking slows, quieter) \u2026I wanted Grandma.',
                         note: 'Your calm reached her before any words did.' }
    },

    results: {
      strong:    { head: 'It wasn\u2019t about you, and you knew it',
                   body: 'You heard the disappointment, stopped the kicking to keep everyone safe, and gave her feelings somewhere to go. And you didn\u2019t take \u201cnot you\u201d personally.' },
      cards:     { head: 'It wasn\u2019t about you, and you knew it',
                   coach: 'Those were my words, and they worked. Now try it again in your own.' },
      nearly:    { head: 'You stayed with her' },
      notyet:    { head: 'She\u2019s still kicking',
                   body: 'The scene ended with her still stuck. Start with the first row below that isn\u2019t ticked \u2014 the others build on it.' },
      composure: { head: 'This one got under your skin',
                   body: '\u201cNot you\u201d is built to sting, and it did. That\u2019s normal. But once your voice changed, she heard the hurt, not the limit, and the kicking had a reason to keep going.',
                   frame: '<strong>The old frame.</strong> She\u2019s rejecting me, and she needs to know it hurt. What\u2019s actually happening: she held it together all day. Kids often fall apart with the person they feel safest with. It feels like rejection, but it means she trusts you.' }
    },

    rows: {
      composure: { hit: 'You kept your composure \u2014 you didn\u2019t take \u201cnot you\u201d personally, and nothing you said asked her to look after your feelings.',
                   miss: 'Composure \u2014 start here next time. The other three only work from a calm voice.',
                   name: 'Composure' },
      connect:   { hit: 'You named what she was hoping for.',
                   miss: 'What she was hoping for didn\u2019t get named.',
                   name: 'Name the feeling' },
      limit:     { hit: 'You said the limit, and why: her feet stay still so you can drive safely.',
                   miss: 'The kicking didn\u2019t get a limit. In a car this one isn\u2019t optional \u2014 it\u2019s about everyone\u2019s safety, and she needs to hear it plainly.',
                   early: 'You said the limit.',
                   name: 'State the limit' },
      choices:   { hit: 'You gave the angry feeling two safe places to go.',
                   miss: 'No two choices offered. The feeling still needs somewhere to go that isn\u2019t your seat.',
                   early: 'You offered choices, but before she felt heard, so she couldn\u2019t use them yet.',
                   name: 'Give two options' }
    }
  },

  /* ===== SCN-303 · Scenario 3 · The shoes (NEW, 30 Sept) ================
     The capstone: the 7:40 morning from the very first screen, played live.
     What the parent says here is what the Bookend (SCR-304) puts beside
     their first answer. Structure after the original spec; wording new. */
  'scn-303': {
    start: 1,
    maxTurns: 3,
    opening: '(one shoe on, the other kicked across the rug) I\u2019m NOT wearing these stupid shoes! They feel WEIRD!',
    child: 'Maya',
    lastPrompt: 'Your last reply.',

    criteria: {
      composure: {
        breaks: ['or else', 'no tv', 'no tablet', 'no screen', 'no treat', 'acting like a baby', 'like a baby',
                 'big girls', 'stop being', 'ridiculous', 'because i said', 'i said so', 'how many times',
                 'told you already', 'last warning', 'im counting', 'one two three', '1 2 3', 'ill give you',
                 'if you put them on ill', 'sticker if', 'candy if', 'treat if', 'dont make me', 'i dont care',
                 'you always', 'you never', 'naughty', 'bad girl', 'spoiled', 'right now or', 'im leaving without you',
                 'ill leave you']
      },
      connect: {
        accept: ['feel weird', 'feels weird', 'weird', 'scratchy', 'itchy', 'tight', 'uncomfortable', 'dont feel right',
                 'dont like how', 'you dont want', 'dont want to wear', 'hard', 'tough', 'frustrated', 'upset', 'mad',
                 'annoyed', 'i know', 'i hear you', 'i get it', 'i understand', 'i can see', 'feel', 'feeling',
                 'feels', 'hate those', 'hate them']
      },
      limit: {
        accept: ['shoes go on', 'shoes are going on', 'shoes on', 'need shoes', 'need your shoes', 'have to wear',
                 'need to wear', 'time to go', 'its time', 'the bus', 'bus is coming', 'need to leave', 'have to leave',
                 'we are leaving', 'were leaving', 'feet need', 'feet safe', 'keep your feet safe', 'cant go without']
      },
      choices: {
        accept: ['left or right', 'left one or', 'right one or', 'which shoe', 'which one first', 'you or me',
                 'by yourself or', 'yourself or', 'or i can help', 'or should i', 'do you want to', 'would you rather',
                 'you pick', 'you choose', 'either', 'your choice', 'hop or', 'loose or']
      }
    },

    words: [
      { what: 'Name the feeling', say: 'Those shoes feel really weird right now.' },
      { what: 'State the limit',  say: 'Shoes go on before the bus comes.' },
      { what: 'Give two options',  say: 'Left one first or right one first? You pick.' }
    ],

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
      '0:still':       { child: '(she lies flat on the rug)',
                         again: '(she covers her face with both arms)',
                         note: 'She\u2019s past words. Keep your voice low and slow, and keep it short, even with the bus coming.' },
      '0:calm':        { child: '(still on the rug, quieter) \u2026They feel weird.',
                         note: 'Your calm reached her before any words did.' }
    },

    results: {
      strong:    { head: 'Shoes on, out the door',
                   body: 'You named the feeling, said the limit plainly, and gave her two ways in \u2014 with the bus coming, and without your voice going up.' },
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
                   miss: 'Composure \u2014 start here next time. The other three only work from a calm voice.',
                   name: 'Composure' },
      connect:   { hit: 'You named how the shoes felt before the rule.',
                   miss: 'How the shoes felt didn\u2019t get named before the rule.',
                   name: 'Name the feeling' },
      limit:     { hit: 'You said the limit out loud: the shoes go on.',
                   miss: 'The limit didn\u2019t get said. If you only sympathize and never say the limit, a five-year-old hears \u201cno shoes today.\u201d',
                   early: 'You said the limit, but before she felt heard, so it didn\u2019t land yet.',
                   name: 'State the limit' },
      choices:   { hit: 'You gave her two ways in.',
                   miss: 'No two choices offered. Two acceptable ways to put shoes on let her do it without losing.',
                   early: 'You offered choices, but before she felt heard, so she couldn\u2019t use them yet.',
                   name: 'Give two options' }
    }
  }
};
