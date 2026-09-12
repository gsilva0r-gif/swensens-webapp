(() => {
  const rail = document.getElementById('reviews-grid');
  const controls = Array.from(document.querySelectorAll('[data-review-rail-dir]'));
  if (!rail || !controls.length) return;

  const updateControls = () => {
    const maximum = Math.max(0, rail.scrollWidth - rail.clientWidth);
    controls.forEach(control => {
      const direction = Number(control.dataset.reviewRailDir) || 1;
      control.disabled = direction < 0 ? rail.scrollLeft <= 8 : rail.scrollLeft >= maximum - 8;
    });
  };

  controls.forEach(control => {
    control.addEventListener('click', () => {
      const direction = Number(control.dataset.reviewRailDir) || 1;
      const card = rail.querySelector('.review');
      const distance = card ? card.getBoundingClientRect().width + 20 : Math.min(520, rail.clientWidth * .8);
      rail.scrollBy({left: direction * distance, behavior: 'smooth'});
    });
  });

  rail.addEventListener('scroll', updateControls, {passive: true});
  window.addEventListener('resize', updateControls);
  new MutationObserver(updateControls).observe(rail, {childList: true});
  updateControls();
})();
