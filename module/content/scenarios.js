/* content/scenarios.js — Try It Out, the role-plays.
   THIS IS A FILE YOU EDIT. Text between the quote marks is yours.

   SCN-301 is wired. SCN-302 and SCN-303 arrive here as data in package G.

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
                 'the tablet is going', 'need to stop', 'have to stop']
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
      { what: 'Name the feeling first', say: 'It\u2019s really hard to stop when you\u2019re almost done.' },  // NEW
      { what: 'Say the limit plainly',  say: 'The tablet is going off now. It\u2019s time for bath.' },        // NEW
      { what: 'Give two ways to move',  say: 'You can pause it or save it. You pick.' }                        // NEW
    ],

    replies: {
      '1:fail':        { child: '(she throws herself face-down on the couch) NO! You\u2019re so MEAN!',
                         again: '(face still in the cushion) Go AWAY.',  // NEW
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
      '2:both':        { child: 'Fine. I\u2019m pausing it. Can I finish it after?',
                         note: 'Two real choices inside one limit. She stopped, and she didn\u2019t lose.' },
      '0:still':       { child: '(she turns away from you)',
                         again: '(she pulls a cushion over her head)',  // NEW
                         note: 'She\u2019s in her body right now. Low, slow and short is the whole job.' }, // NEW
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
                   body: 'When a voice goes up, a five-year-old hears the anger, not the limit. There may have been good work after it, but it landed on a child who had already stopped listening.',
                   frame: '<strong>The old frame.</strong> She\u2019s testing me and I need to win this. What\u2019s actually happening: she\u2019s five, she\u2019s absorbed in something, and her brain hasn\u2019t finished the part that makes stopping easy.' }
    },

    rows: {
      composure: { hit: 'You kept your own composure \u2014 no threat, no raised voice, no bargaining the limit away.',
                   miss: 'Composure \u2014 start here next time. The other three only work from a calm voice.',
                   name: 'Keeping your own composure' },
      connect:   { hit: 'You connected before correcting.',
                   miss: 'Her feeling didn\u2019t get named before the rule.',
                   name: 'Connecting before correcting' },
      limit:     { hit: 'You said the limit out loud.',
                   miss: 'The limit didn\u2019t get said. Understanding without a limit reads to a five-year-old as a yes.',
                   early: 'You said the limit, but before she felt heard, so it didn\u2019t land yet.',  // NEW
                   name: 'Saying the limit clearly' },
      choices:   { hit: 'You gave her two ways to move.',
                   miss: 'No two choices offered. Two acceptable ways to stop let her do it without losing.',
                   early: 'You offered choices, but before she felt heard, so she couldn\u2019t use them yet.',  // NEW
                   name: 'Offering two choices' }
    }
  }
};
