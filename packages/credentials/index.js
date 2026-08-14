import { CredentialProvider } from '@deepseek-ai/dsh-credentials'

export const name = 'sai-credentials'

async function callBridge(operation, payload) {
  const endpoint = process.env.SAI_BRIDGE_URL
  const token = process.env.SAI_BRIDGE_TOKEN
  if (!endpoint || !token) throw new Error('sai credential bridge is unavailable')
  const response = await fetch(`${endpoint.replace(/\/$/, '')}/v1/tools/call`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ operation, payload }),
  })
  const text = await response.text()
  if (!response.ok) throw new Error(`sai credential bridge ${response.status}: ${text.slice(0, 300)}`)
  return text
}

class AndroidKeystoreCredentials extends CredentialProvider {
  constructor(ctx) {
    super(ctx)
  }

  async resolve(ref) {
    const result = await callBridge('credential_resolve', { ref: String(ref) })
    if (!result) return undefined
    const decoded = JSON.parse(result)
    return decoded.configured === true
      ? { value: decoded.value, source: 'android-keystore' }
      : undefined
  }

  async describe(ref) {
    const result = await callBridge('credential_describe', { ref: String(ref) })
    const decoded = JSON.parse(result)
    return {
      configured: decoded.configured === true,
      ...(decoded.configured === true ? { source: 'android-keystore' } : {}),
      writable: true,
    }
  }

  async set(ref, value) {
    if (typeof value !== 'string' || value.length === 0) {
      throw new Error('sai credentials: an empty value cannot be stored; use unset')
    }
    await callBridge('credential_set', { ref: String(ref), value })
    this.ctx.emit('credentials/updated', ref)
  }

  async unset(ref) {
    await callBridge('credential_unset', { ref: String(ref) })
    this.ctx.emit('credentials/updated', ref)
  }
}

export default AndroidKeystoreCredentials
