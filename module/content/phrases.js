/* Conscious Discipline at Home — the phrase cards ("Words for a hard moment").
   Edit the text between the quote marks. Nothing here is code.

   21 cards, grouped by the five Act moves. Composure comes first and is said
   to yourself; the other four are said to your child. Every card is a // NEW
   draft by Claude (1 Oct) for Marc's pass.

   `school` is the "At school:" line: what your child already practices in
   class, in plain words. Program terms stay out of it; they live in the
   glossary only (23 Sept rule). The lines are deliberately hedged ("often",
   "many classrooms") because no school has reviewed them.

   Opened from the Hook's "I'm in a hard moment right now" door and from the
   About & reference panel. Screen: SCR-500. */

window.CDAH_PHRASES = {
  eyebrow: "For right now",
  title: "Words for a hard moment",
  intro: "Start with yourself. Then pick one line from any group below. Nothing here is scored.",
  jump: "Go to",
  schoolK: "At school:",
  later: "When things are calmer, the module explains why these work.",
  laterGo: "Start the module \u2192",
  print: "Print the phrase cards",                                    // NEW 1 Oct
  printTitle: "Words for a hard moment",                              // NEW
  printNote: "Cut along the dashed lines. Keep one where the hard moments happen: the fridge, the car, by the front door.", // NEW
  printFoot: "Conscious Discipline at Home \u00b7 An independent learning project. Not affiliated with, endorsed by, or reviewed by Conscious Discipline or Loving Guidance.",

  moves: [
    { id: "composure", title: "Composure", note: "Say these to yourself, before you say anything to your child.",
      cards: [
        { say: "Stop talking. One breath first.",
          school: "Teachers often pause before they answer an upset child. Your child has seen that pause many times." },
        { say: "This is a hard moment, not an emergency.",
          school: "Big feelings are treated as something to help with, not something to shut down." },
        { say: "She isn\u2019t against me. She\u2019s stuck.",
          school: "Teachers read a meltdown as a signal first and a problem second." },
        { say: "I don\u2019t have to fix this in the next ten seconds.",
          school: "In class, calming down comes before solving. The problem can wait a minute." },
        { say: "Lower and slower.",
          school: "A quiet, slow voice is the one your child is used to hearing when things go wrong at school." }
      ] },

    { id: "feeling", title: "Name the Feeling", note: "Say what you see before you say what happens next.",
      cards: [
        { say: "You\u2019re really disappointed.",
          school: "Your child is learning names for feelings in class, so this is a word they already know." },
        { say: "Your fists are tight and your face is red. You look really angry.",
          school: "Teachers often describe what they see before saying anything else. It tells a child they\u2019ve been noticed." },
        { say: "You were almost finished. That's so frustrating, I get it.",
          school: "Feeling first, problem second is the order your child hears all day." },
        { say: "It\u2019s okay to be mad. I\u2019m right here.",
          school: "In many classrooms every feeling is allowed. The limits are on what we do with it." }
      ] },

    { id: "breathe", title: "Breathe Together", note: "When words won\u2019t reach, breathe first and let them follow.",
      cards: [
        { say: "Show me your school breath. I\u2019ll copy you.",
          school: "Children often learn several calming breaths in class. Being the one who teaches it helps them do it." },
        { say: "I\u2019m going to breathe slowly. Join me when you\u2019re ready.",
          school: "Teachers often breathe first and let the class follow, without asking anyone to calm down." },
        { say: "Hand on your tummy. Let\u2019s make it go up\u2026 and down.",
          school: "Many classrooms use the body to calm the body: hands, breath, a slow count." },
        { say: "Hold up your hot cocoa, now blow off the steam to cool it down.",
          school: "Short pictures like this one are common in class, because a five-year-old can hold onto them." }
      ] },

    { id: "limit", title: "State the Limit", note: "Once they feel heard: plainly, once, in as few words as you can.",
      cards: [
        { say: "I won\u2019t let you hit. Hitting hurts.",
          school: "Classroom limits are mostly about safety, and they\u2019re said simply. Your child will recognize the short version." },
        { say: "The answer is no. You can be upset about it.",
          school: "Teachers hold a limit without asking the child to be happy about it." },
        { say: "I hear you. And it\u2019s still bedtime.",
          school: "Your child is used to hearing that being understood and getting a yes are two different things." },
        { say: "It\u2019s time to go. We\u2019re leaving the park now.",
          school: "Transitions are announced plainly at school, often with a warning first. Try a five-minute heads-up next time." }
      ] },

    { id: "options", title: "Give Two Options", note: "Two choices, both fine with you. The limit stays; they choose the how.",
      cards: [
        { say: "Hop to the car or walk like a robot? You pick.",
          school: "Choices get a class through transitions all day. Your child is practiced at picking one." },
        { say: "Pajamas first or teeth first?",
          school: "Teachers often offer the order rather than the whether. The thing still happens." },
        { say: "You can carry your backpack, or I can. You decide.",
          school: "Small jobs and small choices help a child feel capable, and they get a lot of both at school." },
        { say: "You can pick, or I can pick. Which one?",
          school: "If a child won\u2019t choose, the adult chooses calmly. The limit holds either way." }
      ] }
  ]
};
