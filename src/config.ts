import { ensureDir, readJson, writeJson, remove } from 'fs-extra'

import { getPathDir } from '@/utils'

export class Config implements Config {
  private readonly #path: string
  private #data: Map<string, unknown>

  constructor(path: string) {
    this.#path = path
    this.#data = new Map<string, unknown>()
  }

  public map(): Map<string, unknown> {
    return this.#data
  }

  public async load(): Promise<void> {
    try {
      const obj = (await readJson(this.#path)) as object
      this.#data = new Map<string, unknown>(Object.entries(obj))
    } catch (error) {
      const errorCode = (error as NodeJS.ErrnoException)?.code
      if (errorCode === 'ENOENT') {
        return
      }
      throw error
    }
  }

  public async unlink(): Promise<void> {
    await remove(this.#path)
  }

  private async write(config: Map<string, unknown>): Promise<void> {
    await ensureDir(getPathDir(this.#path))
    await writeJson(this.#path, Object.fromEntries(config.entries()))
    this.#data = config
  }

  get path(): string {
    return this.#path
  }

  get size(): number {
    return this.#data.size
  }

  /**
   * Get a key
   */
  get<T>(key: string, defaultValue?: T | undefined): T | void {
    if (this.#data.has(key)) {
      return this.#data.get(key) as T
    } else if (typeof defaultValue !== 'undefined') {
      return defaultValue
    }
  }

  /**
   * Set a key
   */
  async set(key: string, value: unknown) {
    const config = this.#data
    config.set(key, value)
    await this.write(config)
  }

  async sets(obj: Record<string, unknown> = {}) {
    const _config = new Map<string, unknown>()
    for (const prop in obj) {
      _config.set(prop, obj[prop])
    }
    await this.write(_config)
  }

  /**
   * Delete a key
   */
  async delete(key: string): Promise<void> {
    const config = this.#data
    config.delete(key)
    await this.write(config)
  }
}
