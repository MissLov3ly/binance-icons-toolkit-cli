import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { echo } from 'zx'
import type { ChildProcess } from 'node:child_process'

const execAsync = promisify(exec)

export class Git {
  readonly #repository: string
  readonly #verbose: boolean
  #version?: string
  readonly #cmd: string
  #emitter: Emitter<Record<EventType, unknown>>

  constructor(repository: string, options?: Git.Options) {
    this.#repository = repository
    this.#verbose = options?.verbose ?? false
    this.#cmd = options?.cmd ?? 'git'
  }

  public async isInstalled(): Promise<boolean> {
    if (!this.#version) {
      try {
        const controller = new AbortController()
        const { signal } = controller
        const { stdout } = await execAsync([this.#cmd, '--version'].join(' '), { signal })
        this.#version = Git.parseVersion(stdout.trim())
        controller.abort()
      } catch (err) {
        if (this.#verbose) {
          echo('git: ', err)
        }
        return false
      }
    }
    return true
  }

  public async clone(directory: string, branch: string, options?: Git.CloneOptions): Promise<Git.CloneOutput> {
    if (!(await this.isInstalled())) {
      return { code: '1000' }
    }
    const depth = options?.depth ?? '0'

    if (depth < '0') {
      throw new Error('depth cannot be less than 0')
    }

    const args = ['clone']
    args.push('--branch', branch)
    if (depth > '0') args.push('--depth', depth)
    args.push(this.#repository, directory)

    const controller = new AbortController()
    try {
      const { signal } = controller
      await execAsync([this.#cmd, ...args].join(' '), { signal })
      controller.abort()
    } catch (err) {
      if (this.#verbose) {
        const code = (err as NodeJS.ErrnoException).code
        const stderr = (err as ChildProcess).stderr
        return { code, messages: Git.parseStd(stderr) }
      }
    }

    return { code: '1002' }
  }
  private static parseStd(raw: string): Git.ParseOutput[] {
    const out: Array<Git.ParseOutput> = []
    const eol = '\n'
    const messages = raw.split(eol)
    for (const message of messages) {
      const m = message.trim()
      if (m.length > 0) {
        let msg: Git.ParseOutput = {}
        if (m.startsWith('warning:') || m.startsWith('fatal:')) {
          const colonIndex = m.indexOf(':')
          msg = {
            level: m.substring(0, colonIndex),
            message: m
              .substring(colonIndex + 1)
              .replace(eol, '')
              .trim()
          }
        } else {
          msg = {
            level: 'info',
            message: m
          }
        }
        out.push(msg)
      }
    }
    return out
  }

  private static parseVersion(raw: string): string {
    return raw.replace(/^git version /, '')
  }
}
