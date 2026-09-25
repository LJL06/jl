'use strict';

const root = document.documentElement;
const body = document.body;
root.classList.add('js');
root.dataset.motion = 'full';
root.dataset.design = 'garden';
body.classList.add('garden');
root.dataset.titleFont = 'wenkai';

const motionToggle = document.querySelector('.motion-toggle');
const motionEnabled = () => root.dataset.motion === 'full';
const heroInstrument = document.querySelector('.hero-instrument');

motionToggle?.addEventListener('click', () => {
  const enabled = !motionEnabled();
  root.dataset.motion = enabled ? 'full' : 'off';
  motionToggle.setAttribute('aria-pressed', String(enabled));
  motionToggle.textContent = enabled ? '动效 · 开' : '动效 · 关';

  if (!enabled) {
    heroInstrument?.style.removeProperty('--signal-x');
    heroInstrument?.style.removeProperty('--signal-y');
    document.querySelectorAll('.scroll-reveal').forEach(target => target.classList.add('is-visible'));
    document.querySelectorAll('.paper-wave').forEach(target => {
      target.classList.remove('paper-active', 'wave-active');
      target.style.removeProperty('--paper-shine-x');
      target.style.removeProperty('--paper-shine-y');
    });
  }
});

if (heroInstrument) {
  let heroFrame = 0;
  let heroPointer = null;

  heroInstrument.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || !motionEnabled()) return;
    heroPointer = { x: event.clientX, y: event.clientY };
    if (heroFrame) return;

    heroFrame = requestAnimationFrame(() => {
      heroFrame = 0;
      if (!heroPointer) return;
      const bounds = heroInstrument.getBoundingClientRect();
      const x = ((heroPointer.x - bounds.left) / bounds.width - .5) * 12;
      const y = ((heroPointer.y - bounds.top) / bounds.height - .5) * 10;
      heroInstrument.style.setProperty('--signal-x', `${x.toFixed(2)}px`);
      heroInstrument.style.setProperty('--signal-y', `${y.toFixed(2)}px`);
    });
  });

  heroInstrument.addEventListener('pointerleave', () => {
    heroPointer = null;
    heroInstrument.style.setProperty('--signal-x', '0px');
    heroInstrument.style.setProperty('--signal-y', '0px');
  });
}

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
    if (!motionEnabled()) return;
    cacheTextWaveLayout(target);
    target.classList.add('glyph-wave-active');
  });

  let frame = 0;
  let pointer = null;
  target.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || !motionEnabled()) return;
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
  '.note-item, .project-card, .research-case, .journal-grid article, .duet .featured',
);

waveTargets.forEach(target => {
  let frame = 0;
  let pointer = null;

  target.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch' || !motionEnabled()) return;
    target.classList.add('wave-active');
  });

  target.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || !motionEnabled()) return;
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

const paperTargets = document.querySelectorAll(
  '.note-item, .research-case, .engineering-grid .project-card, .journal-grid article',
);

paperTargets.forEach(target => {
  target.classList.add('paper-wave');
  let frame = 0;
  let pointer = null;

  target.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch' || !motionEnabled()) return;
    target.classList.add('paper-active');
  });

  target.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || !motionEnabled()) return;
    pointer = { x: event.clientX, y: event.clientY };
    if (frame) return;

    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!pointer) return;
      const bounds = target.getBoundingClientRect();
      const x = (pointer.x - bounds.left) / bounds.width;
      const y = (pointer.y - bounds.top) / bounds.height;

      target.style.setProperty('--paper-shine-x', `${(x * 100).toFixed(2)}%`);
      target.style.setProperty('--paper-shine-y', `${(y * 100).toFixed(2)}%`);
    });
  });

  target.addEventListener('pointerleave', () => {
    pointer = null;
    target.classList.remove('paper-active');
  });
});

const journalReader = document.querySelector('.journal-reader');

if (journalReader) {
  const journalControls = [...journalReader.querySelectorAll('[data-journal-target]')];
  const journalDots = [...journalReader.querySelectorAll('.journal-page-dot')];
  const journalPages = [...journalReader.querySelectorAll('[data-journal-page-panel]')];

  const showJournalPage = pageNumber => {
    journalReader.dataset.journalPage = pageNumber;

    journalDots.forEach(dot => {
      const active = dot.dataset.journalTarget === pageNumber;
      dot.classList.toggle('is-active', active);
      if (active) dot.setAttribute('aria-current', 'page');
      else dot.removeAttribute('aria-current');
    });

    journalPages.forEach(page => {
      const active = page.dataset.journalPagePanel === pageNumber;
      page.classList.toggle('is-active', active);
      page.setAttribute('aria-hidden', String(!active));
      page.inert = !active;
    });
  };

  journalControls.forEach(control => {
    control.addEventListener('click', () => {
      showJournalPage(control.dataset.journalTarget);
    });
  });
}

const revealTargets = [...document.querySelectorAll(
  '.featured, .section-heading, .note-item, .research-intro, .research-case, .engineering-heading, .project-card, .journal-grid article, .about',
)];

revealTargets.forEach((target, index) => {
  target.classList.add('scroll-reveal');
  target.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 40}ms`);
});

if (!motionEnabled() || !('IntersectionObserver' in window)) {
  revealTargets.forEach(target => target.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.12) {
        entry.target.classList.add('is-visible');
        return;
      }

      if (!entry.isIntersecting) {
        entry.target.classList.remove('is-visible');
      }
    });
  }, {
    rootMargin: '0px 0px -8% 0px',
    threshold: [0, 0.12],
  });

  revealTargets.forEach(target => revealObserver.observe(target));
}
