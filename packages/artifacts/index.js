import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'sai-artifacts'
export const inject = ['tools', 'systemPrompt', 'saiAndroid']

export function apply(ctx) {
  ctx.systemPrompt.section({
    name: 'sai:artifacts',
    order: 120,
    text: 'When producing a file or URL for the user, put each absolute workspace path or complete URL on its own Markdown link. The user opens, imports, exports, and shares project files from the native sai file manager. Use open_url only when the user explicitly asks to preview or open a complete URL.',
  })
  ctx.tools.register(defineTool({
    name: 'open_url',
    description: 'Open a complete http(s) URL for the user, either in the isolated sai preview or in the phone default browser.',
    parameters: {
      url: { type: 'string', required: true },
      destination: { type: 'string', required: true, enum: ['internal', 'external'] },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value }] },
    execute: ({ url, destination }, runtime) => ctx.saiAndroid.call('open_url', { url, destination }, runtime?.signal),
  }))
}
