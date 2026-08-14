import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'sai-voice'
export const inject = ['tools', 'systemPrompt', 'saiAndroid']

const ACTIVE_VOICE_POLICY = `SAI VOICE CALL MODE IS ACTIVE.
The user cannot hear ordinary assistant text. Before completing EVERY response, you MUST call speak exactly once with the short spoken result the user needs now. Do not merely say that you would speak and do not omit the call after using other tools.
The speak text must be one or two concise plain-text sentences. Never include Markdown, code, diffs, logs, URLs, secrets, tool syntax, or emoji. Keep full technical detail in the visible response.
The microphone remains live while you work and while speech is playing. If a new user/steer message arrives, stop following the superseded direction and answer the newest request.`

export function apply(ctx, config = {}) {
  if (config.promptOnly === true) {
    ctx.systemPrompt.section({ name: 'sai:voice-active', order: 119, text: ACTIVE_VOICE_POLICY })
    return
  }

  ctx.systemPrompt.section({
    name: 'sai:voice-tool',
    order: 119,
    text: 'The speak tool is for sai voice-call sessions only. In ordinary text sessions, do not call it unless the user explicitly asks for text to be read aloud.',
  })
  // Voice mode is model-facing policy, never a visible user message. The
  // native service creates its sessions with the sai-voice preset, letting
  // this stable system-prompt layer activate only for those sessions.
  ctx.on('system-prompt/assemble', async (assembly, context, next) => {
    if (context.agent?.session?.header?.agentPreset === 'sai-voice') {
      assembly.sections.push({ name: 'sai:voice-active', text: ACTIVE_VOICE_POLICY })
    }
    return next()
  })
  ctx.tools.register(defineTool({
    name: 'speak',
    description: 'Read a short plain-text message aloud through sai. In the sai voice-call preset this tool is mandatory exactly once per completed response.',
    parameters: {
      text: { type: 'string', required: true, description: 'One or two concise sentences, 1..300 characters, without Markdown, code, URLs, secrets, or emoji.' },
    },
    output: { schema: { type: 'string' }, render: () => [] },
    execute: async ({ text }, runtime) => {
      const spoken = String(text ?? '').trim()
      if (!spoken || spoken.length > 300) throw new Error('speak text must contain 1..300 characters')
      return ctx.saiAndroid.call('speak', { text: spoken }, runtime?.signal)
    },
  }))
}
