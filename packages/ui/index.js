import { effectiveSandboxMode } from '@deepseek-ai/dsh-sandbox-policy'

export const name = 'sai-ui-host'
export const inject = ['permissionPresets', 'sessions']

/**
 * Older sai previews could persist an approval/sandbox combination that DSH
 * correctly reports as `custom`. sai exposes exactly three product presets,
 * so normalize those legacy sessions without ever increasing file access:
 * read-only stays read-only; every other unmatched state becomes the
 * confining workspace-write preset. Full access remains explicit-only.
 */
export function apply(ctx) {
  const normalize = (session) => {
    if (ctx.permissionPresets.current(session.events) !== 'custom') return
    const sandbox = effectiveSandboxMode(session.events)
    ctx.permissionPresets.set(session, sandbox === 'read-only' ? 'read-only' : 'workspace-write')
  }

  ctx.effect(() => {
    for (const session of ctx.sessions.list()) normalize(session)
    return ctx.on('session/created', normalize)
  }, 'sai-ui: normalize legacy permission presets')
}
