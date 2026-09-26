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
      'A child&rsquo;s brain works from one of three states, and each one can do less than the one above it. You have the same three.',  // NEW
      'Before you decide what to say, work out which state your child is in, and which one you are in. The right move depends on both.'  // NEW
    ],
    home: {
      notice: 'The question underneath the behavior changes with the state. &ldquo;Am I safe?&rdquo; is not a question you can answer with a choice between two pairs of shoes.',
      try: 'Before anything else, ask yourself which state you are in. Nothing in Act works from the bottom one.'  // NEW
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
      notice: 'The way up is the same order every time: safety, then connection, then teaching. A limit that has to be repeated usually skipped a step.',  // NEW
      try: 'When it goes wrong, ask what her state is asking for, and give her that first.'  // NEW
    }
  },

  'scr-113': {
    eyebrow: 'Assess 3',
    title: 'Look beneath the behavior',
    body: [
      'When your child melts down, screams or refuses, the behavior is what you see, but it isn&rsquo;t the whole story. What is she trying to tell you that she can&rsquo;t yet put into words?',
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
      'A lot of what goes wrong in a hard moment starts with how we read it. Each of these is a common way of seeing it, and the shift that changes what you do next.'  // NEW
    ],
    home: {
      notice: 'Every shift here is a step away from &ldquo;stop this&rdquo; and toward &ldquo;what does she need?&rdquo; Act is what you do once you have taken that step.',  // NEW
      try: 'Pick the old frame that sounds most like you on a bad morning. That is the one to watch for.'  // NEW
    }
  },

  'scr-121': {
    eyebrow: 'Act 1',
    title: 'Composure',
    body: [
      'Everything in Act starts here. A child reads your state before your words, so the four moves after this one only work from a calm voice.',  // NEW
      'Composure isn&rsquo;t feeling calm. It is choosing your next sentence when you don&rsquo;t feel calm. Once your voice goes up, whatever good thing you say after it lands on a child who has already stopped listening.'  // NEW
    ],
    home: {
      notice: 'You can be angry and still choose the next sentence.',
      try: 'Before the next hard morning, decide which signal will be your cue to stop talking.'  // NEW
    }
  },

  'scr-122': {
    eyebrow: 'Act 2 &middot; Connection before correction',
    title: 'Name the Feeling',
    body: [
      'Naming what she feels is not agreeing with what she wants. It is what makes the limit hearable.',
      'Say what you see, simply, before anything about what happens next. You don&rsquo;t have to get the feeling exactly right. Trying is what she hears.'  // NEW
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
      'Sometimes she is too far down for words to reach, even kind ones. Breathing together is connection without words: your slower breath gives her body something to follow.',  // NEW
      'At school your child is probably learning several kinds of breaths, and some classrooms have children make up their own. Ask her to teach you hers on a calm day, so it&rsquo;s there on a hard one.'  // NEW
    ],
    home: {
      notice: 'The breath is for you too. Doing it with her is the quickest way back to Composure.',  // NEW
      try: '&ldquo;Show me the breath you do at school. Let&rsquo;s do it together.&rdquo;'  // NEW
    }
  },

  'scr-124': {
    eyebrow: 'Act 4',
    title: 'State the Limit',
    body: [
      'Once she feels heard, say the limit: plainly, once, in as few words as you can.',  // NEW
      'A limit isn&rsquo;t the opposite of connection. Children feel safer when someone is holding the edges, and understanding without a limit reads to a five-year-old as a yes.'  // NEW
    ],
    home: {
      notice: 'If the limit needs saying five times, it usually arrived before she felt heard.',  // NEW
      try: '&ldquo;Shoes keep your feet safe. They go on before the bus.&rdquo;'  // NEW
    }
  },

  'scr-125': {
    eyebrow: 'Act 5',
    title: 'Give Two Options',
    body: [
      'Two choices, both fine with you. She gets a say in how, and the limit stays where it is.',  // NEW
      'A child who can&rsquo;t yet stop one thing and start another needs a way to move that doesn&rsquo;t feel like losing. Two options are that way.'  // NEW
    ],
    home: {
      notice: 'If she picks neither, the limit still holds. You can choose for her, calmly: &ldquo;I&rsquo;ll pick this time.&rdquo;',  // NEW
      try: '&ldquo;These shoes or your boots? You pick.&rdquo;'  // NEW
    }
  }

};
