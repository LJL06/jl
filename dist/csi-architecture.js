(() => {
  const dialog = document.getElementById('csi-architecture-dialog');
  const frame = dialog?.querySelector('.nas-architecture-dialog__frame');
  const closeButton = dialog?.querySelector('[data-csi-architecture-close]');
  const expandButton = dialog?.querySelector('[data-csi-architecture-expand]');
  if (!dialog || !frame || !closeButton || !expandButton || typeof dialog.showModal !== 'function') return;

  let returnScrollY = 0;
  let previousLockTop = '';
  let returnFocus = null;

  const ensureProjectTrigger = () => {
    const existing = [...document.querySelectorAll('[data-csi-architecture-open]')]
      .find(link => link.isConnected);
    if (existing) return existing;

    const projectBody = document.querySelector('.site-content-body-projects');
    if (!projectBody) return null;
    const csiItem = [...projectBody.querySelectorAll('li')].find(item =>
      /wi[\s-]*fi\s+csi|csi.{0,24}(?:室内|sensing|status)/i.test(item.textContent || ''),
    );
    if (!csiItem) return null;

    const action = document.createElement('div');
    action.className = 'nas-architecture-action';
    const link = document.createElement('a');
    link.className = 'nas-architecture-trigger';
    link.href = frame.dataset.src;
    link.dataset.csiArchitectureOpen = '';
    link.setAttribute('aria-haspopup', 'dialog');
    link.setAttribute('aria-controls', 'csi-architecture-dialog');
    link.setAttribute('aria-expanded', 'false');
    const label = document.createElement('span');
    label.dataset.csiTriggerLabel = '';
    const arrow = document.createElement('span');
    arrow.className = 'nas-architecture-trigger__arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '↗';
    link.append(label, arrow);
    action.append(link);
    csiItem.append(action);
    return link;
  };

  const applyLanguage = () => {
    const english = document.documentElement.dataset.language === 'en';
    ensureProjectTrigger();
    document.querySelectorAll('[data-csi-trigger-label]').forEach(label => {
      label.textContent = english ? 'View interactive architecture' : '查看交互式架构图';
    });
    const title = dialog.querySelector('[data-csi-dialog-title]');
    const hint = dialog.querySelector('[data-csi-dialog-hint]');
    const footer = dialog.querySelector('[data-csi-dialog-footer]');
    const closeHint = dialog.querySelector('[data-csi-dialog-close-hint]');
    const fullscreenLabel = expandButton.querySelector('[data-csi-fullscreen-label]');
    const fullscreenActive = document.fullscreenElement === dialog || dialog.classList.contains('is-fullscreen-fallback');

    if (title) title.textContent = english ? 'Wi-Fi CSI indoor sensing architecture' : 'Wi-Fi CSI 室内状态感知架构';
    if (hint) hint.textContent = english
      ? 'Three ESP32 CSI nodes are shown as external hardware; their firmware is not in this public repository.'
      : '图中包含 3 个 ESP32 CSI 节点；固件源码未包含在公开仓库中。';
    if (footer) footer.textContent = '3 × ESP32 · Python / FastAPI · Node.js';
    if (closeHint) closeHint.textContent = english ? 'Press Esc or click × to return to the project page' : '按 Esc 或点击 × 返回项目页';
    if (fullscreenLabel) fullscreenLabel.textContent = english ? (fullscreenActive ? 'Exit fullscreen' : 'Fullscreen') : (fullscreenActive ? '退出全屏' : '全屏');
    expandButton.setAttribute('aria-label', english ? (fullscreenActive ? 'Exit full screen' : 'View full screen') : (fullscreenActive ? '退出全屏查看' : '全屏查看架构图'));
    expandButton.setAttribute('aria-pressed', String(fullscreenActive));
    expandButton.title = english ? (fullscreenActive ? 'Exit full screen' : 'Fullscreen') : (fullscreenActive ? '退出全屏' : '全屏查看');
    closeButton.setAttribute('aria-label', english ? 'Close architecture diagram' : '关闭架构图');
    closeButton.title = english ? 'Close' : '关闭';
    frame.title = english ? 'Interactive Wi-Fi CSI indoor sensing architecture' : 'Wi-Fi CSI 室内状态感知交互式架构图';
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
    const trigger = target?.closest('[data-csi-architecture-open]');
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
    if (event.target === dialog) closeDialog();
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
