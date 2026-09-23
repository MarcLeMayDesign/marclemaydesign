/* content/safety.js — the five safety responses.
   THIS IS A FILE YOU EDIT, and the one where a missing phrase matters most.
   Copy is final from "Safety Responses - Spec and Drafts" (20 Sept); edit the
   words there first, then here.

   Order is the order they are checked in. Highest stakes first, so an answer
   matching two only ever gets the more serious reply.

   Per category:
     phrases   fire on their own
     weak      SR-4 only: fire ONLY with a `second` phrase present too.
               "I can't do this anymore" is ordinary tired-parent language,
               and over-firing tells a parent the module thinks they are a
               risk. When in doubt, do not.
     needs     SR-5 only: a question phrase AND one of these real-child
               markers. A quiz answer that says "my son" is not a question.
     homeOnly  inside a role-play, fire only if the answer is about the
               parent's REAL child (a `home` marker present), not the
               scripted one — "she hit me" is an expected sentence there.
     say       the reply, in the coach's slot. HTML allowed.
     again     the one line used if the same category fires twice in a
               sitting. A reply that repeats in full reads as a machine.
     action    the resource button: { label, href } or { label, panel }.
               Every reply also gets "Back to the question".

   Adding a phrase after package E: one line, lowercase, no punctuation,
   apostrophes dropped ("im", "cant", "wont"). Test it in the console:
   CDAH_SAFETY.check('your exact wording')  */

