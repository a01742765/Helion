(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const story = document.querySelector('.solar-journey');
  if (!story) return;
  const steps = Array.from(story.querySelectorAll('[data-story-step]'));
  const count = document.querySelector('#story-count');
  const meter = document.querySelector('#solar-story-meter-progress');
  const root = document.documentElement;
  let active = -1;
  let scheduled = false;
  const setStep = (step) => {
    if (active === step) return;
    active = step;
    story.dataset.step = String(step);
    steps.forEach((element, index) => {
      const current = index === step;
      element.classList.toggle('is-current', current);
      element.toggleAttribute('inert', !current);
      element.setAttribute('aria-hidden', String(!current));
      element.querySelectorAll('a').forEach((link) => { if (!current) link.tabIndex = -1; else link.removeAttribute('tabindex'); });
    });
    if (count) count.textContent = `${String(step + 1).padStart(2, '0')} / 03`;
  };
  const update = () => {
    scheduled = false;
    const max = Math.max(1, story.offsetHeight - window.innerHeight);
    const position = Math.max(0, Math.min(max, -story.getBoundingClientRect().top));
    const progress = Math.max(0, Math.min(1, position / max));
    const step = Math.min(2, Math.floor(progress * 3));
    story.style.setProperty('--story-p', progress.toFixed(3));
    if (meter) meter.style.width = `${Math.min(100, (step + 1) * 100 / 3)}%`;
    setStep(step);
    const hero = document.querySelector('.hero');
    if (hero) { const hp = Math.max(0, Math.min(1,window.scrollY / Math.max(1, hero.offsetHeight))); hero.style.setProperty('--hero-scroll-p', hp.toFixed(3)); }
  };
  const tick = () => { if (!scheduled) { scheduled = true; window.requestAnimationFrame(update); } };
  const initMotion = () => {
    const enabled = !reduce.matches;
    root.classList.toggle('js-solar-story', enabled);
    if (!enabled) {
      active = -1;
      // Show all narratives in reading order when motion is reduced.
      steps.forEach(el => { el.removeAttribute('inert'); el.setAttribute('aria-hidden','false'); el.querySelectorAll('a').forEach(a => a.removeAttribute('tabindex')); });
      return;
    }
    active = -1; update();
  };
  initMotion();
  reduce.addEventListener?.('change', initMotion);
  window.addEventListener('scroll', tick, {passive:true});
  window.addEventListener('resize', tick);
  if (!reduce.matches && 'IntersectionObserver' in window) {
    root.classList.add('has-cinema-motion');
    const reveal = new IntersectionObserver(entries => { for (const e of entries) if (e.isIntersecting) {e.target.classList.add('is-revealed');reveal.unobserve(e.target);} }, {threshold:.1,rootMargin:'0px 0px -35px 0px'});
    document.querySelectorAll('.cinema-reveal').forEach(el => reveal.observe(el));
  }
})();
