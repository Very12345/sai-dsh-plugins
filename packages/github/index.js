export const name='sai-github'
export const inject=['saiAndroid']
export function apply(ctx){ctx.provide('saiGithub',Object.freeze({run:(args,signal)=>ctx.saiAndroid.call('github',{args},signal)}))}
