/* Conscious Discipline at Home — the glossary ("What the words mean").
   Edit the text between the quote marks. Nothing here is code.

   Two groups (Marc, 16 Oct):
   1. CDAH_GLOSSARY_LEARN — THE TERMS LEDGER (the live one, 16 Oct; `at` = taught on,
      `tested` = where it is checked; neither is shown on screen): the words Learn teaches by name,
      in the order Learn teaches them. Definitions are lifted from Marc's own
      Learn copy (as live on 15 Oct), trimmed to stand alone. // CHECK: Marc
      to read; where a definition was trimmed or joined, it says so below.
   2. CDAH_GLOSSARY — everything left over from the original glossary, shown
      under "Other terms your child's school uses". Composure moved up into
      group 1 (it is a ledger term); its say line went with it.

   TERMS: the school's own words, used as the school uses them (23 Sept).
   ORDER: js/glossary.js sorts each group A–Z (ignoring a leading "The"), with
   the three "Brain State:" terms pinned first as Executive, Emotional, Survival
   [MARC, 16 Oct]. Order in this file does not matter.
   `say` is optional; `to` says whether it is for the child or yourself.

   Shown in the Help drawer by js/glossary.js. */

window.CDAH_GLOSSARY_LEARN = [
  { term: "Brain State: Executive", at: "1.1", tested: "BIT, Try It Out",
    plain: "The higher-reasoning parts of the brain are active. Here we can think rationally, solve problems, and learn new skills." },
  { term: "Brain State: Emotional", at: "1.1", tested: "BIT, Try It Out",
    plain: "Emotions are in control, and rational thinking is almost impossible. It draws on mental models learned through our upbringing and experience, rather than conscious thought." },
  { term: "Brain State: Survival", at: "1.1", tested: "BIT, Try It Out",
    plain: "The oldest parts of the brain, working below awareness to keep us safe. Under stress, the brain drops here. Its only skills are fight, flight, or freeze (surrender)." },  // CHECK: 1.1's two lines joined
  { term: "Capacity", at: "1.2 (full: 3.1 Coach)", tested: "BIT",
    plain: "Your store of emotional and social energy. Yours can drain after a long day at work, or unbroken hours of childcare. Your child\u2019s can drain just from holding it together all day at school." },
  { term: "Composure", at: "2.3", tested: "BIT, Try It Out",
    plain: "Self-regulation, and it starts with you. You need to be back in your own Executive State before you can help your child reach theirs. Without composure, nothing else lands.",
    say: "She needs me to be calm first. One breath before I say anything.", to: "yourself" },
  { term: "Empathy", at: "3.1", tested: "BIT",
    plain: "Understanding, without judgment. You\u2019re looking for what your child feels, not trying to stop it. It also needs to be turned back on yourself." },  // CHECK: 3.1 + 4.3 joined
  { term: "Compose Yourself", at: "4.1", tested: "BIT, Try It Out, Bookend",
    plain: "Catch yourself before your voice goes up. Deep belly breaths, and a word to yourself.",
    say: "I\u2019ve got this. I\u2019m the parent, they need me.", to: "yourself" },  // CHECK: trimmed from the 4.1 wheel
  { term: "Limit", at: "4.1, 4.3, 4.5", tested: "BIT, Try It Out",
    plain: "The line around what\u2019s OK. In the Survival State, state only the limits that keep danger from continuing. Once your child can listen and think, a limit can help next time." },  // CHECK: 4.1 + 4.5 joined
  { term: "Make It Safe", at: "4.1", tested: "BIT, Try It Out, Bookend",
    plain: "Stop anything that is physically dangerous, and state only limits that keep the danger from continuing.",
    say: "I won\u2019t let you kick.", to: "child" },
  { term: "Describe the Scene", at: "4.1", tested: "BIT, Try It Out",
    plain: "Calmly say what\u2019s going on with your child\u2019s body and words. No judgment, just say what you see. It\u2019s the first step to connection.",
    say: "I see your face is all in a scowl, you\u2019re crying, and your legs are in the air.", to: "child" },
  { term: "Breathe Together", at: "4.1", tested: "BIT, Try It Out",
    plain: "Ask your child to teach you a deep belly breath they learned at school, then do it together. If they\u2019re not ready, keep breathing yourself, and let them follow.",
    say: "Breathe with me. In\u2026 and out.", to: "child" },
  { term: "Name the Feeling", at: "4.3", tested: "BIT, Try It Out, Bookend",
    plain: "Instead of asking what they feel, or why they\u2019re upset, name it and check. There\u2019s no such thing as a \u201Cwrong\u201D feeling.",
    say: "Those shoes feel wrong. It must be frustrating to think you have to wear them all day. Do I get you?", to: "child" },
  { term: "Give Two Options", at: "4.3", tested: "BIT, Try It Out, Bookend",
    plain: "Two positive ways out, both within your stated limit. Your child gets a say in how they move forward, but doesn\u2019t get to move the limit.",
    say: "Sneakers or boots? You pick.", to: "child" },
  { term: "The Missing Skill", at: "4.5", tested: "BIT, Try It Out",
    plain: "Unwelcome behavior often comes from a missing skill: a safe way to handle a problem. Teach it once your child can listen and think, not mid-kick." },
  { term: "Problem Solving", at: "1.3, 4.5", tested: "BIT, Try It Out",
    plain: "Once your child is ready to listen, think, and learn, work out together what to try next time.",
    say: "Those shoes felt weird this morning. What could we try tomorrow?", to: "child" }
];

