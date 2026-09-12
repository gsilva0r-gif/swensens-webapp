(() => {
  const track = document.querySelector('[data-history-track]');
  const controls = Array.from(document.querySelectorAll('[data-history-direction]'));
  const status = document.querySelector('[data-history-status]');

  const updateTimelineControls = () => {
    if (!track || !controls.length) return;
    const maximum = Math.max(0, track.scrollWidth - track.clientWidth);
    const atStart = track.scrollLeft <= 8;
    const atEnd = track.scrollLeft >= maximum - 8;
    controls.forEach(control => {
      control.disabled = Number(control.dataset.historyDirection) < 0 ? atStart : atEnd;
    });
    if (status) {
      status.textContent = atStart
        ? 'Beginning of the timeline'
        : atEnd
          ? 'Today at Hyde & Union'
          : 'More Swensen\'s history';
    }
  };

  if (track && controls.length) {
    controls.forEach(control => {
      control.addEventListener('click', () => {
        const direction = Number(control.dataset.historyDirection) || 1;
        const distance = Math.max(300, Math.min(520, track.clientWidth * 0.72));
        track.scrollBy({left: direction * distance, behavior: 'smooth'});
      });
    });
    track.addEventListener('scroll', updateTimelineControls, {passive: true});
    window.addEventListener('resize', updateTimelineControls);
    updateTimelineControls();
  }

  const steps = Array.from(document.querySelectorAll('[data-story-step]'));
  const photos = Array.from(document.querySelectorAll('[data-story-photo]'));
  if (!steps.length || !photos.length) return;

  let activeKey = '';
  let activeIndex = Math.max(0, steps.findIndex(step => step.classList.contains('is-active')));

  const activate = key => {
    if (!key || key === activeKey) return;
    activeKey = key;
    activeIndex = Math.max(0, steps.findIndex(step => step.dataset.storyStep === key));
    steps.forEach(step => {
      const active = step.dataset.storyStep === key;
      step.classList.toggle('is-active', active);
      if (active) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
    photos.forEach(photo => photo.classList.toggle('is-active', photo.dataset.storyPhoto === key));
  };

  steps.forEach(step => {
    step.addEventListener('focusin', () => activate(step.dataset.storyStep));
    step.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse') activate(step.dataset.storyStep);
    });
    step.addEventListener('click', () => activate(step.dataset.storyStep));
  });

  let scrollFrame = 0;
  let initialized = false;

  const syncActiveChapter = () => {
    scrollFrame = 0;
    const triggerLine = window.innerHeight * 0.46;
    let candidate = 0;

    steps.forEach((step, index) => {
      if (step.getBoundingClientRect().top <= triggerLine) candidate = index;
    });

    if (!initialized) {
      activeIndex = candidate;
      initialized = true;
    } else if (candidate > activeIndex) {
      while (
        activeIndex < steps.length - 1 &&
        steps[activeIndex + 1].getBoundingClientRect().top <= triggerLine - 24
      ) activeIndex += 1;
    } else if (candidate < activeIndex) {
      while (
        activeIndex > 0 &&
        steps[activeIndex].getBoundingClientRect().top >= triggerLine + 24
      ) activeIndex -= 1;
    }

    activate(steps[activeIndex].dataset.storyStep);
  };

  const scheduleChapterSync = () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(syncActiveChapter);
  };

  window.addEventListener('scroll', scheduleChapterSync, {passive: true});
  window.addEventListener('resize', scheduleChapterSync);
  window.visualViewport?.addEventListener('resize', scheduleChapterSync);
  scheduleChapterSync();
})();
