export const name='sai-artifacts'
export const inject=['systemPrompt','saiAndroid']
export function apply(ctx){ctx.systemPrompt.section({name:'sai:artifacts',order:120,text:'When producing a file or URL for the user, put each absolute workspace path or complete URL on its own Markdown link. sai renders these as open, preview, save, and share artifacts.'})}
