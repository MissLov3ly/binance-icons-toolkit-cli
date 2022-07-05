import { argv, echo, fs, sleep } from 'zx'
import { spinner } from 'zx/experimental'
import { dim, red, green, yellow, cyan } from 'kolorist'
import prompts from 'prompts'
import { Binance } from '@/binance'
import { Git } from '@/git'
import { startCommand } from '@/commands'
import { branchDir, exists, Icons } from '@/utils'

declare type CloneArgs = {
  verbose?: boolean
}

export async function cloneCommand(config: Config): Future<void> {
  const args = argv as CloneArgs

  const git = new Git('https://github.com/VadimMalykhin/binance-icons.git', { verbose: args.verbose })

  if (!(await git.isInstalled())) {
    echo(red(`${Icons.cross} git is not installed.`))
    return
  }

  const _clone = async (branchDirectory: string, branch: string, overwrite = false): Promise<void> => {
    echo`${green(Icons.mark)} Selected branch: ${cyan(branch)}`

    if ((await exists(branchDirectory)) && !overwrite) {
      const answer = await prompts([
        {
          type: 'confirm',
          name: 'value',
          message: `Remove the previously cloned ${cyan(branch)} repository directory?`
        },
        {
          onCancel() {
            throw new Error(`${red(Icons.cross)} Operation cancelled`)
          }
        }
      ])
      if (!answer.value) {
        return
      }
      await fs.rm(branchDirectory, { force: true, recursive: true })
      echo(`${green(Icons.mark)} The ${red(branch)} directory was successfully removed.`)
    }

    if (overwrite && (await exists(branchDirectory))) {
      await fs.rm(branchDirectory, { force: true, recursive: true })
      echo(`${green(Icons.mark)} The ${red(branch)} directory was successfully removed.`)
    }

    await spinner(`Cloning '${branch}'... `, async () => {
      const result = await git.clone(branchDirectory, branch, { depth: '1' })
      if (result) {
        // echo`${result.code}`
      }

      echo(`${green(Icons.mark)} The ${cyan(branch)} branch was successfully cloned.`)
    })
  }

  try {
    const response = await prompts([
      {
        type: 'select',
        name: 'value',
        message: 'Select a Command',
        choices: [
          { title: 'All', description: 'Clone all below', value: 'all' },
          { title: 'Main', description: "Clone 'main' branch", value: 'main' },
          { title: 'Dev', description: "Clone 'dev' branch", value: 'dev' }
        ],
        initial: 0
      }
    ])

    switch (response.value) {
      case 'all': {
        await _clone(branchDir('main'), 'main', true)
        await _clone(branchDir('dev'), 'dev', true)
        break
      }
      case 'main': {
        await _clone(branchDir('main'), 'main', true)
        break
      }
      case 'dev': {
        await _clone(branchDir('dev'), 'dev', true)
        break
      }
      default: {
        process.exit(1)
        break
      }
    }
    echo`\r`
    await startCommand(config)
  } catch (err) {
    echo((err as Error).message)
    process.exit(1)
  }
}
