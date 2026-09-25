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
  const journalPager = journalReader.querySelector('.journal-pager');
  const journalPagesContainer = journalReader.querySelector('.journal-pages');
  const journalStatus = document.querySelector('#journal-status');
  const articles = Array.isArray(window.PUBLIC_JOURNAL_DATA?.articles)
    ? window.PUBLIC_JOURNAL_DATA.articles.filter(article => article && article.id && article.title)
    : [];

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);

  const renderInlineMarkdown = value => escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/~~([^~]+)~~/g, '<del>$1</del>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');

  const renderMarkdown = markdown => {
    const lines = String(markdown ?? '').replace(/\r\n?/g, '\n').split('\n');
    const blocks = [];
    let index = 0;

    while (index < lines.length) {
      const line = lines[index];
      if (!line.trim()) {
        index += 1;
        continue;
      }

      if (/^\s*```/.test(line)) {
        index += 1;
        const codeLines = [];
        while (index < lines.length && !/^\s*```/.test(lines[index])) {
          codeLines.push(lines[index]);
          index += 1;
        }
        if (index < lines.length) index += 1;
        blocks.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
        continue;
      }

      const heading = line.match(/^(#{1,6})\s+(.+)$/);
      if (heading) {
        const level = heading[1].length;
        blocks.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
        index += 1;
        continue;
      }

      if (/^\s*>/.test(line)) {
        const quoteLines = [];
        while (index < lines.length && /^\s*>/.test(lines[index])) {
          quoteLines.push(lines[index].replace(/^\s*>\s?/, ''));
          index += 1;
        }
        blocks.push(`<blockquote><p>${quoteLines.map(renderInlineMarkdown).join('<br>')}</p></blockquote>`);
        continue;
      }

      const listMatch = line.match(/^\s*(-|\*|\+|\d+\.)\s+(.+)$/);
      if (listMatch) {
        const ordered = /^\d+\./.test(listMatch[1]);
        const listTag = ordered ? 'ol' : 'ul';
        const items = [];
        while (index < lines.length) {
          const item = lines[index].match(/^\s*(-|\*|\+|\d+\.)\s+(.+)$/);
          if (!item || /^\d+\./.test(item[1]) !== ordered) break;
          items.push(`<li>${renderInlineMarkdown(item[2])}</li>`);
          index += 1;
        }
        blocks.push(`<${listTag}>${items.join('')}</${listTag}>`);
        continue;
      }

      const paragraph = [];
      while (index < lines.length && lines[index].trim()) {
        if (paragraph.length && (/^\s*```/.test(lines[index])
          || /^#{1,6}\s+/.test(lines[index])
          || /^\s*>/.test(lines[index])
          || /^\s*(-|\*|\+|\d+\.)\s+/.test(lines[index]))) break;
        paragraph.push(lines[index].trim());
        index += 1;
      }
      blocks.push(`<p>${renderInlineMarkdown(paragraph.join(' '))}</p>`);
    }

    return blocks.join('\n');
  };

  const indexPage = `
    <article class="journal-page journal-page-index is-active" data-journal-page-panel="0" aria-labelledby="journal-index-title">
      <header class="journal-page-header">
        <span class="eyebrow">PAGE 01 / INDEX</span>
        <p>研究、工程与学习留下的真实过程。</p>
      </header>
      <h3 id="journal-index-title">不只展示结果，也记录问题是怎样被理解的。</h3>
      ${articles.length
        ? `<div class="journal-index-list">${articles.map((article, articleIndex) => `
          <button type="button" class="journal-index-card" data-journal-target="${articleIndex + 1}" aria-label="阅读手记：${escapeHtml(article.title)}">
            <strong>${escapeHtml(article.title)}</strong><b aria-hidden="true">↗</b>
          </button>`).join('')}
        </div>
        <button type="button" class="journal-turn journal-turn-next" data-journal-target="1">
          <span>阅读第一篇手记</span><b aria-hidden="true">↳</b>
        </button>`
        : '<p class="journal-empty">手记正在整理中，之后会在这里更新。</p>'}
    </article>`;

  const articlePages = articles.map((article, articleIndex) => {
    const pageNumber = articleIndex + 1;
    const panelNumber = pageNumber;
    const publicPageNumber = pageNumber + 1;
    return `
      <article class="journal-page journal-page-article" data-journal-page-panel="${panelNumber}" aria-labelledby="journal-article-title-${articleIndex}" aria-hidden="true" inert>
        <header class="journal-page-header">
          <span class="eyebrow">PAGE ${String(publicPageNumber).padStart(2, '0')} / STUDY NOTE ${String(pageNumber).padStart(3, '0')}</span>
          <p>${escapeHtml(article.date || '')}${article.date && article.category ? ' · ' : ''}${escapeHtml(article.category || '')}</p>
        </header>
        <div class="journal-article-layout">
          <div>
            <h3 id="journal-article-title-${articleIndex}">${escapeHtml(article.title)}</h3>
            ${article.summary ? `<p class="journal-article-lede">${escapeHtml(article.summary)}</p>` : ''}
          </div>
          <div class="journal-article-body">${renderMarkdown(article.body_markdown)}</div>
        </div>
        <button type="button" class="journal-turn journal-turn-back" data-journal-target="0">
          <b aria-hidden="true">↰</b><span>返回手记首页</span>
        </button>
      </article>`;
  });

  journalPager.innerHTML = `${Array.from({ length: articles.length + 1 }, (_, pageIndex) => `
    <button type="button" class="journal-page-dot${pageIndex === 0 ? ' is-active' : ''}"
      data-journal-target="${pageIndex}"${pageIndex === 0 ? ' aria-current="page"' : ''}
      aria-label="${pageIndex === 0 ? '显示手记首页' : `显示手记：${escapeHtml(articles[pageIndex - 1]?.title || '')}`}">
      <span aria-hidden="true"></span><small>${String(pageIndex + 1).padStart(2, '0')}</small>
    </button>`).join('')}${articles.length ? '<i class="journal-page-line" aria-hidden="true"></i>' : ''}`;
  journalPagesContainer.innerHTML = [indexPage, ...articlePages].join('');

  const journalDots = [...journalPager.querySelectorAll('.journal-page-dot')];
  const journalPages = [...journalPagesContainer.querySelectorAll('[data-journal-page-panel]')];

  const showJournalPage = pageNumber => {
    const targetPage = String(pageNumber);
    if (!journalPages.some(page => page.dataset.journalPagePanel === targetPage)) return;

    journalReader.dataset.journalPage = targetPage;
    journalDots.forEach(dot => {
      const active = dot.dataset.journalTarget === targetPage;
      dot.classList.toggle('is-active', active);
      if (active) dot.setAttribute('aria-current', 'page');
      else dot.removeAttribute('aria-current');
    });

    journalPages.forEach(page => {
      const active = page.dataset.journalPagePanel === targetPage;
      page.classList.toggle('is-active', active);
      page.setAttribute('aria-hidden', String(!active));
      page.inert = !active;
    });
  };

  journalReader.addEventListener('click', event => {
    const control = event.target.closest('[data-journal-target]');
    if (control && journalReader.contains(control)) {
      showJournalPage(control.dataset.journalTarget);
    }
  });

  showJournalPage('0');
  if (journalStatus) {
    journalStatus.textContent = articles.length
      ? `${articles.length} 篇手记 · 点击标题卡片阅读`
      : '手记内容持续整理中';
  }
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
