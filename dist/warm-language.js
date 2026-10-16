(() => {
  const languageButton = document.querySelector('.language-toggle');
  if (!languageButton) return;

  const originalHtml = new Map();
  const originalAttributes = new Map();
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
  const one = (selector, root = document) => root.querySelector(selector);
  const all = (selector, root = document) => [...root.querySelectorAll(selector)];
  const rememberHtml = element => {
    if (element && !originalHtml.has(element)) originalHtml.set(element, element.innerHTML);
  };
  const setHtml = (element, value) => {
    if (!element) return;
    rememberHtml(element);
    element.innerHTML = value;
  };
  const setText = (element, value) => setHtml(element, escapeHtml(value));
  const setAttribute = (element, name, value) => {
    if (!element) return;
    if (!originalAttributes.has(element)) originalAttributes.set(element, new Map());
    const attributes = originalAttributes.get(element);
    if (!attributes.has(name)) attributes.set(name, element.getAttribute(name));
    element.setAttribute(name, value);
  };

  const articles = [
    {
      title: 'Why connect materials, devices, and systems?',
      category: 'Study note',
      date: '2026.09',
      summary: 'While working on materials-transport calculations, I began to see that equations and curves are not the destination. The interesting question is how electron behavior in a material shapes a device, and eventually a working system.',
      body: '<p>SPR-KKR calculations let me study materials through their bands, scattering, and finite-temperature transport. Semiconductor physics and microelectronic-device courses offer another scale for understanding carriers, junctions, and device structures.</p><p>Embedded projects and a Raspberry Pi server push that perspective outward. They ask me to work with communication, interfaces, software, and deployment, and show how theoretical knowledge meets engineering constraints.</p><blockquote><p>What matters to me now is not how many tools I can use, but whether I can understand the full path from physical mechanism to engineering implementation.</p></blockquote><p>This path is still taking shape. These notes keep the reasoning, setbacks, and changes in judgment, not only the final results.</p>',
    },
    {
      title: 'From draft to publication',
      category: 'Website log',
      date: '2026.09',
      summary: 'A short note to check the workflow from Markdown editing and draft preview to public release.',
      body: '<p>This short note is a check of the content-update workflow for my personal website.</p><p>I write in Markdown, save the article as a draft in the NAS workspace, and review the layout. Once it looks right, I can publish that selected article to the public site.</p><p>It is also a small engineering exercise: connecting content editing, version control, and deployment in one clear workflow.</p>',
    },
    {
      title: 'A release, broken into verifiable steps',
      category: 'Engineering note',
      date: '2026.09',
      summary: 'The content workflow for the personal site, from a Markdown draft and preview to public release.',
      body: '<h2>From editing to release</h2><p>I want to write notes without editing webpage code directly. In the NAS workspace, I can write in Markdown, preview the result, and save it as a draft. After reviewing the content, I can publish it to the public site as a separate action.</p><h2>Why keep the two steps separate</h2><p>Saving a draft and publishing it are different decisions. Previewing first gives me a chance to check the text and layout before anything goes live, and prevents unreviewed content from being published.</p><h2>What this check covers</h2><p>This note is also a small workflow test: a new article should move from the editor into drafts, then be published to GitHub only when I choose, and appear in the journal on the public site.</p><p>I will keep recording issues from real use and improve the content workflow alongside the site itself.</p>',
    },
  ];

  const applyEnglish = () => {
    const root = document.documentElement;
    root.lang = 'en';
    root.dataset.language = 'en';
    setText(one('.skip'), 'Skip to content');
    setAttribute(one('.monogram'), 'aria-label', 'Return to the home page');
    setAttribute(one('nav[aria-label]'), 'aria-label', 'Primary navigation');
    ['Profile', 'Projects', 'Journal', 'About'].forEach((label, index) => setText(all('.site-header nav a')[index], label));

    setText(one('.chinese-name-cn'), 'Jiale Li');
    setText(one('.chinese-name small'), 'PERSONAL JOURNAL');
    setHtml(one('.hero-lede'), 'From materials transport and device physics,<br>toward real-world electronic systems.');
    setAttribute(one('.hero-instrument'), 'aria-label', 'Current areas of study');
    setAttribute(one('.hero-index'), 'aria-label', 'Page contents');
    [
      'Materials transport and device physics',
      'Embedded and electronic systems',
      'Engineering notes and personal reflections',
    ].forEach((label, index) => setText(all('.hero-index a strong')[index], label));

    setText(one('#resume .featured-heading h2'), 'From electron transport in materials to devices and systems on a chip.');
    setAttribute(one('#resume .profile-path'), 'aria-label', 'Current learning and research path');
    setHtml(one('#resume .site-content-body-resume'), '<h3>Current learning and research path</h3><ul><li><strong>Materials transport:</strong> SPR-KKR · finite-temperature calculations</li><li><strong>Device physics:</strong> semiconductor physics · microelectronic devices</li><li><strong>Integrated-circuit engineering:</strong> devices · circuits · system implementation</li></ul><p>With integrated-circuit engineering as my intended graduate direction, I am building a connected understanding, from theoretical calculations to engineering practice, through research on antiferromagnetic materials, device-physics study, and embedded-systems projects.</p>');

    setText(one('#skills .section-heading h2'), 'Capabilities');
    setText(one('#skills .section-aside'), 'Skills mapped to hands-on work');
    setHtml(one('#skills .site-content-body-skills'), '<ul><li><strong>Materials and transport:</strong> SPR-KKR 8.6 / KKRCHI · SCF / SIGMA · CPA · finite-temperature phonons and spin disorder. <code>FeRh · Cr · CrSb</code></li><li><strong>Data analysis and communication:</strong> Python · pandas · NumPy · Matplotlib · Origin · VESTA, from calculated results to trend analysis and clear figures. <code>Research data workflow</code></li><li><strong>Embedded systems and communications:</strong> C/C++ · STM32 · ESP32-S3 / ESP-IDF · Wi-Fi CSI · LoRa · I²C / SPI / UART. <code>Flight control · CSI</code></li><li><strong>Modeling and system implementation:</strong> MATLAB / Simulink · Linux · Git · FastAPI · React · SQLite · Nginx. <code>Simulation · NAS</code></li></ul>');

    setText(one('#projects .section-heading h2'), 'Research and engineering');
    setText(one('#projects .section-aside'), 'A focused research thread, supported by engineering practice');
    setHtml(one('#projects .site-content-body-projects'), '<h3>Finite-temperature transport in antiferromagnets</h3><p>A connected line of work across materials calculations, thermal disorder, and spin Hall response. This page includes verified work; methods and results that are not yet confirmed are left open.</p><ul><li><strong>FeRh</strong> — Completed SCF / SIGMA calculations and investigated anomalies; reset antiparallel moments and analyzed charge and transport tensors. <code>Calculation and debugging</code></li><li><strong>Cr</strong> — Built finite-temperature inputs from published magnetic data and analyzed a non-monotonic spin Hall response near the Néel-temperature range. <code>Data processing and comparison</code></li><li><strong>CrSb</strong> — Materials calculations and data analysis are ongoing. Methods, contributions, and interim findings will be added after they are verified against the project record. <code>In progress · details to follow</code></li></ul><h3>Engineering practice · from modeling to deployment</h3><ul><li><strong>STM32 wireless communication and UAV flight control</strong> — Completed MATLAB / Simulink modeling and simulation for wireless communication on an STM32 board; participating in a flight-control lab under instructor guidance. Currently in the learning and testing phase. <code>Simulink · STM32 · LoRa</code></li><li><strong>Wi-Fi CSI indoor state sensing</strong> — Built a CSI capture, UDP return, recording / playback, and offline-audit workflow. A 10-minute capture contained 57,644 frames; the current pilot finding remains inconclusive. <code>ESP32-S3 · third place, Central China regional IC competition</code></li><li><strong>Raspberry Pi 4B personal NAS</strong> — Built system monitoring, authentication, file management, and a Project Hub with FastAPI, React, SQLite, and Nginx. The result is a working personal-server workspace. <code>Linux · web · end-to-end deployment</code></li></ul><p>Research and experiment status is labeled honestly; unverified results are not presented as completed achievements.</p>');

    setText(one('#journal .section-heading h2'), 'Journal');
    setText(one('#journal .section-aside'), 'Choose a title card to read');
    setText(one('#journal > .site-content-lede'), 'Notes from research, engineering, and learning as they happen.');
    setAttribute(one('.journal-reader'), 'aria-label', 'Journal reader');
    setAttribute(one('.journal-pager'), 'aria-label', 'Journal pages');
    const pages = all('.journal-page');
    const indexPage = pages[0];
    setText(one('.journal-page-header p', indexPage), 'A record of research, engineering, and learning as it happens.');
    setText(one('.journal-index-kicker', indexPage), 'FIELD NOTES / IN PROGRESS');
    setHtml(one('#journal-index-title', indexPage), 'Keep the process visible,<br>make each question traceable.');

    const featured = one('.journal-featured-note', indexPage);
    if (featured) {
      setText(one('.journal-featured-note-heading span:first-child', featured), 'LATEST NOTE');
      setText(one('.journal-featured-note-meta span:first-child', featured), articles[2].category);
      setText(one('strong', featured), articles[2].title);
      setText(one('.journal-featured-note-summary', featured), articles[2].summary);
      setText(one('.journal-featured-note-action', featured), 'Read the note ↗');
      setAttribute(featured, 'aria-label', 'Read the latest note: ' + articles[2].title);
    }
    all('.journal-archive-entry', indexPage).forEach((entry, index) => {
      const article = articles[1 - index];
      if (!article) return;
      setText(one('small span', entry), article.category);
      setText(one('strong', entry), article.title);
      setAttribute(entry, 'aria-label', 'Read note: ' + article.title);
    });
    setText(one('.journal-empty', indexPage), 'Notes are being prepared and will appear here soon.');

    pages.slice(1).forEach((page, index) => {
      const article = articles[index];
      if (!article) return;
      setText(one('.journal-page-header p', page), article.date + ' · ' + article.category);
      setText(one('.journal-article-layout h3', page), article.title);
      setText(one('.journal-article-lede', page), article.summary);
      setHtml(one('.journal-article-body', page), article.body);
      setText(one('.journal-turn-back span', page), 'Back to the journal');
      setAttribute(page, 'aria-label', 'Journal note: ' + article.title);
    });
    all('.journal-page-dot').forEach((dot, index) => {
      setAttribute(dot, 'aria-label', index === 0 ? 'Show journal index' : 'Show note: ' + (articles[index - 1]?.title || ''));
    });
    setText(one('#journal-status'), articles.length
      ? articles.length + ' notes · latest entry and archive'
      : 'The journal is being updated.');

    setText(one('#about .about-heading h2'), 'Education and awards');
    setHtml(one('#about .site-content-body-about'), '<p>Hubei Normal University · Integrated Circuit Design (Electronic Information) · Undergraduate student.</p><p>Current graduate-study direction: University of Electronic Science and Technology of China, School of Integrated Circuit Science and Engineering (031). I am primarily considering the professional master’s program in Integrated Circuit Engineering (085403), Microelectronic Devices and Integrated Circuits (01). Entrance subjects are planned as Politics, English I, Mathematics I, and Microelectronic Devices; the admissions catalog for the application year will be authoritative.</p><p>Third place in the Central China regional IC competition (Wi-Fi CSI project); provincial second prize in the Lanqiao Cup microcontroller category; university second-class scholarship; CET-4.</p>');
    setAttribute(one('#about .about-mark'), 'aria-label', 'Visit Jiale Li on GitHub');
    setAttribute(one('footer .monogram'), 'aria-label', 'Back to top');
    setText(one('.site-footer > span:nth-child(2)'), 'Personal site · projects and notes updated over time');
    setText(one('.site-footer > span:nth-child(3)'), 'One step at a time.');

    setText(languageButton, '中');
    setAttribute(languageButton, 'aria-label', '切换到中文');
    setAttribute(languageButton, 'title', '中文');
    setAttribute(languageButton, 'aria-pressed', 'true');
    document.title = 'Jiale Li — Personal Site';
    setAttribute(one('meta[name="description"]'), 'content', 'Jiale Li’s personal site: profile, engineering projects, and notes.');
    document.dispatchEvent(new Event('portfolio:languagechange'));
  };

  const applyChinese = () => {
    for (const [element, markup] of originalHtml) element.innerHTML = markup;
    for (const [element, attributes] of originalAttributes) {
      for (const [name, value] of attributes) {
        if (value === null) element.removeAttribute(name);
        else element.setAttribute(name, value);
      }
    }
    document.documentElement.lang = 'zh-CN';
    delete document.documentElement.dataset.language;
    document.title = 'Jiale Li — 个人网站';
    document.dispatchEvent(new Event('portfolio:languagechange'));
  };

  languageButton.addEventListener('click', () => {
    if (document.documentElement.dataset.language === 'en') applyChinese();
    else applyEnglish();
  });
  const previewParams = new URLSearchParams(window.location.search);
  if (previewParams.get('lang') === 'en') applyEnglish();
  const requestedNote = Number(previewParams.get('note'));
  if (Number.isInteger(requestedNote) && requestedNote > 0) {
    one('.journal-page-dot[data-journal-target="' + requestedNote + '"]')?.click();
  }
})();
