import { stdout } from 'node:process'
import { join } from 'node:path'
import { red } from 'kolorist'
import { Config } from '@/config'
import { appDir, banner, Icons } from '@/utils'
import { setupCommand, startCommand } from '@/commands'

/**
 * Cli
 */
export class Cli {
  constructor() {
    stdout.write(banner)
  }

  /**
   * Run Cli
   */
  async run() {
    const config = new Config(join(appDir, 'bit.json'))

    // load config file
    try {
      await config.load()
    } catch (e) {
      stdout.write(`${red(Icons.cross)} Failed to read config file.\n`)
      await config.unlink()
    }

    // is not configured
    if (!config.get<boolean>('setup', false)) {
      await setupCommand(config)
      return
    }

    if (config.get<boolean>('unsafe', false)) {
      stdout.write(`${red('\n! USE THE API KEY WITH READ-ONLY PERMISSIONS!\n')}`)
    }

    await startCommand(config)
  }
}
