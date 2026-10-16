'use strict';

const root = document.documentElement;
const body = document.body;
const designChoices = ['essay', 'duet', 'garden'];
const readPreference = key => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};
const writePreference = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Theme controls remain usable when storage is unavailable.
  }
};
const initialDesign = designChoices.includes(readPreference('jl-site-design'))
  ? readPreference('jl-site-design')
  : 'garden';
const initialTheme = readPreference('jl-site-theme') === 'night' ? 'night' : 'day';
root.classList.add('js');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
root.dataset.motion = reducedMotion.matches ? 'off' : 'full';
root.dataset.design = initialDesign;
root.dataset.palette = 'blueprint';
root.dataset.theme = initialTheme;
body.classList.add(initialDesign);
root.dataset.titleFont = 'wenkai';

const motionToggle = document.querySelector('.motion-toggle');
const themeToggle = document.querySelector('.theme-toggle');
const motionEnabled = () => root.dataset.motion === 'full' && !reducedMotion.matches;
const heroInstrument = document.querySelector('.hero-instrument');

const syncAppearanceControls = () => {
  const english = root.dataset.language === 'en';
  const isNight = root.dataset.theme === 'night';
  if (themeToggle) {
    themeToggle.setAttribute('aria-pressed', String(isNight));
    themeToggle.setAttribute('aria-label', english ? `Switch to ${isNight ? 'day' : 'night'} mode` : `切换到${isNight ? '日间' : '夜间'}模式`);
  }
  if (motionToggle) {
    const enabled = motionEnabled();
    motionToggle.setAttribute('aria-pressed', String(enabled));
    motionToggle.disabled = reducedMotion.matches;
    motionToggle.setAttribute('aria-label', reducedMotion.matches
      ? (english ? 'Reduced motion is enabled in system settings' : '系统已启用减少动态效果')
      : (english ? `${enabled ? 'Disable' : 'Enable'} page motion` : `${enabled ? '关闭' : '开启'}页面动效`));
  }
};

themeToggle?.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'night' ? 'day' : 'night';
  writePreference('jl-site-theme', root.dataset.theme);
  syncAppearanceControls();
});

syncAppearanceControls();
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) root.dataset.motion = 'off';
  syncAppearanceControls();
});

const escapeContentHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
})[character]);

const renderContentInlineMarkdown = value => escapeContentHtml(value)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/~~([^~]+)~~/g, '<del>$1</del>')
  .replace(/\*([^*]+)\*/g, '<em>$1</em>')
  .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');

