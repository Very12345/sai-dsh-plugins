export const name = 'sai-pet'
export const inject = ['saiAndroid', 'sessions']

export function apply(ctx) {
  const lastPublish = new Map()
  const publish = (session, state, force = false) => {
    const now = Date.now()
    if (!force && now - (lastPublish.get(session.id) ?? 0) < 250) return
    lastPublish.set(session.id, now)
    void ctx.saiAndroid.call('task_status', { sessionId: session.id, ...state }).catch(() => {})
  }
  ctx.on('session/event', (session, event) => {
    switch (event.type) {
      case 'turn/start':
        publish(session, { phase: 'working', turn: event.data.turn }, true)
        break
      case 'approval/asked':
        publish(session, { phase: 'waiting-approval', detail: event.data.reason ?? event.data.toolName }, true)
        break
      case 'approval/decided':
        publish(session, { phase: 'working' }, true)
        break
      case 'assistant/chunk': {
        const chunk = event.data?.chunk
        const detail = typeof chunk?.delta === 'string' ? chunk.delta : undefined
        if (detail) publish(session, { phase: 'working', detail })
        break
      }
      case 'turn/end':
        publish(session, { phase: 'idle', detail: event.data.reason?.kind ?? 'completed' }, true)
        break
    }
  })
}
