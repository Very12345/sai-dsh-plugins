import { LocalBashExecutor } from '@deepseek-ai/dsh-bash-local'

/**
 * Android cannot run DSH's native Linux/Windows sandbox providers. sai already
 * runs Node inside its app-private Debian/PRoot runtime with an explicit
 * workspace bind, so this adapter exposes that deployment boundary to DSH's
 * permission projection without importing the native sandbox package.
 *
 * Read-only sessions reject every shell invocation. Workspace-write and full
 * access retain DSH approval events and execute inside the private PRoot. PRoot
 * is a compatibility boundary, not a kernel security sandbox; the Android UI
 * communicates that distinction and remains the final approval authority.
 */
export class SaiProotShellExecutor extends LocalBashExecutor {
  static inject = ['subprocess', 'sandboxPolicy']

  constructor(ctx, config) {
    super(ctx, config)
    this.saiSandboxPolicy = ctx.sandboxPolicy
  }

  get sandboxMode() {
    return this.saiSandboxPolicy.defaultMode
  }

  resolve(request) {
    return super.resolve({
      ...request,
      sandboxPolicy: request.sandboxPolicy ?? this.saiSandboxPolicy.resolve(),
    })
  }

  async run(spec) {
    const mode = spec.sandboxPolicy?.mode ?? this.sandboxMode
    if (mode === 'read-only') {
      throw new Error('SAI_READ_ONLY_SHELL_BLOCKED: Read Only mode does not execute shell commands on Android')
    }
    const result = await super.run(spec)
    return { ...result, sandbox: { mode, denied: false, enforcement: 'partial' } }
  }

  start(spec) {
    const mode = spec.sandboxPolicy?.mode ?? this.sandboxMode
    if (mode === 'read-only') {
      throw new Error('SAI_READ_ONLY_SHELL_BLOCKED: Read Only mode does not start shell processes on Android')
    }
    const process = super.start(spec)
    void process.done.then(() => {
      process.sandbox = { mode, denied: false, enforcement: 'partial' }
    })
    return process
  }
}

export default SaiProotShellExecutor
