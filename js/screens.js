/* The embedded screen viewer on the case study.
   Without this file all four screens are in the DOM and readable; the
   chips, the prev/next buttons and the zoom are the enhancement. */
(function () {
  var frame = document.getElementById('screen-frame');
  if (!frame) return;

  var scale = document.getElementById('screen-scale');
  var closeBtn = document.getElementById('screen-close');
  var screens = [].slice.call(frame.querySelectorAll('.screen'));
  var chips = [].slice.call(document.querySelectorAll('.chip'));
  var caps = [].slice.call(document.querySelectorAll('.step-caption'));
  var step = 0;
  var zoomed = false;

  function fit() {
    if (zoomed) { scale.style.transform = ''; frame.style.height = ''; return; }
    var s = Math.min(1, frame.clientWidth / 960);
    scale.style.transform = 'scale(' + s + ')';
    frame.style.height = Math.round(640 * s) + 'px';
  }

  function show(n) {
    step = (n + screens.length) % screens.length;
    screens.forEach(function (el, i) { el.hidden = i !== step; });
    chips.forEach(function (el, i) {
      el.classList.toggle('is-current', i === step);
      el.setAttribute('aria-pressed', i === step ? 'true' : 'false');
    });
    caps.forEach(function (el, i) { el.hidden = i !== step; });
  }

  function setZoom(v) {
    zoomed = v;
    frame.classList.toggle('is-zoomed', v);
    closeBtn.hidden = !v;
    document.body.style.overflow = v ? 'hidden' : '';
    fit();
    (v ? closeBtn : frame).focus();
  }

  chips.forEach(function (el) {
    el.addEventListener('click', function () { show(+el.getAttribute('data-step')); });
  });
  document.getElementById('screen-prev').addEventListener('click', function () { show(step - 1); });
  document.getElementById('screen-next').addEventListener('click', function () { show(step + 1); });

  frame.addEventListener('click', function () { setZoom(!zoomed); });
  frame.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); setZoom(!zoomed); }
  });
  closeBtn.addEventListener('click', function (e) { e.stopPropagation(); setZoom(false); });
  window.addEventListener('keydown', function (e) { if (e.key === 'Escape' && zoomed) setZoom(false); });
  window.addEventListener('resize', fit);
  if (typeof ResizeObserver !== 'undefined') { new ResizeObserver(fit).observe(frame); }

  show(0);
  fit();
})();
