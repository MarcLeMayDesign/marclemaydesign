/* The two-pass toggles on the Other Work page.
   Without this file each frame shows its first slide, which is the
   correct default; the toggle is the enhancement. */
(function () {
  [].forEach.call(document.querySelectorAll('.slide-row'), function (row) {
    var buttons = [].slice.call(row.querySelectorAll('.pass'));
    if (!buttons.length) return;
    var img = row.querySelector('.slide-frame img');

    // Preload the second pass so the swap does not flash.
    buttons.forEach(function (b) { var p = new Image(); p.src = b.getAttribute('data-src'); });

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        img.src = btn.getAttribute('data-src');
        img.alt = btn.getAttribute('data-alt');
        buttons.forEach(function (b) { b.classList.toggle('is-current', b === btn); });
      });
    });
  });
})();
