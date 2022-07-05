import { stdout, exit } from 'node:process'
import prompts from 'prompts'
import { helpCommand, cloneCommand, fetchCommand, todoCommand, buildCommand, releaseCommand } from '@/commands'

export async function startCommand(config: Config): Future<void> {
  try {
    const response = await prompts([
      {
        type: 'select',
        name: 'value',
        message: 'Select a Command',
        choices: [
          { title: 'Help', description: 'Show help', value: 'help' },
          { title: 'Clone', description: 'Clone icons repository', value: 'clone' },
          { title: 'Fetch', description: 'Fetch all assets directly from the Binance Exchange', value: 'fetch' },
          { title: 'Todo', description: 'To Do icons', value: 'todo' },
          { title: 'Build', description: 'Build icons', value: 'build' },
          { title: 'Release', description: 'Create release', value: 'release' }
          // { title: 'Green', value: '#00ff00', disabled: true },
        ],
        initial: 0
      }
    ])

    switch (response.value) {
      case 'help': {
        await helpCommand(config)
        break
      }
      case 'clone': {
        await cloneCommand(config)
        break
      }
      case 'fetch': {
        await fetchCommand(config)
        break
      }
      case 'todo': {
        await todoCommand(config)
        break
      }
      case 'build': {
        await buildCommand(config)
        break
      }
      case 'release': {
        await releaseCommand(config)
        break
      }
      default: {
        exit(1)
        break
      }
    }
    stdout.write('\r')
    await startCommand(config)
  } catch (err) {
    stdout.write(`${(err as Error).message}\n`)
    exit(1)
  }
}
