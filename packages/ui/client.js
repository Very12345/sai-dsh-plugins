export const name = 'sai-ui'

const CSS = `
:root {
  --sai-composer-radius: 22px;
  --sai-tool-collapsed-height: 2.65rem;
}

html,
body,
#root {
  background: transparent !important;
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
}

@media (prefers-reduced-motion: reduce) {
  [data-tool][data-state] {
    transition: none;
  }
}
`

export function apply(ctx) {
  const style = document.createElement('style')
  style.dataset.saiDshUi = '1'
  style.textContent = CSS
  document.head.append(style)
  document.documentElement.dataset.saiShell = 'android'

  ctx.effect(() => () => {
    style.remove()
    delete document.documentElement.dataset.saiShell
  }, 'sai-ui:theme')
}
