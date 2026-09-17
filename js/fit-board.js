(function(){
  // The boards are artboards built around a 960px screen card inside a section
  // with 44px of padding each side. Scaling has to fit THAT, not the board's
  // unwrapped width: the card rows are flex-wrap, so measuring max-content
  // unwraps them and collapses the scale to nothing.
  var DEFAULT_REFERENCE = 1048;

  function inner(board){
    var el = board.querySelector(':scope > .board-inner');
    if (!el) {
      el = document.createElement('div');
      el.className = 'board-inner';
      while (board.firstChild) el.appendChild(board.firstChild);
      board.appendChild(el);
    }
    el.style.transformOrigin = 'top left';
    return el;
  }

  function fit(board){
    var el = inner(board);
    var ref = parseInt(board.getAttribute('data-board-width'), 10) || DEFAULT_REFERENCE;
    el.style.transform = 'none';
    el.style.width = ref + 'px';
    board.style.height = '';
    var s = Math.min(1, board.clientWidth / ref);
    el.style.transform = 'scale(' + s + ')';
    board.style.height = Math.round(el.offsetHeight * s) + 'px';
    board.style.overflow = 'hidden';

    // A few rows in these documents are authored flex-wrap:nowrap and are
    // wider than the reference — the soft-vs-crisp comparison pair is nearly
    // 2x960. Raising the reference for all of them would take the whole board
    // to ~6px type, so those rows get their own scroll axis instead of being
    // clipped by the board's overflow.
    var kids = el.querySelectorAll('*');
    for (var i = 0; i < kids.length; i++) {
      var k = kids[i];
      if (k.scrollWidth > k.clientWidth + 1 && k.clientWidth > 0) {
        k.style.overflowX = 'auto';
        k.style.overflowY = 'hidden';
      }
    }
  }

  function all(){
    var boards = document.querySelectorAll('.doc-board');
    for (var i = 0; i < boards.length; i++) fit(boards[i]);
  }

  if (document.readyState === 'complete') all();
  else window.addEventListener('load', all);
  window.addEventListener('resize', all);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(all);
})();
