/* content/principles.js — the four lenses of Section 1.
   THIS IS A FILE YOU EDIT. Text between the quote marks is yours; the
   commas, quote marks and brackets around it are the only fragile part.

   Each principle is one entry. The screen frame — eyebrow, title, the
   paragraphs above the graphic, and the "at home" pair below it — is drawn
   from here by js/principles.js, so changing wording never means touching a
   screen. The interactive graphics (the three levels on P1, the iceberg on
   P3) stay in the page as markup: they are designed objects, not text, and
   a data file is the wrong place to keep a shape.

   Fields
     eyebrow  the small line above the title
     title    the h1
     body     paragraphs above the graphic, in order
     home     two lines under it — what to notice, and what to try.
              Omit `home` entirely and nothing renders; nothing breaks.

   Order here is the order of the lenses; it is also the order the overview
   lists them in, so if you reorder these, reorder that nav too. */

window.CDAH_PRINCIPLES = {

  'scr-103': {
    eyebrow: 'Principle 1',
    title: 'State before skill',
    body: [
      'Under stress the brain drops a level, and each level can do less than the one above it. You have the same three, and yours moves first.'
    ],
    home: {
      notice: 'The question underneath the behavior changes with the level. &ldquo;Am I safe?&rdquo; is not a question you can answer with a choice between two pairs of shoes.',
      try: 'Before anything else, ask yourself which level you are on. Nothing below works from the bottom one.'
    }
  },

  'scr-104': {
    eyebrow: 'Principle 2',
    title: 'Connection before correction',
    body: [
      'Naming what a child feels is not agreeing with what they want. It is the thing that makes the limit hearable.',
      'The limit does not soften. It arrives second, and it arrives to someone who can now hear it.'
    ],
    home: {
      notice: 'A limit that lands on an upset child has to be repeated. The repetition is the cost of skipping the first step.',
      try: 'Say what you see, then say what holds. &ldquo;You really wanted the blue cup. The blue cup is in the dishwasher.&rdquo;'
    }
  },

  'scr-105': {
    eyebrow: 'Principle 3',
    title: 'Look beneath the behavior',
    body: [
      'What you can see is the smallest part of what is happening. The behavior is above the waterline; the need is underneath it.'
    ],
    home: {
      notice: 'The same behavior can come from three different places on three different mornings, and each one needs something different from you.',
      try: 'Ask what this would make sense as an answer to. The behavior is almost always an answer to something.'
    }
  },

  'scr-106': {
    eyebrow: 'Principle 4',
    title: 'Discipline is teaching, not punishing',
    body: [
      'When a child misbehaves it is natural to ask how to stop it right now. Stopping a behavior and teaching a skill are different jobs, and only one of them changes next week.',
      'Both jobs are real. The mistake is doing the first one and believing you have done the second.'
    ],
    home: {
      notice: 'If a consequence has to be used again next week for the same thing, it stopped a behavior and taught nothing.',
      try: 'After it is over and everyone is calm, name the skill out loud: &ldquo;Next time, here is what you can do instead.&rdquo;'
    }
  }

};
