import { defineTool } from '@deepseek-ai/dsh-tools'
export const name='sai-voice'
export const inject=['tools','systemPrompt','saiAndroid']
export function apply(ctx, config = {}){
  if (config.promptOnly === true) {
    ctx.systemPrompt.section({name:'sai:voice-active',order:119,text:'VOICE CALL MODE IS ACTIVE. You MUST call the speak tool exactly once in every completed response. The speak text is the only audio the user hears: make it a direct, useful summary of at most two short sentences. Continue useful detail in visible text. Never speak reasoning, code, diffs, logs, URLs, secrets, or emoji. If the user interrupts, immediately follow the changed direction.'})
    return
  }
  ctx.tools.register(defineTool({name:'speak',description:'Broadcast a short voice reply through sai. Call this exactly once when the sai voice-call preset says voice mode is active; normal assistant text is not spoken.',parameters:{text:{type:'string',required:true,description:'At most two concise plain-text sentences without emoji.'}},output:{schema:{type:'string'},render:()=>[]},execute:({text},runtime)=>ctx.saiAndroid.call('speak',{text},runtime?.signal)}))
}
