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

  const applyMobileSafety = () => {
    for (const dialog of document.querySelectorAll('[role="dialog"]')) {
      if (dialog.querySelector('h1, h2, h3')?.textContent?.trim() !== '内测声明') continue
      ;[...dialog.querySelectorAll('button')]
        .find((button) => button.textContent?.trim() === '继续')
        ?.click()
    }
  }

  updateViewport()
  applyMobileSafety()
  new MutationObserver(applyMobileSafety)
    .observe(document.body, { childList: true, subtree: true, characterData: true })
  window.addEventListener('resize', updateViewport, { passive: true })
  window.visualViewport?.addEventListener('resize', updateViewport, { passive: true })
})()
