/* content/bookend.js — the Hook Bookend (SCR-304) and Finish (SCR-400).
   THIS IS A FILE YOU EDIT. Text between the quote marks is yours.

   The Bookend puts the parent's first answer to the 7:40 morning beside
   what they said in Scene 3, and marks which Act moves each one used. It is
   never scored: no band, no pass. The rows below are the whole verdict.

   accept   same rules as the quiz: lowercase, apostrophes dropped.
   breaks   composure only: what BREAKS it (threats, labels, counting), and
            so does shouting (a word of three+ capitals, or "!!").

   NOTE, for Marc: `analysis` is the line under the rows, the part that reads
   most like judgment. Claude drafted all three on 1 Oct; Marc approved them
   as written the same day. Empty any one to hide it. Everything marked NEW
   is Claude's draft. */

window.CDAH_BOOKEND = {

  /* Revised 30 Sept (Marc): the payoff, with no second write. The "now"
     side is what the parent said in Scene 3, the same morning played live. */
  scene: 'scn-303',
  eyebrow: '7:40 a.m. \u00b7 The same morning, twice',                 // NEW
  intro: 'What you wrote before the module, beside what you said to her in Scene 3.', // NEW
  thenK: 'Before the module',                                           // NEW
  nowK: 'In Scene 3',                                                   // NEW
  noThen: 'You skipped this at the start.',                             // NEW
  noNow: 'Play Scene 3 and what you said there shows up here.',         // NEW
  goScene: 'Go to Try It Out \u2192',                                  // NEW
  tableK: 'Act move',                                                   // NEW
  thenShort: 'Before',                                                  // NEW
  nowShort: 'Scene 3',                                                  // NEW
  yes: 'Used', no: 'Not used',

  /* Marc's wording. Keyed by how many of the five moves the new answer
     uses; any key left empty shows nothing. */
  /* NEW 1 Oct, Claude's drafts for Marc. The count is the Scene 3 answer
     only: Composure counts as used unless something broke it. */
  analysis: {
    all:  'All four, on the same morning you started with. This time you went in order: calm first, then the feeling, then the limit, then a choice.',
    some: 'Some of the moves made it in. The ones marked Not used are the ones to reach for first next time, and the phrase cards have a line for each.',
    none: 'None of the moves showed up this time. Don\u2019t worry about it. A school morning is the hardest place to practice. Try Scene 3 again, or start with one line from the phrase cards.'
  },

  moves: [
    { id: 'composure', name: 'Composure',
      breaks: ['or else', 'right now or', 'because i said', 'i said so', 'how many times',
               'told you already', 'dont make me', 'last warning', 'im counting', 'one two three',
               '1 2 3', 'grounded', 'punish', 'naughty', 'bad girl', 'bad boy', 'spoiled',
               'stop whining', 'shut up', 'i dont care', 'you never listen', 'you always',
               'or you lose', 'or youll lose', 'no screen', 'no tv', 'no tablet'] },
    { id: 'connect', name: 'Name the Feeling',
      accept: ['you dont want', 'you really dont', 'you hate', 'you dont like', 'hard', 'tough',
               'i know', 'i can see', 'i get it', 'i understand', 'i hear you', 'feel', 'feeling',
               'feels', 'frustrated', 'upset', 'mad', 'angry', 'sad', 'annoyed', 'annoying',
               'scratchy', 'uncomfortable', 'weird', 'dont feel right', 'itchy', 'tight'] },
    /* Breathe Together is left out (30 Sept, Marc): nobody writes a breath
       into an answer, and Try It Out doesn't listen for it either. */
    { id: 'limit', name: 'State the Limit',
      accept: ['shoes go on', 'shoes are going on', 'shoes on', 'need shoes', 'need your shoes',
               'have to wear', 'need to wear', 'we need to go', 'we have to go', 'need to leave',
               'have to leave', 'bus', 'its time', 'time to go', 'we are leaving', 'were leaving',
               'feet need', 'outside needs'] },
    { id: 'choices', name: 'Give Two Options',
      accept: ['or you can', 'you pick', 'you choose', 'you can choose', 'which one', 'which do you',
               'would you rather', 'do you want to', 'your choice', 'you decide', 'either',
               'these or', 'this one or', 'or the', 'left or right', 'first or', 'hop or',
               'you put it on or', 'i put it on or'] }
  ],

  finish: {
    eyebrow: 'The end of the module',                                   // NEW
    title: 'That\u2019s the whole thing.',                              // NEW
    body: 'Everything you wrote stays on this device. Come back to any part of it the next time a morning goes sideways.', // NEW
    home: 'Or go back to the title screen \u2192',   // NEW 1 Oct: Start over is the button, and it goes to the Cover
    again: 'Start over',
    print: 'Print the phrase cards',                                    // NEW 1 Oct
    againArmed: 'Tap again to clear everything'
  }
};
