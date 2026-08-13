import { readFile, rename, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createAssistantMessage, createUserMessage } from '@deepseek-ai/dsh-llm'
import { SessionId } from '@deepseek-ai/dsh-session'

export const name = 'sai-legacy-import'
export const inject = ['sessions']

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

export function apply(ctx) {
  ctx.effect(async () => {
    // Persistence restores existing DSH sessions during profile boot. Defer the
    // one-way import so it can safely skip identifiers already made durable.
    await sleep(750)
    const home = process.env.DSH_HOME
    if (!home) return
    const source = join(home, 'migrations', 'legacy-sessions.json')
    let document
    try {
      document = JSON.parse(await readFile(source, 'utf8'))
    } catch (error) {
      if (error?.code === 'ENOENT') return
      throw error
    }
    if (document?.schemaVersion !== 1 || !Array.isArray(document.sessions)) {
      throw new Error('sai legacy import: unsupported migration document')
    }
    const report = { schemaVersion: 1, imported: [], skipped: [], failed: [] }
    for (const item of document.sessions) {
      const rawId = String(item?.id ?? '').trim()
      if (!rawId) continue
      const id = SessionId(rawId)
      if (ctx.sessions.get(id)) {
        report.skipped.push(rawId)
        continue
      }
      try {
        const session = ctx.sessions.create(id, {
          meta: {
            cwd: String(item.cwd || '/home/phoneagent'),
            createdAt: Number.isFinite(item.createdAt) ? item.createdAt : Date.now(),
          },
        })
        let lastUserSeq
        let turn = 0
        for (const entry of Array.isArray(item.turns) ? item.turns : []) {
          const user = String(entry?.user ?? '').trim()
          if (!user) continue
          session.append('turn/start', { turn })
          lastUserSeq = session.append('user/message', createUserMessage({
            content: [{ type: 'text', text: user }],
            source: { kind: 'user' },
          }), { surfaceOp: 'append' }).seq
          const assistant = String(entry?.assistant ?? '')
          if (assistant.trim()) {
            const step = 0
            session.append('step/start', { turn, step })
            session.append('assistant/message', {
              turn,
              step,
              message: createAssistantMessage({
                content: [{ type: 'text', text: assistant }],
                source: {
                  provider: String(item.provider || 'legacy'),
                  model: String(item.model || 'legacy'),
                },
              }),
            }, { surfaceOp: 'append', sourceEventSeqs: [] })
            session.append('step/end', { turn, step })
          }
          session.append('turn/end', { turn, reason: { kind: 'completed' } })
          turn += 1
        }
        const title = String(item.title ?? '').trim()
        if (title) session.append('session/title', {
          title,
          messageSeqs: lastUserSeq === undefined ? [] : [lastUserSeq],
          source: lastUserSeq === undefined ? { kind: 'user' } : { kind: 'fallback' },
        })
        const persisted = await ctx.sessions.flush(session)
        if (!persisted) throw new Error('no DSH persistence listener accepted the session')
        report.imported.push(rawId)
      } catch (error) {
        report.failed.push({ id: rawId, message: String(error?.message ?? error) })
      }
    }
    const reportPath = join(home, 'migrations', 'legacy-import-report.json')
    await writeFile(reportPath, JSON.stringify(report, null, 2), { mode: 0o600 })
    // Rename only when every attempted session is either imported or already
    // present. A partial failure remains pending and is retried next boot.
    if (report.failed.length === 0) {
      await rename(source, `${source}.complete`).catch(async error => {
        if (error?.code !== 'EEXIST') throw error
      })
    }
  }, 'sai legacy session import')
}

export default apply
