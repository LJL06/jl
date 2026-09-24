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

const fontOptions = [...document.querySelectorAll('[data-title-font-option]')];
const titleFonts = ['wenkai', 'smiley'];
const titleFontStorageKey = 'personal-site-title-font-v2';

function selectTitleFont(font) {
  if (!titleFonts.includes(font)) return;

  root.dataset.titleFont = font;
  fontOptions.forEach(option => {
    option.setAttribute(
      'aria-pressed',
      String(option.dataset.titleFontOption === font),
    );
  });

  try {
    localStorage.setItem(titleFontStorageKey, font);
  } catch {
    // The selector still works if browser storage is unavailable.
  }
}

let savedTitleFont = root.dataset.titleFont || 'wenkai';
try {
  savedTitleFont = localStorage.getItem(titleFontStorageKey) || savedTitleFont;
} catch {
  // Fall back to the page default if browser storage is unavailable.
}
selectTitleFont(savedTitleFont);

fontOptions.forEach((option, index) => {
  option.addEventListener('click', () => {
    selectTitleFont(option.dataset.titleFontOption);
  });

  option.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const offset = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = (index + offset + fontOptions.length) % fontOptions.length;
    fontOptions[nextIndex].focus();
    selectTitleFont(fontOptions[nextIndex].dataset.titleFontOption);
  });
});

const textWaveTargets = [...document.querySelectorAll(
  '.featured-heading h2, .note-item h3, .project-main h3',
)];
const textWaveLayouts = new WeakMap();
const segmenter = typeof Intl.Segmenter === 'function'
  ? new Intl.Segmenter('zh-CN', { granularity: 'grapheme' })
  : null;

textWaveTargets.forEach(target => {
  const text = target.textContent.trim();
  const graphemes = segmenter
    ? [...segmenter.segment(text)].map(item => item.segment)
    : Array.from(text);
  target.setAttribute('aria-label', text);
  target.classList.add('glyph-wave-target');
  target.replaceChildren(...graphemes.map(grapheme => {
    const glyph = document.createElement('span');
    glyph.className = 'glyph-wave';
    glyph.setAttribute('aria-hidden', 'true');
    glyph.textContent = grapheme;
    return glyph;
  }));
});

function cacheTextWaveLayout(target) {
  const glyphs = [...target.querySelectorAll('.glyph-wave')];
  textWaveLayouts.set(target, glyphs.map(glyph => {
    const bounds = glyph.getBoundingClientRect();
    return { glyph, x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
  }));
}

textWaveTargets.forEach(target => {
  cacheTextWaveLayout(target);
  target.addEventListener('pointerenter', () => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    cacheTextWaveLayout(target);
    target.classList.add('glyph-wave-active');
  });

  let frame = 0;
  let pointer = null;
  target.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    pointer = { x: event.clientX, y: event.clientY };
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!pointer) return;
      textWaveLayouts.get(target)?.forEach(({ glyph, x, y }) => {
        const distance = Math.hypot(x - pointer.x, (y - pointer.y) * .72);
        const displacement = Math.sin(distance / 17) * Math.exp(-distance / 74) * 2.5;
        glyph.style.setProperty('--glyph-y', `${displacement.toFixed(2)}px`);
      });
    });
  });

  target.addEventListener('pointerleave', () => {
    pointer = null;
    target.classList.remove('glyph-wave-active');
    target.querySelectorAll('.glyph-wave').forEach(glyph => {
      glyph.style.removeProperty('--glyph-y');
    });
  });
});

const refreshTextWaveLayout = () => textWaveTargets.forEach(cacheTextWaveLayout);
window.addEventListener('resize', refreshTextWaveLayout, { passive: true });
if (document.fonts?.ready) document.fonts.ready.then(refreshTextWaveLayout);

const waveTargets = document.querySelectorAll(
  '.note-item, .project-card, .duet .featured',
);

waveTargets.forEach(target => {
  let frame = 0;
  let pointer = null;

  target.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch') return;
    target.classList.add('wave-active');
  });

  target.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    pointer = { x: event.clientX, y: event.clientY };
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!pointer) return;
      const bounds = target.getBoundingClientRect();
      const x = ((pointer.x - bounds.left) / bounds.width) * 100;
      const y = ((pointer.y - bounds.top) / bounds.height) * 100;
      target.style.setProperty('--wave-x', `${x.toFixed(2)}%`);
      target.style.setProperty('--wave-y', `${y.toFixed(2)}%`);
    });
  });

  target.addEventListener('pointerleave', () => {
    pointer = null;
    target.classList.remove('wave-active');
  });
});
