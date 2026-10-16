/* Local preview: a reading thread, with native scrolling and small decorative offsets. */
(() => {
  const root = document.documentElement;
  const main = document.querySelector('#main');
  if (!main) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const small = matchMedia('(max-width: 850px), (pointer: coarse)');
  const chapters = [
    ['home', '起点', 'Begin'], ['resume', '理解', 'Understand'],
    ['skills', '方法', 'Methods'], ['projects', '实践', 'Build'],
    ['journal', '记录', 'Reflect'], ['about', '继续', 'Continue'],
  ].map(([id, zh, en]) => ({ element: document.getElementById(id), id, zh, en }))
    .filter(chapter => chapter.element && !chapter.element.hidden);
  if (!chapters.length) return;

  const rail = document.createElement('nav');
  rail.className = 'story-rail';
  const label = document.createElement('span');
  label.className = 'story-rail-title';
  const track = document.createElement('div');
  track.className = 'story-track';
  rail.append(label, track);
  chapters.forEach((chapter, index) => {
    const link = document.createElement('a');
    link.href = '#' + chapter.id;
    const dot = document.createElement('span');
    dot.className = 'story-dot';
    dot.setAttribute('aria-hidden', 'true');
    const caption = document.createElement('span');
    caption.className = 'story-label';
    const number = document.createElement('small');
    number.textContent = String(index + 1).padStart(2, '0');
    number.setAttribute('aria-hidden', 'true');
    link.append(dot, number, caption);
    track.append(link);
    Object.assign(chapter, { link, caption });
  });
  document.body.append(rail);

  const bridges = [
    { id: 'projects', zh: '把理解放进实验，再让它真正运行。', en: 'Put understanding to the test. Then make it work.' },
    { id: 'journal', zh: '做过的事情，值得把过程留下来。', en: 'Keep a record of how the work takes shape.' },
  ].flatMap(bridge => {
    const section = chapters.find(chapter => chapter.id === bridge.id)?.element;
    if (!section) return [];
    const element = document.createElement('div');
    element.className = 'story-bridge wrap';
    const text = document.createElement('p');
    element.append(text);
    element.insertAdjacentHTML('beforeend', '<svg class="story-bridge-mark" viewBox="0 0 160 48" aria-hidden="true"><path class="story-mark-base" d="M2 30H33C49 30 42 10 57 10S64 38 79 38S88 20 104 20H156"/><path class="story-mark-drawn" pathLength="1" d="M2 30H33C49 30 42 10 57 10S64 38 79 38S88 20 104 20H156"/><circle cx="156" cy="20" r="2"/></svg>');
    section.before(element);
    return [{ ...bridge, element, text, mark: element.querySelector('svg') }];
  });

  const layers = [];
  const addLayer = (element, anchor, strength, limit) => {
    if (!element || !anchor) return;
    element.classList.add('story-parallax');
    layers.push({ element, anchor, strength, limit });
  };
  const hero = document.querySelector('#home');
  addLayer(document.querySelector('.atmosphere-grid'), hero, .07, 42);
  addLayer(document.querySelector('.signal-canvas'), hero, .09, 28);
  bridges.forEach(bridge => addLayer(bridge.mark, bridge.element, .06, 18));

  let frame = 0;
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const update = () => {
    frame = 0;
    const height = window.innerHeight;
    const enabled = root.dataset.motion === 'full' && !reduced.matches && !small.matches;
    const positions = chapters.map(chapter => chapter.element.getBoundingClientRect());
    let current = 0;
    positions.forEach((bounds, index) => { if (bounds.top <= height * .4) current = index; });
    const atBottom = window.scrollY + height >= document.documentElement.scrollHeight - 3;
    if (atBottom) current = chapters.length - 1;
    const start = positions[current].top;
    const next = positions[current + 1]?.top;
    const fraction = next == null ? 0 : clamp((height * .4 - start) / Math.max(1, next - start));
    rail.style.setProperty('--story-progress', String((current + fraction) / Math.max(1, chapters.length - 1)));
    chapters.forEach((chapter, index) => {
      if (index === current) chapter.link.setAttribute('aria-current', 'step');
      else chapter.link.removeAttribute('aria-current');
      chapter.link.classList.toggle('is-read', index < current);
    });
    layers.forEach(({ element, anchor, strength, limit }) => {
      const bounds = anchor.getBoundingClientRect();
      const offset = enabled ? clamp((height * .5 - (bounds.top + bounds.height * .5)) * strength, -limit, limit) : 0;
      element.style.setProperty('--parallax-y', offset.toFixed(2) + 'px');
    });
    bridges.forEach(bridge => {
      const top = bridge.element.getBoundingClientRect().top;
      const progress = enabled ? clamp((height * .9 - top) / (height * .65)) : 1;
      bridge.mark.style.setProperty('--line-progress', String(progress));
    });
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  const translate = () => {
    const english = root.dataset.language === 'en';
    label.textContent = english ? 'A WORK IN PROGRESS' : '一条仍在继续的路';
    rail.setAttribute('aria-label', english ? 'Reading journey' : '阅读路径');
    chapters.forEach(chapter => {
      chapter.caption.textContent = english ? chapter.en : chapter.zh;
      chapter.link.setAttribute('aria-label', english ? chapter.en : chapter.zh);
    });
    bridges.forEach(bridge => { bridge.text.textContent = english ? bridge.en : bridge.zh; });
    schedule();
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  document.addEventListener('portfolio:languagechange', translate);
  reduced.addEventListener('change', schedule);
  small.addEventListener('change', schedule);
  new MutationObserver(schedule).observe(root, { attributes: true, attributeFilter: ['data-motion'] });
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(main);
  document.fonts?.ready.then(schedule);
  translate();
})();
