(() => {
  if (window.__SAI_UI_PLUGIN__) return
  window.__SAI_UI_PLUGIN__ = true

  const style = document.createElement('style')
  style.dataset.saiDshUi = 'standalone'
  style.textContent = `
    html, body, #root {
      background: transparent !important;
      height: var(--sai-android-viewport-height, 100%) !important;
      min-height: var(--sai-android-viewport-height, 100%) !important;
    }
    .sai-dsh-wordmark { display: inline-flex; align-items: center; gap: 9px; color: currentColor; }
    .sai-dsh-wordmark svg { width: 25px; height: 25px; fill: currentColor; }
    .sai-dsh-wordmark strong { font: 700 24px/1 system-ui, sans-serif; letter-spacing: -.03em; }
    button[data-sai-brand='true'] { position: relative; }
    button[data-sai-brand='true'] > svg { opacity: 0 !important; }
    button[data-sai-brand='true']::before, button[data-sai-rail-brand='true']::before { content: ''; width: 25px; height: 25px; background: currentColor; -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M11.2 3.1v13.2L4.6 14.8 11.2 3.1Zm1.5 2.1v11.2l6.5-1.5-6.5-9.7ZM3.2 17.1c3.7.75 7.15.82 10.35.2 2.5-.48 4.85-.43 7.25.16-2.02 2.3-4.83 3.44-8.4 3.44-4.1 0-7.17-1.27-9.2-3.8Z'/%3E%3C/svg%3E") center / contain no-repeat; }
    button[data-sai-brand='true']::before { position: absolute; left: 0; top: 50%; transform: translateY(-50%); }
    button[data-sai-brand='true']::after { content: 'sai'; position: absolute; left: 35px; top: 50%; transform: translateY(-52%); font: 700 24px/1 system-ui, sans-serif; }
    button[data-sai-rail-brand='true'] > svg:first-of-type { opacity: 0 !important; }
    button[data-sai-rail-brand='true']::before { position: absolute; }
    button[aria-label='打开侧边栏'],
    button[aria-label='关闭侧边栏'] {
      visibility: hidden !important;
      pointer-events: none !important;
    }
    @media (max-width: 600px) {
      [role='dialog'] {
        width: calc(100vw - 24px) !important;
        height: fit-content !important;
        min-height: 0 !important;
        max-height: min(78dvh, 640px) !important;
        overflow-x: hidden !important;
        overflow-y: auto !important;
        border-radius: 18px !important;
      }
      [role='dialog'] > div {
        height: fit-content !important;
        min-height: 0 !important;
        max-height: min(72dvh, 580px) !important;
        overflow-x: hidden !important;
        overflow-y: auto !important;
      }
    }
  `
  document.head.appendChild(style)

  const updateViewport = () => {
    const height = Math.max(320, window.innerHeight || window.visualViewport?.height || 0)
    document.documentElement.style.setProperty('--sai-android-viewport-height', `${height}px`)
  }

  const applySaiBranding = () => {
    const wordmark = document.querySelector('button svg[viewBox="0 0 182 24"]')
    if (wordmark) {
      const brandButton = wordmark.closest('button')
      const logoRow = brandButton?.parentElement
      if (brandButton) brandButton.dataset.saiBrand = 'true'
      if (logoRow) logoRow.dataset.saiBrandRow = 'true'
    }
    for (const row of document.querySelectorAll('[data-sai-brand-row="true"]')) {
      const toggle = [...row.querySelectorAll('button')].find((button) => button.dataset.saiBrand !== 'true')
      const icons = toggle?.querySelectorAll('svg') ?? []
      if (icons.length > 1 && !toggle.dataset.saiRailBrand) {
        toggle.dataset.saiRailBrand = 'true'
      }
    }
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    let node
    while ((node = walker.nextNode())) {
      if (node.nodeValue?.trim() === '探索未至之境') node.nodeValue = '从 sai 开始'
    }
    for (const dialog of document.querySelectorAll('[role="dialog"]')) {
      if (dialog.querySelector('h1, h2, h3')?.textContent?.trim() !== '内测声明') continue
      ;[...dialog.querySelectorAll('button')]
        .find((button) => button.textContent?.trim() === '继续')
        ?.click()
    }
  }

  updateViewport()
  applySaiBranding()
  new MutationObserver(applySaiBranding)
    .observe(document.body, { childList: true, subtree: true, characterData: true })
  window.addEventListener('resize', updateViewport, { passive: true })
  window.visualViewport?.addEventListener('resize', updateViewport, { passive: true })
})()
