import { CredentialProvider } from '@deepseek-ai/dsh-credentials'

export const name = 'sai-credentials'
export const inject = ['saiAndroid']

class AndroidKeystoreCredentials extends CredentialProvider {
  constructor(ctx) {
    super(ctx)
    this.android = ctx.saiAndroid
  }

  async resolve(ref) {
    const result = await this.android.call('credential_resolve', { ref: String(ref) })
    if (!result) return undefined
    const decoded = JSON.parse(result)
    return decoded.configured === true
      ? { value: decoded.value, source: 'android-keystore' }
      : undefined
  }

  async describe(ref) {
    const result = await this.android.call('credential_describe', { ref: String(ref) })
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
    await this.android.call('credential_set', { ref: String(ref), value })
    this.ctx.emit('credentials/updated', ref)
  }

  async unset(ref) {
    await this.android.call('credential_unset', { ref: String(ref) })
    this.ctx.emit('credentials/updated', ref)
  }
}

export default AndroidKeystoreCredentials
