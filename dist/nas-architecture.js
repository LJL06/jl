(() => {
  const dialog = document.getElementById('nas-architecture-dialog');
  const frame = dialog?.querySelector('.nas-architecture-dialog__frame');
  const closeButton = dialog?.querySelector('[data-nas-architecture-close]');
  const expandButton = dialog?.querySelector('[data-nas-architecture-expand]');
  if (!dialog || !frame || !closeButton || !expandButton || typeof dialog.showModal !== 'function') return;

  let returnScrollY = 0;
  let previousLockTop = '';
  let returnFocus = null;

  const ensureProjectTrigger = () => {
    const existing = [...document.querySelectorAll('[data-nas-architecture-open]')]
      .find(link => link.isConnected);
    if (existing) return existing;

    const projectBody = document.querySelector('.site-content-body-projects');
    if (!projectBody) return null;

    const nasItem = [...projectBody.querySelectorAll('li')].find(item =>
      /raspberry\s*pi\s*4b|树莓派.*nas/i.test(item.textContent || ''),
    );
    if (!nasItem) return null;

    const action = document.createElement('div');
    action.className = 'nas-architecture-action';
    const link = document.createElement('a');
    link.className = 'nas-architecture-trigger';
    link.href = frame.dataset.src;
    link.dataset.nasArchitectureOpen = '';
    link.setAttribute('aria-haspopup', 'dialog');
    link.setAttribute('aria-controls', 'nas-architecture-dialog');
    link.setAttribute('aria-expanded', 'false');
    const label = document.createElement('span');
    label.dataset.nasTriggerLabel = '';
    const arrow = document.createElement('span');
    arrow.className = 'nas-architecture-trigger__arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '↗';
    link.append(label, arrow);
    action.append(link);
    nasItem.append(action);
    return link;
  };

  const applyLanguage = () => {
    const english = document.documentElement.dataset.language === 'en';
    ensureProjectTrigger();
    document.querySelectorAll('[data-nas-trigger-label]').forEach(triggerLabel => {
      triggerLabel.textContent = english ? 'Explore interactive architecture' : '查看交互式架构图';
    });
    const title = dialog.querySelector('[data-nas-dialog-title]');
    const hint = dialog.querySelector('[data-nas-dialog-hint]');
    const footer = dialog.querySelector('[data-nas-dialog-footer]');
    const closeHint = dialog.querySelector('[data-nas-dialog-close-hint]');
    const expandLabel = expandButton.querySelector('[data-nas-fullscreen-label]');
    const fullscreenActive = document.fullscreenElement === dialog || dialog.classList.contains('is-fullscreen-fallback');

    if (title) title.textContent = english ? 'Raspberry Pi NAS architecture' : '树莓派 NAS 系统架构';
    if (hint) hint.textContent = english
      ? 'Choose “Signal Flow” in the viewer to see relationships animate.'
      : '在图内切换至“信号流”，查看组件之间的动态关系。';
    if (footer) footer.textContent = 'FastAPI · React · SQLite · Nginx';
    if (closeHint) closeHint.textContent = english ? 'Press Esc or click × to return to the project page' : '按 Esc 或点击 × 返回项目页';
    if (expandLabel) expandLabel.textContent = english ? (fullscreenActive ? 'Exit fullscreen' : 'Fullscreen') : (fullscreenActive ? '退出全屏' : '全屏');
    expandButton.setAttribute('aria-label', english ? (fullscreenActive ? 'Exit full screen' : 'View full screen') : (fullscreenActive ? '退出全屏查看' : '全屏查看架构图'));
    expandButton.setAttribute('aria-pressed', String(fullscreenActive));
    expandButton.title = english ? (fullscreenActive ? 'Exit full screen' : 'View full screen') : (fullscreenActive ? '退出全屏' : '全屏查看');
    closeButton.setAttribute('aria-label', english ? 'Close architecture diagram' : '关闭架构图');
    closeButton.title = english ? 'Close' : '关闭';
    frame.title = english ? 'Interactive Raspberry Pi NAS system architecture' : '树莓派 NAS 交互式系统架构图';
  };

  const openDialog = (trigger, event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (dialog.open) return;

    returnFocus = trigger;
    returnScrollY = window.scrollY;
    previousLockTop = document.body.style.getPropertyValue('--nas-scroll-lock-top');
    document.body.style.setProperty('--nas-scroll-lock-top', `-${returnScrollY}px`);
    document.body.classList.add('nas-page-locked');

    const theme = document.documentElement.dataset.theme === 'night' ? 'dark' : 'light';
    const frameUrl = new URL(frame.dataset.src, document.baseURI);
    frameUrl.searchParams.set('present', '1');
    frameUrl.searchParams.set('theme', theme);
    frame.src = frameUrl.href;
    dialog.showModal();
    trigger.setAttribute('aria-expanded', 'true');
    closeButton.focus({ preventScroll: true });
  };

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    const trigger = target?.closest('[data-nas-architecture-open]');
    if (trigger) openDialog(trigger, event);
  });
  expandButton.addEventListener('click', async () => {
    if (document.fullscreenElement === dialog) {
      await document.exitFullscreen();
    } else if (dialog.classList.contains('is-fullscreen-fallback')) {
      dialog.classList.remove('is-fullscreen-fallback');
    } else if (typeof dialog.requestFullscreen === 'function') {
      try {
        await dialog.requestFullscreen();
      } catch {
        dialog.classList.add('is-fullscreen-fallback');
      }
    } else {
      dialog.classList.add('is-fullscreen-fallback');
    }
    applyLanguage();
  });
  document.addEventListener('fullscreenchange', applyLanguage);
  const closeDialog = () => {
    if (document.fullscreenElement === dialog) {
      document.exitFullscreen().then(() => dialog.close()).catch(() => dialog.close());
    } else {
      dialog.classList.remove('is-fullscreen-fallback');
      dialog.close();
    }
  };
  closeButton.addEventListener('click', closeDialog);
  dialog.addEventListener('cancel', event => {
    if (document.fullscreenElement !== dialog) return;
    event.preventDefault();
    document.exitFullscreen().finally(() => dialog.close());
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    frame.src = 'about:blank';
    document.body.classList.remove('nas-page-locked');
    if (previousLockTop) document.body.style.setProperty('--nas-scroll-lock-top', previousLockTop);
    else document.body.style.removeProperty('--nas-scroll-lock-top');

    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, returnScrollY);
    root.style.scrollBehavior = previousScrollBehavior;

    returnFocus?.setAttribute('aria-expanded', 'false');
    const focusTarget = returnFocus?.isConnected ? returnFocus : ensureProjectTrigger();
    focusTarget?.focus({ preventScroll: true });
    returnFocus = null;
  });

  document.addEventListener('portfolio:languagechange', applyLanguage);
  applyLanguage();
})();
