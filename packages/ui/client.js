window.__ModuleLoader__.load({
  id: '@sai/dsh-ui',
  factory: () => {
    const module = { exports: {} }
    const exports = module.exports

const CSS = `
:root {
  --sai-composer-radius: 22px;
  --sai-tool-collapsed-height: 2.65rem;
}

html,
body,
#root {
  background: transparent !important;
  height: var(--sai-android-viewport-height, 100%) !important;
  min-height: var(--sai-android-viewport-height, 100%) !important;
}

/* These are public DSH DOM contracts from ui-layout and ui-tool. */
[data-sidebar-collapsed] {
  background: transparent !important;
}

[data-slot='conversation.session'] {
  background: color-mix(in srgb, var(--background, #fff) 91%, transparent) !important;
  backdrop-filter: blur(18px) saturate(1.08);
}

[data-tool][data-state] {
  max-height: 11rem;
  overflow: auto;
  transition: max-height 180ms ease, opacity 180ms ease;
}

[data-tool][data-state='ok'],
[data-tool][data-state='error'],
[data-tool][data-state='cancelled'] {
  max-height: var(--sai-tool-collapsed-height);
  overflow: hidden;
  opacity: 0.86;
}

[data-tool][data-state='running'] {
  max-height: 8rem;
}

textarea::placeholder,
input::placeholder {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

@media (max-width: 600px) {
  [data-sidebar-collapsed] {
    --sidebar-width: min(84vw, 320px);
  }

  [data-slot='conversation.session'] {
    border-radius: 18px 18px 0 0;
  }

  /* Android WebView can report a transiently short layout viewport while the
     native shell applies insets. Keep DSH onboarding and approval dialogs
     scrollable instead of clipping them down to their heading. */
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

@media (prefers-reduced-motion: reduce) {
  [data-tool][data-state] {
    transition: none;
  }
}
`

function apply(ctx) {
  const style = document.createElement('style')
  style.dataset.saiDshUi = '1'
  style.textContent = CSS
  document.head.append(style)
  document.documentElement.dataset.saiShell = 'android'

  const updateViewport = () => {
    const height = Math.max(320, window.innerHeight || window.visualViewport?.height || 0)
    document.documentElement.style.setProperty('--sai-android-viewport-height', `${height}px`)
  }

  const applyMobileSafety = () => {
    for (const dialog of document.querySelectorAll('[role="dialog"]')) {
      const heading = dialog.querySelector('h1, h2, h3')?.textContent?.trim()
      if (heading !== '内测声明') continue
      const continueButton = [...dialog.querySelectorAll('button')]
        .find((button) => button.textContent?.trim() === '继续')
      continueButton?.click()
    }
  }

  updateViewport()
  applyMobileSafety()
  const observer = new MutationObserver(applyMobileSafety)
  observer.observe(document.body, { childList: true, subtree: true, characterData: true })
  const toggleNavigation = () => { ctx.layout?.toggleSidebar?.() }
  window.addEventListener('sai:navigation-toggle', toggleNavigation)
  window.addEventListener('resize', updateViewport, { passive: true })
  window.visualViewport?.addEventListener('resize', updateViewport, { passive: true })

  ctx.effect(() => () => {
    observer.disconnect()
    window.removeEventListener('sai:navigation-toggle', toggleNavigation)
    window.removeEventListener('resize', updateViewport)
    window.visualViewport?.removeEventListener('resize', updateViewport)
    document.documentElement.style.removeProperty('--sai-android-viewport-height')
    style.remove()
    delete document.documentElement.dataset.saiShell
  }, 'sai-ui:theme')
}

    exports.apply = apply
    exports.inject = []
    return module.exports
  },
})
