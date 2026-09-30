/* Conscious Discipline at Home — chrome strings.
   Edit the text between the quote marks. Nothing here is code.

   This file holds ONLY the text the shell writes into the page at runtime:
   the product name, the section names in the header, and the two nav
   buttons. Everything you can see spelled out in index.html — the About &
   reference panel, the resume strip, every screen — is edited there, in
   plain HTML, because that is easier to read than a list.

   Screen content arrives in its own files as each section is built:
   principles.js, quiz.js, scenarios.js, phrases.js, glossary.js, safety.js. */

window.CDAH_STRINGS = {

  productName: "Conscious Discipline at Home",

  /* Appended to productName in the header once a section has started, as
     "Conscious Discipline at Home · Learn". The key matches the
     data-section attribute on each screen in index.html. Before the first
     section the header shows productName alone. */
  sections: {
    learn:    { name: "Learn" },
    check:    { name: "Test Your Knowledge" },
    practice: { name: "Try It Out" }
  },

  nav: {
    back: "Back",
    next: "Next"
  },

  panel: {
    savedPrefix: "Last saved",   /* followed by "2 minutes ago" */
    save: { copied: "Copied." }
  },

  /* The End of Section 2 band. Written once, shown twice: on the dark
     close after the last quiz item (SCR-209), and on the light Section 3
     intro a parent sees when they jump straight to Try It Out from the
     title screen (SCR-300). Edit here and both change. The eyebrow and the
     title differ: a direct arrival hasn't done the thinking part. */
  close2: {
    eyebrowClose: "End of section 2",
    eyebrowIntro: "Section 3 of 3",
    title: "That\u2019s the thinking part done",
    titleIntro: "What would you say?",
    body: "Next is Try It Out \u2014 three real moments where you write what you\u2019d actually say. It takes about fifteen minutes, and it\u2019s the part worth doing when you\u2019re not rushing.",
    go: "Start Try It Out",
    stop: "Stop here for now",
    note: "Your place is saved on this device.",
    stopped: "Saved. Close this page whenever you like \u2014 you\u2019ll come back to this screen.",
    // NEW (package J). Intro 1, first visit: under the body.
    more: "Once you\u2019ve done all three, you can come back and try any one again.",
    // NEW. Part-way through: the button picks up at the next scene not yet done.
    goOn: "Carry on",
    // NEW. Intro 2, all three done: title and body change, the picker replaces Start.
    titlePick: "Try one again",
    bodyPick: "Pick a scene. Your strongest attempt on each is the one that counts.",
    // NEW. Scene names for the picker. Scenes 2 and 3 are placeholders until Marc's drafts land.
    scenes: [
      { id: "scn-301", name: "Screen time" },
      { id: "scn-302", name: "Scenario 2" },
      { id: "scn-303", name: "Scenario 3" }
    ],
    // NEW. The primary button on a scene's feedback.
    next: "Next scenario",
    finish: "Finish"
  }
};
