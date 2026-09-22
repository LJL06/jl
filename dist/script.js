'use strict';
const letters = document.querySelectorAll('.name-word > span');
letters.forEach((letter, index) => letter.style.setProperty('--i', index));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.documentElement.classList.add('motion-ready');
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}
document.querySelector('#replay').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (reducedMotion.matches) return;
  letters.forEach(letter => { letter.style.animation = 'none'; });
  requestAnimationFrame(() => requestAnimationFrame(() => {
    letters.forEach(letter => { letter.style.animation = ''; });
  }));
});
