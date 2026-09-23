/* content/quiz.js — Test Your Knowledge, the four items.
   THIS IS A FILE YOU EDIT. Text between the quote marks is yours.

   Copy is lifted from "Section 2 Quiz Script" unchanged except where noted
   below. Item 1 is wired to a screen; items 2–4 are here as data, ready for
   their screens, which is the cheap half of the work.

   Each item:
     status   the header's "Question n of 4"
     step     which progress tick lights
     draws    the principles it needs (not shown to the parent; it is here so
              a future results screen can map a miss back to a section)
     setup    the situation, plain paragraph
     ask      the question itself, the h1 on the screen
     say      ONE thing a parent could actually say, with a short lead saying
              when. This replaced the full model answer, which was a reasoning
              paragraph written for the author and should never have been put
              in front of a parent: polished prose beside their own two
              sentences reads as "you should have written this," and without a
              real conversation partner it cannot do anything more useful. The
              long paragraphs are still in the Section 2 Quiz Script document,
              where they belong — as the source the criteria and coach copy
              were written from.
     practice a quiet line saying the principle will not always land. Shown
              only when something was missed, and fixed per item rather than
              random, so it never reads as a slot machine.
     criteria each one: id, accept[], hit, miss, and optional veto[]
     coach    the per-branch feedback: all, missA/missB/missC, many. Each
              branch has a `head` (the screen's h1) and a `body`.
              NOTE: on Nearly there the body is NOT SHOWN — the head plus the
              criterion rows carry it, and the body was a fourth restatement
              of the same verdict. The missA/missB/missC bodies are therefore
              unused on screen today. They are kept, not deleted: showing
              them again is one line in js/quiz.js (see the comment there).

   accept   phrasings that pass the criterion. Generous on purpose — a miss
            costs a parent a fair reading, and package E's parent sessions
            are where real wording gets added. Add a line, do not rewrite.
   veto     phrasings that cancel a pass even when an accept matched. Only
            item 3 has one, and it is there because "I'd apologize if he
            apologizes" contains "apologize" and is not a repair.
   hit/miss the one-line rows on the result screen. hit is what they did;
            miss is what was not there. Both stay plain — the glyph beside
            them carries the verdict, so these lines never scold, and the
            word "Covered" / "Not in your answer" is spoken to screen
            readers but never printed. Keep ONE negation per miss line: the
            row already reads as an absence, and a second "not" turns it
            into a puzzle.

   NOTE, for Marc: `coach.*.head` is the only new copy in this file — the
   short headline above the band pill, which the quiz script did not include
   because the script predates that screen. Six of them. Worth a read. */

/* The coach's lines, shown on Not yet only, in the "Coach says" breakout.
   They speak about practice in general, not about this answer. The quiz
   and the role-plays share this one list.

   HOW IT PICKS: in this order, never at random. The first item a parent
   misses gets line 1, the next gets line 2, and so on. It only goes back
   to line 1 once every line has been used. Each item keeps the line it
   was given, so going back to a question shows the same sentence.

   To add a line: copy a line below, paste it underneath, change the words
   between the quote marks. Keep the comma at the end of each line.

   The per-item `practice` lines further down are the earlier version,
   kept, and used only if this list is emptied. */
window.CDAH_COACH_LINES = [
  'Don\u2019t forget, you\u2019re practicing here. Some days? This stuff just doesn\u2019t land. That\u2019s not about you, that\u2019s parenting. Keep at it, keep breathing, and be kind to yourself as well.',
  'You\u2019re building new muscles here. Some days, the method will fall flat, and that has nothing to do with your skills as a parent. Kids have off days, and so do we. Keep showing up, remember that composure always comes first, and turn that compassion back on yourself every time.',
  'Remember, you\u2019re here to learn, not to prove anything. Parenting is messy and complex, and it\u2019s normal to feel overwhelmed, even angry. You\u2019re not always gonna get it right, but keep going, and be kind to yourself while you figure this out.',
  'We have our bad days too. We get short-tempered, we get overwhelmed. Don\u2019t beat yourself up over that, that\u2019s just being a parent. When things don\u2019t work, try telling yourself \u2018Hey, it didn\u2019t work that time, but I\u2019m doing okay. I\u2019ll try again next time.\u2019 A process like this is about learning, not reaching for arbitrary goals.',
  'When things don\u2019t seem to work, remember: you\u2019re not alone in this. Your child is hearing the same language, working through the same techniques, at school five days a week. The burden isn\u2019t all on you. You\u2019re part of a community now that puts empathy first, and that means being kind to yourself as well.'
];

