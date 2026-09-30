/* content/principles.js — the nine screens of Section 1, Learn.
   THIS IS A FILE YOU EDIT. Text between the quote marks is yours; the
   commas, quote marks and brackets around it are the only fragile part.

   Revised 25 Sept: Learn is two paths. ASSESS (scr-111 to 114) reads the
   moment. ACT (scr-121 to 125) is five named moves, and those names are the
   ones the phrase cards and the Try It Out feedback rows use, so keep them
   in step if you rename one.

   Each screen's eyebrow, title, the paragraphs above its graphic, and the
   NOTICE / TRY pair below it come from here. The graphics and the lists on
   the screens (the levels, the iceberg, the shifts, the two answers on Act
   2, the rules on Acts 4 and 5) are markup in index.html.

   Fields
     eyebrow  the small line above the title
     title    the h1
     body     paragraphs above the graphic, in order
     home     two lines under it: what to notice, and what to try.
              Omit `home` entirely and nothing renders; nothing breaks.

   NEW = Claude's draft, 25 Sept, for Marc's copy pass. Unmarked lines are
   carried over from the old four principles. */

window.CDAH_PRINCIPLES = {

  'scr-111': {
    eyebrow: 'Assess 1',
    title: 'Three brain states',
    body: [
      'A child&rsquo;s brain works from one of three brain-body states, and each one can do less than the one above it. You have the same three. Before you decide what to say, work out which state your child is in, and which one you are in.'
    ],
    home: {
      notice: 'The question underneath the behavior changes with the state. &ldquo;Am I safe?&rdquo; is not a question you can answer with a choice between two pairs of shoes.',
      try: 'Before anything else, ask yourself which state you are in.'
    },
    /* The brain graphic's caption box. `intro` shows under "All three";
       each state shows under its own pill, bottom of the brain first. `desc`
       is the part of the brain; `child` and `parent` are the two sides of the
       toggle, [how it shows, what it asks, what it needs]. Added 27 Sept;
       `alias` and the needs lines from Marc's copy pass, 28 Sept. */
    states: {
      intro: {
        child:  ['Which part is in charge?', 'Each state is led by a different part of the brain, and the part in charge decides what your child can do right now, and what will reach them.'],
        parent: ['Your brain does this too', 'The same three parts take turns in you. Which one is leading decides what you can offer her right now.']
      },
      list: [
        { name: 'Overwhelmed', alias: 'The Survival State', part: 'The brain stem',
          desc: 'The oldest part of the brain, built to keep the body safe. This is the fight-or-flight response; when it takes the lead, there is no room left for reasoning.',
          child:  ['Shows in the body &mdash; hitting, bolting, going rigid.', '&ldquo;Am I safe?&rdquo;', 'Safety, reassurance.'],
          parent: ['Shows in the body &mdash; tensed up, voice raised, the sentence you&rsquo;ll regret half out.', '&ldquo;Am I still in control here?&rdquo;', 'Composure, a breath, a moment before you act or speak.'] },
        { name: 'Upset', alias: 'The Emotional State', part: 'The limbic system',
          desc: 'The feeling center. Emotion takes over, making it difficult to empathize with others and reason through a problem.',
          child:  ['Shows in the words &mdash; yelling, blaming, &ldquo;you never.&rdquo;', '&ldquo;Do you still love me?&rdquo;', 'Connection.'],
          parent: ['Shows in the words &mdash; sarcasm, keeping score &mdash; and in our tone. We tend to unconsciously imitate authority figures from our youth.', '&ldquo;Does any of this get noticed?&rdquo;', 'Connection.'] },
        { name: 'Ready to think', alias: 'The Executive State', part: 'The prefrontal lobes',
          desc: 'The last part of the brain to finish growing, and the first to go quiet under stress. Once the body and mind are regulated, this center can take over, problem-solving and learning.',
          child:  ['Can hear you, can weigh two options.', '&ldquo;What do I do about this?&rdquo;', 'Options, a plan, a repair.'],
          parent: ['This is where you can help teach them the skills they&rsquo;re missing.', '&ldquo;What is my child missing here?&rdquo;', 'Options, a plan, a repair.'] }
      ]
    }
  },

  'scr-112': {
    eyebrow: 'Assess 2',
    title: 'The drop, and the way back',
    body: [
      'Under stress the brain drops a state, and it can drop fast. The way back up is to give the state they are actually in what it asks for.',
      'Yours moves first. A child reads your state before your words, so meeting a dropped child from a dropped state takes you both further down.'
    ],
    home: {
      notice: 'The way up is the same order every time: safety, then connection, then teaching. A limit that has to be repeated usually skipped a step.',
      try: 'When it goes wrong, determine what her state is asking for, and give her that first.'
    }
  },

  'scr-113': {
    eyebrow: 'Assess 3',
    title: 'Look beneath the behavior',
    body: [
      'When your child melts down, screams or refuses, the behavior is what you see, but that&rsquo;s just what&rsquo;s above the surface. What&rsquo;s going on underneath? What are they trying to tell you that they can&rsquo;t yet put into words?',
      'The behavior is above the waterline. The need is underneath it.'
    ],
    home: {
      notice: 'The same behavior can come from three different places on three different mornings, and each one needs something different from you.',
      try: 'Ask what this would make sense as an answer to. The behavior is almost always an answer to something.'
    }
  },

  'scr-114': {
    eyebrow: 'Assess 4',
    title: 'Four shifts in how you see it',
    body: [
      'A lot of what goes wrong in a hard moment starts with how we read it. Each of these is a common way of seeing it, and the shift that can change what you do next.'
    ],
    home: {
      notice: 'Every shift here is a step away from &ldquo;stop this&rdquo; and toward &ldquo;what does my child need?&rdquo; Act is what you do once you have taken that step.',
      try: 'Pick the old frame that sounds most like you on a bad morning. That is the one to watch for.'
    }
  },

  'scr-121': {
    eyebrow: 'Act 1',
    title: 'Composure',
    body: [
      'Conscious Discipline starts here. A child reads your state before your words, so the four moves after this one only work from a calm voice.',
      'Composure isn&rsquo;t feeling calm. It is choosing your next sentence carefully when you <em>don&rsquo;t</em> feel calm. Once your voice goes up, whatever good thing you say after it lands on a child who has already stopped listening.'
    ],
    home: {
      notice: 'You can be angry and still choose the next sentence.',
      try: 'Before the next hard morning, decide which signal will be your cue to stop talking.'
    }
  },

  'scr-122': {
    eyebrow: 'Act 2 &middot; Connection before correction',
    title: 'Name the Feeling',
    body: [
      'Naming what your child is feeling is not the same as agreeing to what they want. It is what makes the limit hearable.',
      'Say what you see, simply, before anything about what happens next. You don&rsquo;t have to get the feeling exactly right. Once your child is ready to think, they can calmly tell you if you&rsquo;ve got it.'
    ],
    home: {
      notice: 'A limit that lands on an upset child has to be repeated. The repetition is the cost of skipping this step.',
      try: 'Say what you see, then say what holds. &ldquo;You really wanted the blue cup. The blue cup is in the dishwasher.&rdquo;'
    }
  },

  'scr-123': {
    eyebrow: 'Act 3 &middot; Connection before correction',
    title: 'Breathe Together',
    body: [
      'Sometimes your child is too far down for words to reach, even kind ones. Breathing together is connection without words: your slower breath gives their body something to follow.',
      'At school your child is probably learning several kinds of breaths, and some classrooms have children make up their own. Ask them to teach you theirs during a quiet moment, so you can try it with them when you need it.'
    ],
    home: {
      notice: 'The breath is for you too. Doing it with her is the quickest way back to Composure.',
      try: '&ldquo;Show me the breath you do at school. Let&rsquo;s do it together.&rdquo;'
    }
  },

  'scr-124': {
    eyebrow: 'Act 4',
    title: 'State the Limit',
    body: [
      'Once your child feels heard, say the limit: plainly, once, in as few words as you can.',
      'Understanding without a limit reads to a five-year-old as a yes.'
    ],
    home: {
      notice: 'If the limit needs saying five times, it usually arrived before they felt heard.',
      try: '&ldquo;Shoes keep your feet safe. They go on before the bus.&rdquo;'
    }
  },

  'scr-125': {
    eyebrow: 'Act 5',
    title: 'Give Two Options',
    body: [
      'Two choices, both fine with you. The limit stays in place, but they get a say in how.',
      'A child who can&rsquo;t yet stop one thing and start another needs a way to move that doesn&rsquo;t feel like losing. Two options are that way.'
    ],
    home: {
      notice: 'If they pick neither, the limit still holds. You can choose for them, calmly: &ldquo;I&rsquo;ll pick this time.&rdquo;',
      try: '&ldquo;These shoes or your boots? You pick.&rdquo;'
    }
  }

};
