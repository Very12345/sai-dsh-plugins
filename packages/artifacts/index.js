import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'sai-artifacts'
export const inject = ['tools', 'systemPrompt', 'saiAndroid']

export function apply(ctx) {
  ctx.systemPrompt.section({
    name: 'sai:artifacts',
    order: 120,
    text: 'When producing a file or URL for the user, put each absolute workspace path or complete URL on its own Markdown link. Use export_artifact to open, save, or share a generated file. Use open_url to preview a URL inside sai or explicitly hand it to the default browser.',
  })
  ctx.tools.register(defineTool({
    name: 'export_artifact',
    description: 'Export one existing workspace file to the phone Downloads/sai folder or open the Android share sheet. The file must already exist; this tool never creates project content.',
    parameters: {
      path: { type: 'string', required: true, description: 'Absolute path of an existing regular file in the current sai workspace or Debian home.' },
      action: { type: 'string', required: true, enum: ['open', 'save', 'share'], description: 'open previews inside sai; save copies to Downloads/sai; share opens the Android share sheet.' },
      display_name: { type: 'string', description: 'Optional exported filename. Path separators are rejected.' },
      mime_type: { type: 'string', description: 'Optional MIME type such as application/pdf.' },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value }] },
    execute: ({ path, action, display_name, mime_type }, runtime) => ctx.saiAndroid.call('export', {
      path,
      action,
      displayName: display_name,
      mimeType: mime_type,
    }, runtime?.signal),
  }))
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
