export const name='sai-models'
export const inject=['llm']
export function apply(ctx){ctx.provide('saiModelPolicy',Object.freeze({currency:'CNY',capabilityPriority:['user','provider','official-rule'],textOnlyVisionFallback:true,sessionModelBinding:true}))}