window.CDAH_SAFETY_DATA = {

  home: ['my son', 'my sons', 'my daughter', 'my daughters', 'my kid', 'my kids',
         'my child', 'my childs', 'my children',
         'my boy', 'my girl', 'my little one', 'my five year old', 'my 5 year old',
         'my husband', 'my wife', 'my partner', 'at home', 'at our house', 'in real life',
         'my real', 'my own', 'last night', 'this morning', 'yesterday', 'today i', 'i did'],

  categories: [

    { id: 'SR-1',
      homeOnly: true,
      phrases: ['i slapped', 'i smacked', 'i spanked', 'i hit him', 'i hit her', 'i hit my',
                'i shook him', 'i shook her', 'i pushed him', 'i pushed her', 'i threw him',
                'i threw her', 'i hurt him', 'i hurt her', 'i hurt my',
                'grabbed him harder', 'grabbed her harder', 'harder than i meant',
                'harder than i should', 'almost hit him', 'almost hit her', 'nearly hit him',
                'nearly hit her', 'wanted to hit him', 'wanted to hit her', 'wanted to hurt',
                'scared of what ill do', 'scared of what i might do', 'scared of what i will do',
                'afraid of what ill do', 'afraid of what i might do', 'scared of myself',
                'afraid of myself', 'scared of my own anger', 'frightened of my own anger',
                'scared of my anger', 'i might hurt', 'i could hurt', 'i lose control and'],
      /* The phrases above are contiguous, so hedged and conditional forms
         slipped through: "I'd probably just hit him" arrives as "id probably
         just hit him". This rule catches a harm verb followed by a person,
         with a first-person word in the few words before it, unless a
         negation sits in that same stretch ("I would never hit him" stays
         silent). grab / push / throw are left out on purpose: "I'd grab him
         and leave" is an ordinary checkout answer. */
      pattern: {
        window: 4,
        subjects: ['i', 'id', 'ill', 'im', 'ive'],
        verbs: ['hit', 'hitting', 'slap', 'slapped', 'slapping', 'smack', 'smacked', 'smacking',
                'spank', 'spanked', 'spanking', 'shake', 'shook', 'shaking', 'hurt', 'hurting',
                'punch', 'punched', 'kick', 'kicked', 'beat', 'whack', 'whacked', 'swat', 'swatted'],
        objects: ['him', 'her', 'them', 'my', 'the kids', 'the baby'],
        negate: ['never', 'not', 'wouldnt', 'dont', 'didnt', 'wont', 'cant', 'couldnt', 'shouldnt', 'no'],
        unless: ['feelings']
      },
      say: 'Thank you for your honesty \u2014 it can be difficult to be open about one\u2019s own anger. This is further than a practice module should go with you, and I don\u2019t want to hand you an exercise instead of an answer. The National Parent Helpline is free and confidential, and it exists for exactly this: you can text or call <strong>1-855-427-2736</strong> at any time. Same goes for this module: nothing you type here is stored anywhere but your own device, and nothing has been recorded.',
      again: 'The National Parent Helpline is still the right place for this: <strong>1-855-427-2736</strong>, call or text, any time.',
      action: { label: 'Call or text 1-855-427-2736', href: 'tel:18554272736' } },

    { id: 'SR-2',
      homeOnly: true,
      phrases: ['being bullied', 'bullied', 'bullying him', 'bullying her', 'bullies him',
                'bullies her', 'hits my son', 'hits my daughter', 'hitting my son',
                'hitting my daughter', 'hurting my son', 'hurting my daughter',
                'his brother hits him', 'her brother hits her', 'his sister hits him',
                'her sister hits her', 'someone hurt him', 'someone hurt her',
                'someone is hurting', 'scared of his dad', 'scared of her dad',
                'scared of his father', 'scared of her father', 'scared of his mom',
                'scared of her mom', 'afraid of his dad', 'afraid of her dad',
                'hurts other kids', 'hurts other children', 'hurt another child',
                'hurting other kids', 'bit another child', 'sent home for hitting',
                'hurting people', 'hurts people', 'hurting other', 'hurts other',
                'hitting other', 'hits other', 'biting other', 'bites other',
                'kicking other', 'kicks other', 'punching other', 'shoving other',
                'pushing and shoving', 'shoving people', 'pushing people',
                'beat up', 'beaten up', 'beating him up', 'beating her up',
                'picked on', 'picks on him', 'picks on her', 'picking on him', 'picking on her',
                'getting hurt at school', 'gets hurt at school'],
      say: 'That\u2019s a different situation from the one on this screen, and it deserves a straight answer. There\u2019s a page in this module written for it \u2014 <strong>\u201cBut what if my child is the one being hurt?\u201d</strong> \u2014 and it\u2019s a short read. Your answer is still here when you come back.',
      again: 'The page written for this is still one tap away.',
      action: { label: 'Read it', panel: 'panelHurt' } },

    { id: 'SR-3',
      homeOnly: true,
      phrases: ['he wants to die', 'she wants to die', 'wants to be dead', 'he said he wants to die',
                'she said she wants to die', 'wishes he was dead', 'wishes she was dead',
                'wishes he were dead', 'wishes she were dead', 'doesnt want to be alive',
                'doesnt want to live', 'he doesnt want to be here', 'she doesnt want to be here',
                'kill himself', 'kill herself', 'hurting himself', 'hurting herself',
                'hurts himself', 'hurts herself', 'hits himself', 'hits herself',
                'bangs his head', 'bangs her head', 'cuts himself', 'cuts herself',
                'talks about dying', 'talks about being dead', 'wants to disappear',
                'killing himself', 'killing herself', 'wants to hurt himself',
                'wants to hurt herself', 'harm himself', 'harm herself', 'harming himself',
                'harming herself'],
      /* Self-harm words about a child, not the parent. SR-3 is checked before
         SR-4, so without this "my kid keeps saying he wants to self-harm"
         reached SR-4's "self harm" and got the reply meant for the parent.
         Skipped when the parent is also speaking about themselves in the
         first person — then SR-4 is the right reply. */
      pair: {
        /* Only unambiguous words. The bare words "die" and "dead" are left out:
           "dead tired" and "she'd die for that chocolate" are ordinary.
           Explicit forms ("wants to die", "wants to be dead") are in the
           phrases above. */
        a: ['self harm', 'selfharm', 'suicide', 'suicidal', 'killing himself', 'killing herself',
            'kill himself', 'kill herself', 'end his life', 'end her life', 'cutting himself',
            'cutting herself', 'wants to die', 'want to die', 'not be alive', 'better off dead'],
        b: ['he', 'she', 'his', 'her', 'himself', 'herself', 'my kid', 'my son', 'my daughter',
            'my child', 'my boy', 'my girl'],
        unless: ['i want to die', 'kill myself', 'im suicidal', 'i feel suicidal',
                 'hurt myself', 'harm myself', 'i wish i was dead', 'i wish i were dead',
                 'i dont want to live', 'i dont want to be alive']
      },
      say: 'I\u2019d stop here rather than carry on with the exercise. What you\u2019ve described needs human intervention \u2014 your pediatrician is a good first call, and the 988 Suicide &amp; Crisis Lifeline takes calls and texts about a child you\u2019re worried about, not only about yourself. Call or text <strong>988</strong>. This module can wait.',
      again: 'This still needs a person rather than this module. Call or text <strong>988</strong>, or your pediatrician.',
      action: { label: 'Call or text 988', href: 'tel:988' } },

    { id: 'SR-4',
      phrases: ['kill myself', 'end my life', 'end it all', 'suicide', 'suicidal',
                'hurt myself', 'hurting myself', 'harm myself', 'self harm',
                'i want to die', 'i wanna die', 'wish i was dead', 'wish i were dead',
                'better off without me', 'i dont want to be alive', 'i dont want to live',
                'no reason to live', 'i dont want to be here anymore'],
      weak: ['cant do this anymore', 'cant do this any more', 'cant go on',
             'cant take it anymore', 'cant take this anymore', 'cant keep going',
             'i give up', 'i feel hopeless', 'im hopeless', 'i cant cope',
             'im falling apart', 'i have nothing left', 'at the end of my rope',
             'at my breaking point', 'im breaking'],
      second: ['hate myself', 'worthless', 'im a failure', 'dont see the point',
               'no point in anything', 'want it to stop', 'want it all to stop',
               'want to disappear', 'dont know how much longer', 'nobody would notice',
               'no one would notice', 'nobody would care', 'no one would care',
               'all alone', 'completely alone', 'every single day',
               'leaving my wife', 'leaving my husband', 'leaving my partner',
               'leaving my family', 'leaving my kids', 'leaving them', 'leave them all',
               'walk out on', 'walking out on', 'run away from', 'just disappear',
               'wont be here', 'not be here', 'cant be a parent', 'shouldnt be a parent'],
      say: 'Setting the exercise aside for a moment. You matter here too, not only as somebody\u2019s parent. The 988 Suicide &amp; Crisis Lifeline is free, confidential, and answers texts as well as calls \u2014 <strong>988</strong>. If this was just a hard day talking rather than something more, that\u2019s all right too; the question is still below whenever you want it.',
      again: 'Still here, and 988 still answers \u2014 call or text, any time.',
      action: { label: 'Call or text 988', href: 'tel:988' } },

    { id: 'SR-5',
      phrases: ['does this still apply', 'does this apply to', 'does this work for kids with',
                'does this work with adhd', 'does this work with autism',
                'he has an iep', 'she has an iep', 'is this normal for'],
      needs: {
        ask: ['what should i do', 'what do i do', 'what can i do', 'how do i get',
              'how do i stop', 'how can i stop', 'how do i make', 'is this normal',
              'is that normal', 'is it normal', 'should i be worried', 'should i worry',
              'am i doing something wrong', 'any advice', 'can you help', 'help me with',
              'what would you do', 'why does he', 'why does she', 'why wont he', 'why wont she'],
        /* Possessives listed too: apostrophes are dropped, so "my son's"
           arrives as "my sons" and would miss "my son". */
        child: ['my son', 'my sons', 'my daughter', 'my daughters', 'my kid', 'my kids',
                'my child', 'my childs', 'my boy', 'my boys', 'my girl', 'my girls',
                'my five year old', 'my 5 year old', 'my little one', 'iep', 'adhd',
                'autism', 'autistic', 'diagnosed', 'diagnosis', 'therapist', 'our house',
                'at home']
      },
      say: 'Sorry, I can\u2019t answer that one. This is a practice module, not someone who knows your child. For a real question about a real child, the people worth asking are your child\u2019s teacher or their pediatrician. The exercise below is still just practice, and you can pick it back up whenever.',
      again: 'Still one for your child\u2019s teacher or pediatrician rather than this module.',
      action: null }
  ]
};