window.CDAH_GLOSSARY = [
  {
    term: "Safekeeper",
    plain: "Teachers, parents, school administrators, and other caregivers whose responsibility is to create a safe environment so children can regulate emotions and learn. At your child\u2019s school, the kids are also safekeepers, because they too have a role in creating this environment.",
    say: "My job is to keep you safe. I\u2019ve got you.", to: "child"
  },
  {
    term: "Safe Place",
    plain: "A designated area within the classroom or at home where children can opt to go when they need space to self-regulate. Often equipped with \u201Cfeeling buddies\u201D and other tools to help them calm into an Executive State.",
    say: "Do you want to go to your safe place for a bit? I\u2019ll be right here.", to: "child"
  },
  {
    term: "Brain State Model",
    plain: "A framework categorizing three brain levels, each with a different function: Survival State (\u201Cfight or flight\u201D), Emotional State (reacts and relates), and Executive State (ready to think, listen, and problem-solve).",
    say: "Your body is really upset right now. Let\u2019s get calm first, then we\u2019ll figure it out.", to: "child"
  },
  {
    term: "Brain Smart Start",
    plain: "Your child begins each day with a routine designed to help transition them into their Executive brain state. This is done with words, breathing exercises, hand motions, partner exercises, and other movements.",
    say: "Show me how you start the day at school. Can we do it together?", to: "child"
  },
  {
    term: "Wish Well",
    plain: "A practice of focusing caring thoughts and energy toward oneself, the child\u2019s classmates, and anyone absent from the group that day. This helps foster empathy and reminds the child that they are part of a bigger class family.",
    say: "Who should we wish well today?", to: "child"
  },
  {
    term: "Shifting from Judgment to Description",
    plain: "Rather than judging your child\u2019s nonverbal cues and behaviors, a practice of describing them instead. It helps the safekeeper stay calm and not react on the spot.",
    say: "Your arms are crossed and your face is all scrunched up.", to: "child"
  },
  {
    term: "Active Calming",
    plain: "Techniques designed to help a child self-regulate, including breathing exercises, self-talk, and sensory grounding.",
    say: "Let\u2019s smell the flower and blow out the candle.", to: "child"   // NEW: "Breathe with me" moved to Breathe Together
  },
  {
    term: "Co-Regulation",
    plain: "Related to Composure but extending it outward, co-regulation is all about an adult using their own calm state to aid a distressed child in moving up to their Executive State.",
    say: "I\u2019m right here. We can get calm together.", to: "child"
  },
  {
    term: "Friends and Family Board",
    plain: "You\u2019ll find in your child\u2019s classroom a designated area that is full of pictures of the children with their families and other loved ones, as a constant reminder of their sense of safety and belonging.",
    say: "Who\u2019s on the board in your classroom? Tell me about them.", to: "child"
  }
];
