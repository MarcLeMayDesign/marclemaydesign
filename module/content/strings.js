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
  }
};
