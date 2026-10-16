/* Journal glass surfaces and a balanced illustrated reading spread. */
(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const illustration = (source, className = '') => {
    const figure = document.createElement('figure');
    figure.className = 'editorial-vignette ' + className;
    figure.setAttribute('aria-hidden', 'true');
    const img = document.createElement('img');
    img.src = source;
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width = 1440;
    img.height = 1080;
    figure.append(img);
    return figure;
  };

  const profileBody = document.querySelector('.site-content-body-resume');
  if (profileBody) {
    const spread = document.createElement('div');
    spread.className = 'editorial-spread';
    profileBody.before(spread);
    spread.append(profileBody, illustration('assets/study-desk-v1.png', 'editorial-desk'));
  }
  const journalIntro = document.querySelector('.journal-index-intro');
  if (journalIntro) journalIntro.append(illustration('assets/journal-still-life-v1.png', 'editorial-notebook'));

  const arrangeProjectColumns = () => {
    const body = document.querySelector('.site-content-body-projects');
    if (!body) return;
    body.querySelectorAll(':scope > .project-text-column').forEach(column => column.replaceWith(...column.childNodes));
    const headings = [...body.children].filter(node => /^H[23]$/.test(node.tagName));
    if (headings.length !== 2) return;
    const columns = [document.createElement('div'), document.createElement('div')];
    columns.forEach(column => { column.className = 'project-text-column'; });
    let index = 0;
    [...body.children].forEach(node => {
      if (node === headings[1]) index = 1;
      columns[index].append(node);
    });
    body.append(...columns);
  };

  const cards = [...document.querySelectorAll('.journal-featured-note, .journal-archive-entry')];
  const clearCard = card => {
    card.style.removeProperty('--glass-x');
    card.style.removeProperty('--glass-y');
  };
  cards.forEach(card => {
    card.classList.add('glass-note');
    let frame = 0;
    let pointer = null;
    const enabled = () => root.dataset.motion === 'full' && !reduced.matches && finePointer.matches;
    card.addEventListener('pointermove', event => {
      if (!enabled() || event.pointerType === 'touch') return;
      pointer = { x: event.clientX, y: event.clientY };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!pointer || !enabled()) return;
        const bounds = card.getBoundingClientRect();
        card.style.setProperty('--glass-x', ((pointer.x - bounds.left) / bounds.width * 100).toFixed(1) + '%');
        card.style.setProperty('--glass-y', ((pointer.y - bounds.top) / bounds.height * 100).toFixed(1) + '%');
      });
    });
    card.addEventListener('pointerleave', () => { pointer = null; clearCard(card); });
  });
  const resetHighlights = () => cards.forEach(clearCard);
  reduced.addEventListener('change', resetHighlights);
  new MutationObserver(resetHighlights).observe(root, { attributes: true, attributeFilter: ['data-motion'] });

  const footer = document.querySelector('.site-footer');
  const returnLink = document.createElement('a');
  returnLink.className = 'back-to-top';
  returnLink.href = '#home';
  const returnText = document.createElement('span');
  const arrow = document.createElement('span');
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '↑';
  returnLink.append(returnText, arrow);
  returnLink.addEventListener('click', event => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: reduced.matches || root.dataset.motion !== 'full' ? 'instant' : 'smooth' });
    document.querySelector('.site-header .monogram')?.focus({ preventScroll: true });
  });
  footer?.append(returnLink);

  const translate = () => {
    const english = root.dataset.language === 'en';
    returnText.textContent = english ? 'Back to the beginning' : '回到开头';
    returnLink.setAttribute('aria-label', english ? 'Back to the beginning of the page' : '回到网页开头');
    arrangeProjectColumns();
  };
  document.addEventListener('portfolio:languagechange', translate);
  translate();
})();
