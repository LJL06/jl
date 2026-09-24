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
