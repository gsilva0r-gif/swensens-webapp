/* Start the approved logo animation only after the homepage has loaded.
   The animation file itself has one play, so it rests on the final mark. */
(() => {
  const hero = document.querySelector('.brand-intro');
  const logo = document.querySelector('.brand-logo-animation');
  const navigation = document.querySelector('.site-nav');
  if (!hero || !logo) return;

  const updateNavigationHeight = () => {
    if (navigation) hero.style.setProperty('--brand-nav-height', `${navigation.offsetHeight}px`);
  };
  updateNavigationHeight();
  if ('ResizeObserver' in window && navigation) {
    new ResizeObserver(updateNavigationHeight).observe(navigation);
  } else {
    window.addEventListener('resize', updateNavigationHeight, {passive:true});
  }

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let started = false;

  const showSource = source => {
    logo.classList.remove('is-ready');
    const reveal = () => logo.classList.add('is-ready');
    logo.addEventListener('load', reveal, {once:true});
    logo.src = source;
  };

  const start = () => {
    if (started) return;
    started = true;
    const animationSource = logo.dataset.animationSrc;
    const staticSource = logo.dataset.staticSrc;
    if (motion.matches) {
      logo.src = staticSource;
      logo.classList.add('is-ready');
      return;
    }
    logo.addEventListener('error', () => {
      logo.src = staticSource;
      logo.classList.add('is-ready');
    }, {once:true});
    showSource(animationSource);
  };

  const startWhenImagesAreConfigured = () => {
    Promise.resolve(window.swensensImagesReady).finally(() => requestAnimationFrame(start));
  };

  if (document.readyState === 'complete') startWhenImagesAreConfigured();
  else window.addEventListener('load', startWhenImagesAreConfigured, {once:true});

  motion.addEventListener('change', event => {
    if (event.matches) {
      logo.src = logo.dataset.staticSrc;
      logo.classList.add('is-ready');
    }
  });
})();
