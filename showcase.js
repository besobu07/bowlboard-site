(() => {
  const showcase = document.querySelector('.product-showcase');
  if (!showcase) return;
  const tabs = [...showcase.querySelectorAll('[data-preview]')];
  const play = document.getElementById('showcase-play');
  if (!play || tabs.length < 2) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const interval = 3000;
  let active = Math.max(0, tabs.findIndex(t => t.getAttribute('aria-pressed') === 'true'));
  let playing = !motion.matches;
  let hovered = false, focused = showcase.contains(document.activeElement);
  let visible = !('IntersectionObserver' in window), timer = null;

  function select(index) {
    active = (index + tabs.length) % tabs.length;
    tabs.forEach((tab, i) => {
      const selected = i === active;
      tab.setAttribute('aria-pressed', String(selected));
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      if (panel) panel.hidden = !selected;
    });
  }
  function schedule() {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    if (!playing || hovered || focused || !visible || document.hidden) return;
    timer = setTimeout(() => {
      timer = null;
      select(active + 1);
      schedule();
    }, interval);
  }
  function updateControl() {
    play.textContent = playing ? 'Ⅱ Pause' : '▶ Play';
    play.setAttribute('aria-label', playing ? 'Pause automatic feature rotation' : 'Start automatic feature rotation');
  }
  tabs.forEach((tab, i) => tab.addEventListener('click', () => {
    select(i);
    schedule();
  }));
  play.addEventListener('click', () => {
    playing = !playing;
    updateControl();
    schedule();
  });
  showcase.addEventListener('pointerenter', e => {
    if (e.pointerType === 'mouse' || e.pointerType === 'pen') { hovered = true; schedule(); }
  });
  showcase.addEventListener('pointerleave', () => { hovered = false; schedule(); });
  showcase.addEventListener('focusin', () => { focused = true; schedule(); });
  showcase.addEventListener('focusout', e => {
    focused = !!e.relatedTarget && showcase.contains(e.relatedTarget);
    schedule();
  });
  document.addEventListener('visibilitychange', schedule);
  const motionChanged = e => {
    if (e.matches) { playing = false; updateControl(); }
    schedule();
  };
  if (motion.addEventListener) motion.addEventListener('change', motionChanged);
  else if (motion.addListener) motion.addListener(motionChanged);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      schedule();
    }, { threshold: 0 });
    observer.observe(showcase);
  }
  play.hidden = false;
  select(active);
  updateControl();
  schedule();
})();