const renderContentMarkdown = markdown => {
  const lines = String(markdown ?? '').replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      blocks.push(`<h${level}>${renderContentInlineMarkdown(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^\s*>/.test(line)) {
      const quoteLines = [];
      while (index < lines.length && /^\s*>/.test(lines[index])) {
        quoteLines.push(lines[index].replace(/^\s*>\s?/, ''));
        index += 1;
      }
      blocks.push(`<blockquote><p>${quoteLines.map(renderContentInlineMarkdown).join('<br>')}</p></blockquote>`);
      continue;
    }

    const listMatch = line.match(/^\s*(-|\*|\+|\d+\.)\s+(.+)$/);
    if (listMatch) {
      const ordered = /^\d+\./.test(listMatch[1]);
      const tag = ordered ? 'ol' : 'ul';
      const items = [];
      while (index < lines.length) {
        const itemMatch = lines[index].match(/^\s*(-|\*|\+|\d+\.)\s+(.+)$/);
        if (!itemMatch) break;
        items.push(`<li>${renderContentInlineMarkdown(itemMatch[2])}</li>`);
        index += 1;
      }
      blocks.push(`<${tag}>${items.join('')}</${tag}>`);
      continue;
    }

    const paragraph = [];
    while (index < lines.length && lines[index].trim()
      && !/^(#{1,6})\s+/.test(lines[index])
      && !/^\s*>/.test(lines[index])
      && !/^\s*(-|\*|\+|\d+\.)\s+/.test(lines[index])) {
      paragraph.push(lines[index]);
      index += 1;
    }
    blocks.push(`<p>${paragraph.map(renderContentInlineMarkdown).join('<br>')}</p>`);
  }

  return blocks.join('');
};

const applyPublishedSiteContent = () => {
  const content = window.PUBLIC_JOURNAL_DATA?.site_content;
  if (!content || typeof content !== 'object') return;

  const profile = content.profile && typeof content.profile === 'object' ? content.profile : {};
  const setText = (selector, value) => {
    const element = document.querySelector(selector);
    if (element && typeof value === 'string') element.textContent = value;
  };
  setText('.chinese-name-cn', profile.name_cn);
  setText('.chinese-name small', profile.name_en);
  setText('.hero-label span:last-child', profile.location);

  const headline = document.querySelector('.hero-main h1');
  if (headline && typeof profile.headline_main === 'string' && typeof profile.headline_accent === 'string') {
    headline.innerHTML = `${escapeContentHtml(profile.headline_main)}<br><em>${escapeContentHtml(profile.headline_accent)}</em>`;
  }
  const lede = document.querySelector('.hero-lede');
  if (lede && typeof profile.lede_markdown === 'string') {
    lede.replaceChildren(...profile.lede_markdown.split(/\r?\n/).flatMap((line, lineIndex) => {
      const nodes = [];
      if (lineIndex) nodes.push(document.createElement('br'));
      const text = document.createElement('span');
      text.innerHTML = renderContentInlineMarkdown(line);
      nodes.push(text);
      return nodes;
    }));
  }

  const roots = {
    resume: document.querySelector('#resume'),
    skills: document.querySelector('#skills'),
    projects: document.querySelector('#projects'),
    journal: document.querySelector('#journal'),
    about: document.querySelector('#about'),
  };
  const sections = Array.isArray(content.sections) ? content.sections : [];

  sections.forEach(sectionData => {
    if (!sectionData || !Object.hasOwn(roots, sectionData.id)) return;
    const section = roots[sectionData.id];
    if (!section) return;
    section.hidden = sectionData.visible === false;
    document.querySelectorAll(
      `.site-header a[href="#${sectionData.id}"], .hero-index a[href="#${sectionData.id}"]`,
    ).forEach(link => {
      link.hidden = sectionData.visible === false;
    });

    const eyebrow = section.querySelector('.section-label .eyebrow, .section-heading .eyebrow, .about-heading .eyebrow, :scope > .eyebrow');
    const title = section.querySelector('.featured-heading h2, .section-heading h2, #about-title');
    const aside = section.querySelector('.section-label .serial, .section-heading .section-aside');
    if (eyebrow && typeof sectionData.eyebrow === 'string') eyebrow.textContent = sectionData.eyebrow;
    if (title && typeof sectionData.title === 'string') title.textContent = sectionData.title;
    if (aside && typeof sectionData.aside === 'string') aside.textContent = sectionData.aside;

    section.querySelectorAll(':scope > .site-content-body').forEach(node => node.remove());
    if (sectionData.id === 'resume') {
      section.querySelector('.profile-path')?.remove();
      section.querySelector('.featured-copy')?.remove();
    } else if (sectionData.id === 'skills') {
      section.querySelector('.note-list')?.remove();
    } else if (sectionData.id === 'projects') {
      section.querySelector('.research-block')?.remove();
      section.querySelector('.engineering-heading')?.remove();
      section.querySelector('.engineering-grid')?.remove();
      section.querySelector('.content-note')?.remove();
    } else if (sectionData.id === 'about') {
      section.querySelector('.about-fallback')?.remove();
    }

    if (sectionData.id !== 'journal' && typeof sectionData.body_markdown === 'string') {
      const bodyContent = document.createElement('div');
      bodyContent.className = `site-content-body site-content-body-${sectionData.id}`;
      bodyContent.innerHTML = renderContentMarkdown(sectionData.body_markdown);
      const heading = section.querySelector('.featured-heading, .section-heading, :scope > .eyebrow');
      if (sectionData.id === 'about') {
        section.querySelector('.about-content')?.prepend(bodyContent);
      } else if (heading?.nextSibling) {
        section.insertBefore(bodyContent, heading.nextSibling);
      } else {
        section.append(bodyContent);
      }
    }

    if (sectionData.id === 'journal') {
      section.querySelectorAll(':scope > .site-content-lede').forEach(node => node.remove());
      if (sectionData.body_markdown) {
        const ledeContent = document.createElement('div');
        ledeContent.className = 'site-content-lede';
        ledeContent.innerHTML = renderContentMarkdown(sectionData.body_markdown);
        section.querySelector('.journal-reader')?.before(ledeContent);
      }
    }
  });

  const heroSection = document.querySelector('#home');
  const orderedIds = sections
    .filter(section => section && Object.hasOwn(roots, section.id))
    .sort((left, right) => left.order - right.order);
  if (heroSection && orderedIds.length) {
    let insertionPoint = heroSection.nextElementSibling;
    orderedIds.forEach(sectionData => {
      const section = roots[sectionData.id];
      if (!section) return;
      document.querySelector('#main').insertBefore(section, insertionPoint);
      insertionPoint = section.nextElementSibling;
    });
  }
};

applyPublishedSiteContent();

motionToggle?.addEventListener('click', () => {
  const enabled = !motionEnabled();
  root.dataset.motion = enabled ? 'full' : 'off';
  syncAppearanceControls();

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

const textWaveTargets = new Set();
const textWaveLayouts = new WeakMap();
const segmenter = typeof Intl.Segmenter === 'function'
  ? new Intl.Segmenter('zh-CN', { granularity: 'grapheme' })
  : null;

function prepareTextWave(target) {
  target.classList.remove('glyph-wave-active');
  target.querySelectorAll('.glyph-wave, .glyph-word').forEach(node => node.replaceWith(...node.childNodes));
  target.normalize();
  target.setAttribute('aria-label', target.textContent.trim());
  target.classList.add('glyph-wave-target');
  const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    const fragment = document.createDocumentFragment();
    // Keep English words together and preserve spaces and existing line breaks.
    node.textContent.split(/(\s+|[\u3400-\u9fff])/u).filter(Boolean).forEach(part => {
      if (/^\s+$/u.test(part)) { fragment.append(part); return; }
      const word = document.createElement('span');
      word.className = 'glyph-word';
      word.setAttribute('aria-hidden', 'true');
      // Move Latin words as a unit so handwritten joins and kerning survive.
      const graphemes = /[A-Za-z]/.test(part) ? [part]
        : segmenter ? [...segmenter.segment(part)].map(item => item.segment) : Array.from(part);
      graphemes.forEach(character => {
        const glyph = document.createElement('span');
        glyph.className = 'glyph-wave';
        glyph.textContent = character;
        word.append(glyph);
      });
      fragment.append(word);
    });
    node.replaceWith(fragment);
  });
  cacheTextWaveLayout(target);
}

function cacheTextWaveLayout(target) {
  const glyphs = [...target.querySelectorAll('.glyph-wave')];
  textWaveLayouts.set(target, glyphs.map(glyph => {
    const bounds = glyph.getBoundingClientRect();
    return { glyph, x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
  }));
}

function bindTextWave(target) {
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
      if (!pointer || !motionEnabled()) return;
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
}

function initializeTextWaves() {
  document.querySelectorAll('.featured-heading h2, .note-item h3, #journal-index-title').forEach(target => {
    if (target.closest('.project-card, .research-case')) return;
    prepareTextWave(target);
    if (!textWaveTargets.has(target)) {
      textWaveTargets.add(target);
      bindTextWave(target);
    }
  });
}

document.addEventListener('portfolio:languagechange', () => {
  initializeTextWaves();
  syncAppearanceControls();
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

  const latestArticleIndex = articles.length - 1;
  const archivedArticles = articles
    .map((article, articleIndex) => ({ article, articleIndex }))
    .filter(entry => entry.articleIndex !== latestArticleIndex)
    .reverse();

  const indexPage = `
    <article class="journal-page journal-page-index is-active" data-journal-page-panel="0" aria-labelledby="journal-index-title">
      <header class="journal-page-header">
        <span class="eyebrow">PAGE 01 / INDEX</span>
        <p>研究、工程与学习留下的真实过程。</p>
      </header>
      <div class="journal-index-intro">
        <span class="journal-index-kicker">FIELD NOTES / 过程记录</span>
        <h3 id="journal-index-title">把过程留下来，<br>让问题有迹可循。</h3>
      </div>
      ${articles.length
        ? `<div class="journal-index-layout" data-count="${articles.length}" data-layout="${articles.length >= 5 ? 'archive' : 'spread'}">
          <button type="button" class="journal-featured-note" data-journal-target="${latestArticleIndex + 1}" aria-label="阅读最新手记：${escapeHtml(articles[latestArticleIndex].title)}">
            <span class="journal-featured-note-heading"><span>最新记录</span><span>NOTE / ${String(latestArticleIndex + 1).padStart(3, '0')}</span></span>
            <span class="journal-featured-note-meta"><span>${escapeHtml(articles[latestArticleIndex].category || '手记')}</span><span>${escapeHtml(articles[latestArticleIndex].date || '')}</span></span>
            <strong>${escapeHtml(articles[latestArticleIndex].title)}</strong>
            ${articles[latestArticleIndex].summary ? `<span class="journal-featured-note-summary">${escapeHtml(articles[latestArticleIndex].summary)}</span>` : ''}
            <span class="journal-featured-note-action">阅读全文 <b aria-hidden="true">↗</b></span>
          </button>
          ${archivedArticles.length
            ? `<div class="journal-archive-list" data-count="${archivedArticles.length}" aria-label="较早的手记">${archivedArticles.map(({ article, articleIndex }) => `
              <button type="button" class="journal-archive-entry" data-journal-target="${articleIndex + 1}" aria-label="阅读手记：${escapeHtml(article.title)}">
                <span class="journal-archive-number">${String(articleIndex + 1).padStart(2, '0')}</span>
                <span class="journal-archive-copy">
                  <small><span>${escapeHtml(article.category || '手记')}</span><time>${escapeHtml(article.date || '')}</time></small>
                  <strong>${escapeHtml(article.title)}</strong>
                </span>
                <b aria-hidden="true">↗</b>
              </button>`).join('')}</div>`
            : ''}
        </div>
        `
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
      ? `${articles.length} 篇手记 · 最新记录与过往归档`
      : '手记内容持续整理中';
  }
}

const revealTargets = [...document.querySelectorAll(
  '.featured, .section-heading, .note-item, .research-intro, .research-case, .engineering-heading, .project-card, .journal-grid article, .about',
)];

initializeTextWaves();

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
