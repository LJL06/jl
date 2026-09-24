'use strict';

const root = document.documentElement;
const body = document.body;
const options = [...document.querySelectorAll('[data-design-option]')];
const directions = ['essay', 'duet', 'garden'];

function selectDirection(direction) {
  if (!directions.includes(direction)) return;

  root.dataset.design = direction;
  body.classList.remove(...directions);
  body.classList.add(direction);

  options.forEach(option => {
    option.setAttribute(
      'aria-pressed',
      String(option.dataset.designOption === direction),
    );
  });
}

selectDirection(root.dataset.design || 'essay');

options.forEach((option, index) => {
  option.addEventListener('click', () => {
    selectDirection(option.dataset.designOption);
  });

  option.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const offset = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = (index + offset + options.length) % options.length;
    options[nextIndex].focus();
    selectDirection(options[nextIndex].dataset.designOption);
  });
});

const waveTargets = document.querySelectorAll(
  '.note-item, .project-card, .duet .featured',
);

waveTargets.forEach(target => {
  target.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch') return;
    target.classList.add('wave-active');
  });

  target.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    const bounds = target.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    target.style.setProperty('--wave-x', `${x}%`);
    target.style.setProperty('--wave-y', `${y}%`);
  });

  target.addEventListener('pointerleave', () => {
    target.classList.remove('wave-active');
  });
});