window.CDAH_QUIZ = {

  'qz-201': {
    status: 'Question 1 of 4',
    step: 1,
    draws: ['look beneath', 'state before skill'],
    setup: 'Your five-year-old has been fine all afternoon. At the checkout he suddenly starts shouting that he wants a chocolate bar, and won\u2019t stop when you say no. A woman behind you is watching. You find yourself about to say &ldquo;we are leaving right now and you\u2019ve lost screen time tonight.&rdquo;',
    ask: 'What is probably going on for him, and what would you deal with first?',
    say: {
      lead: 'Once you have your own breath, and you are down at his level:',
      line: 'You really wanted that chocolate. It is hard when the answer is no. We are not buying it today.'
    },
    practice: 'These are principles to practice, not a script. Some evenings none of it lands, and that is a fact about evenings, not about you.',

    criteria: [
      {
        id: 'A',
        /* Reads the outburst as capacity, not choice. The fail case in the
           script — treating it only as manipulation, testing or naughtiness
           — is deliberately NOT a veto: "he's tired but he's also testing
           me" is a fair answer, and vetoing it would punish nuance. With no
           accept phrase present it fails anyway. */
        accept: ['tired', 'exhausted', 'overwhelmed', 'over stimulated', 'overstimulated',
                 'held it together', 'holding it together', 'ran out', 'run out',
                 'end of the day', 'long day', 'too much', 'cant cope', 'coping',
                 'not really about the chocolate', 'not about the chocolate',
                 'nothing to do with the chocolate', 'unmet need', 'needs something',
                 'at his limit', 'no capacity', 'out of capacity', 'last straw', 'hungry'],
        hit: 'You read the outburst as running out of capacity, not as a choice',
        miss: 'You didn\u2019t name what had run out for him'
      },
      {
        id: 'B',
        accept: ['my own', 'myself', 'breathe', 'breath', 'calm', 'embarrassed',
                 'embarrassment', 'the woman', 'her watching', 'being watched',
                 'watching me', 'people watching', 'react', 'reacting', 'pause',
                 'my state', 'me first', 'start with me', 'deal with first is me',
                 'get myself'],
        hit: 'You named your own state as the first thing to manage',
        miss: 'Your own state stayed out of the answer'
      },
      {
        id: 'C',
        accept: ['wont hear', 'cant hear', 'wont listen', 'cant listen',
                 'not the moment', 'not the time', 'no point', 'pointless',
                 'later', 'afterwards', 'after', 'once hes calm', 'when hes calm',
                 'wont land', 'nothing will go in', 'nothing goes in',
                 'wont teach', 'teach him nothing',
                 'not now', 'not right now', 'not in the moment', 'too late',
                 'wont work', 'wouldnt work', 'doesnt work', 'not going to work',
                 'wont help', 'wouldnt help', 'nothing i say', 'nothing i said',
                 'deal with it later', 'deal with that later', 'sort it later',
                 'talk about it later', 'not while hes', 'no consequence',
                 'the consequence wont', 'a consequence wont', 'threat wont',
                 'screen time wont', 'punishing him now', 'consequence now',
                 'wouldnt land', 'wont reach', 'wouldnt reach', 'nowhere to land',
                 'wont register', 'wouldnt register', 'wont sink in', 'wouldnt sink in',
                 'wont get through', 'wouldnt get through', 'wont mean anything',
                 'wouldnt mean anything', 'wont matter', 'wouldnt matter',
                 'consequence wouldnt', 'wouldnt do anything', 'wont do anything',
                 'wouldnt achieve', 'wont achieve', 'wouldnt teach'],
        hit: 'You saw that a consequence would not land while he is shouting',
        miss: 'You did not get to what a consequence would achieve right now'
      }
    ],

    coach: {
      all: {
        head: 'You separated the two things',
        body: 'Being watched is the hardest part of this one, and you named it.'
      },
      missB: {
        head: 'You read him accurately',
        body: 'You read him accurately. The part still missing is you: the threat you were about to make came from the woman behind you in the queue, not from him. Your own state is the first thing in the room that you control.'
      },
      missA: {
        head: 'You started with yourself',
        body: 'You were right that nothing useful lands while he\u2019s shouting. Worth going one step further back \u2014 a child who has been fine all afternoon and falls apart at the checkout has usually run out of capacity rather than decided to push you.'
      },
      missC: {
        head: 'You started with yourself',
        body: 'You read him accurately and you started in the right place. One more thing worth naming: while he\u2019s shouting, a consequence has nowhere to land. It teaches him nothing until he can hear it.'
      },
      many: {
        head: 'Two things at once here',
        body: 'Two things are happening at once: a child at the end of what he can manage, and a parent being watched. The line above is one way in.'
      }
    }
  },

  'qz-202': {
    status: 'Question 2 of 4',
    step: 2,
    draws: ['discipline is teaching', 'connection before correction'],
    setup: 'Your daughter snatches a toy from her cousin and makes him cry. You tell her to say sorry. She mumbles it while looking at the floor, and two minutes later she does it again.',
    ask: 'Why didn\u2019t the apology work, and what would have taught her more?',
    say: {
      lead: 'Later, when she is calm, with the toy in sight:',
      line: 'You wanted that truck. You can say \u201ccan I have a turn?\u201d \u2014 let us try it. Snatching is still not okay.'
    },
    practice: 'Nobody does this cleanly. Getting it half right, often, is what actually changes things.',
    criteria: [
      { id: 'A',
        accept: ['how to ask', 'asking', 'taking turns', 'take turns', 'turn taking',
                 'waiting', 'wait', 'doesnt know what to do instead', 'what to do instead',
                 'no other way', 'another way', 'skill', 'words for', 'the words'],
        hit: 'You identified the skill she is missing',
        miss: 'The skill she is missing stayed unnamed' },
      { id: 'B',
        accept: ['just words', 'only words', 'doesnt mean it', 'didnt mean it',
                 'ends the moment', 'end the conversation', 'to get away',
                 'get out of it', 'forced', 'made her', 'didnt understand',
                 'meaningless', 'empty', 'compliance', 'complied'],
        hit: 'You saw the apology as compliance rather than learning',
        miss: 'You didn\u2019t say what the apology itself taught her' },
      { id: 'C',
        accept: ['what she wanted', 'name it', 'name what', 'then the rule',
                 'still not okay', 'still not ok', 'snatching isnt okay',
                 'limit', 'both', 'first then', 'understood first'],
        hit: 'You put understanding first without dropping the limit',
        miss: 'The limit went missing once she was understood' }
    ],
    coach: {
      all: { head: 'You swapped the apology for a skill',
             body: 'The limit is still there in your answer, which is the part most people drop.' },
      missC: { head: 'A skill, not a moral',
               body: 'You\u2019re right that she\u2019s missing a skill rather than a moral. The thing to watch is that teaching the skill doesn\u2019t replace the limit \u2014 she needs to hear that snatching isn\u2019t okay, just after she\u2019s been understood rather than instead of it.' },
      missA: { head: 'You saw the apology was hollow',
               body: 'You saw that the apology was hollow. The next question is what she\u2019d need in order not to do it again \u2014 she hasn\u2019t got a way of getting a turn other than taking one.' },
      missB: { head: 'You found the missing skill',
               body: 'You found the thing she hasn\u2019t got yet. Worth adding why the apology failed on its own: she said the words that ended the moment, which is a different thing from having understood anything.' },
      many: { head: 'The apology ended the moment',
              body: 'A forced apology ends the moment without changing anything. The line above swaps it for something she can use next time.' }
    }
  },

  'qz-203': {
    status: 'Question 3 of 4',
    step: 3,
    draws: ['state before skill (adult)', 'discipline is teaching'],
    setup: 'After a long day you snapped at your son and said something you regret \u2014 &ldquo;why can\u2019t you just be good for once?&rdquo; He went quiet and went to his room. An hour later you\u2019re still turning it over.',
    ask: 'What would you do now, and what does the moment tell you about what happened earlier?',
    say: {
      lead: 'At his door, without waiting for him to come out to you:',
      line: 'What I said was not true and it was not fair. I was worn out, and that was not your fault.'
    },
    practice: 'You will not always get to this in the moment. Noticing it an hour later still counts.',
    criteria: [
      { id: 'A',
        accept: ['long day', 'my state', 'tired', 'exhausted', 'out of capacity',
                 'not about him', 'wasnt him', 'wasnt about him', 'my own stress',
                 'my stress', 'depleted', 'had nothing left', 'nothing left'],
        hit: 'You put the outburst where it came from \u2014 your own state',
        miss: 'Where the sentence came from stayed out of the answer' },
      { id: 'B',
        /* The script's absence check: a conditional repair is not a repair,
           and "apologize" appears in both. This is the module's one veto. */
        accept: ['go to him', 'go in', 'tell him', 'apologize', 'apologise',
                 'say sorry', 'wasnt true', 'wasnt fair', 'own it', 'sit with him',
                 'talk to him', 'repair', 'go back'],
        veto: ['if he apologizes', 'if he apologises', 'if he says sorry',
               'once he apologizes', 'when he apologizes', 'if he comes out',
               'make him feel better about me', 'tell me its okay'],
        hit: 'You went back and repaired it, without conditions',
        miss: 'The repair either had conditions on it, or didn\u2019t arrive' },
      { id: 'C',
        accept: ['shows him', 'show him', 'models', 'modeling', 'modelling',
                 'he learns', 'learns from', 'teaches him', 'thats the lesson',
                 'that is the lesson', 'the teaching', 'how to do it'],
        hit: 'You saw the repair as the teaching, not as damage control',
        miss: 'You didn\u2019t say what the repair itself teaches him' }
    ],
    coach: {
      all: { head: 'You took it straight on',
             body: 'You didn\u2019t look for a way to be right, and you saw that going back and mending it is itself the thing he learns from. That is the hardest of these four questions.' },
      missC: { head: 'Going back is exactly right',
               body: 'Going back to him is exactly right. Worth knowing that the repair isn\u2019t damage limitation \u2014 it\u2019s the most useful thing he\u2019ll see all week. Children who watch an adult own a mistake learn how to do it.' },
      missA: { head: 'You went back to him',
               body: 'Repairing it matters. The part still worth sitting with is where the sentence came from: a long day, not a child who deserved it.' },
      missB: { head: 'You read the evening accurately',
               body: 'You know where it came from, and you know what he takes from what happens next. The missing piece is the going-in itself \u2014 plainly, first, and not resting on him coming out to meet you.' },
      many: { head: 'Every parent has said something like this',
              body: 'What happens next is the part that teaches.' }
    }
  },

  'qz-204': {
    status: 'Question 4 of 4',
    step: 4,
    draws: ['connection before correction', 'look beneath', 'the school bridge'],
    setup: 'Your mother watches you kneel down and say &ldquo;you\u2019re really angry that we have to go&rdquo; to your son mid-tantrum. Afterwards she says: &ldquo;You\u2019re letting him walk all over you. In my day we\u2019d have just told him.&rdquo;',
    ask: 'How would you explain what you were doing \u2014 and why it isn\u2019t giving in?',
    say: {
      lead: 'To your mother, afterwards, without making a case of it:',
      line: 'I told him he was angry. We still left. He just heard me first.'
    },
    practice: 'This works more often than it does not \u2014 which is a different thing from always.',
    criteria: [
      { id: 'A',
        accept: ['we still left', 'still left', 'we left anyway', 'the limit stayed',
                 'limit didnt change', 'not agreeing', 'didnt agree',
                 'didnt change what happened', 'he still had to', 'both', 'still went'],
        hit: 'You held the line between hearing a feeling and moving the limit',
        miss: 'You didn\u2019t say that the limit held' },
      { id: 'B',
        accept: ['so he can hear', 'able to hear', 'hear it', 'lowers', 'less resistance',
                 'otherwise he fights', 'fights it', 'gets through', 'lands',
                 'goes in', 'nothing would have gone in', 'through the noise'],
        hit: 'You explained why the connection is what makes the limit work',
        miss: 'You didn\u2019t say why naming the feeling helps the limit land' },
      { id: 'C',
        accept: ['teacher', 'school', 'same words', 'same language', 'both places',
                 'what hes used to', 'consistent', 'consistency', 'classroom'],
        hit: 'You brought in what he already hears at school',
        miss: 'School did not come into the answer' }
    ],
    coach: {
      all: { head: 'You said the thing most people can only feel',
             body: 'The feeling was acknowledged and the limit didn\u2019t move. Being able to say that out loud to a skeptical relative is its own skill.' },
      missA: { head: 'You explained why it works',
               body: 'You explained why it works. The sentence that answers your mother, though, is the simplest one \u2014 you still left. Nothing was conceded.' },
      missC: { head: 'A solid explanation',
               body: 'Solid explanation. One more thing worth saying to her: it\u2019s the same language he hears at school, so he isn\u2019t being asked to learn two systems.' },
      missB: { head: 'Nothing was conceded',
               body: 'You were clear that nothing was given away, which is the part that answers her directly. What it doesn\u2019t yet say is why the naming helps at all \u2014 an upset child hears an instruction through the noise, and very little of it goes in.' },
      many: { head: 'This one is about defending the approach',
              body: 'It is less about your child than about defending an approach to someone who thinks it\u2019s softness. The line above does it in one sentence.' }
    }
  }

};
