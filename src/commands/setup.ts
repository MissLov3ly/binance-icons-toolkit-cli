import { echo, sleep } from 'zx'
import { spinner } from 'zx/experimental'
import { dim, red, green, yellow } from 'kolorist'
import prompts from 'prompts'
import { Binance } from '@/binance'
import { Icons, isUnsafeRestrictions } from '@/utils'

type SetupCredentialsAnswers = {
  readonly key: string
  readonly secret: string
}

type SetupSaveAnswer = {
  readonly save: string
}

export async function setupCommand(config: Config): Future<void> {
  try {
    echo(
      yellow('Please enter the API key & secret with read-only access permissions\n') + dim('This is necessary to get all wallet assets, even delisted ones\n')
    )

    const credentialsAnswers: SetupCredentialsAnswers = await prompts<SetupCredentialsAnswers>(
      [
        {
          type: 'password',
          name: 'key',
          mask: '*',
          message: 'Enter the Binance API Key',
          validate: (input: string) => (input.match(/^[A-Z\d]{64}$/i) ? true : 'Please enter a valid API Key')
        },
        {
          type: 'password',
          name: 'secret',
          mask: '*',
          message: 'Enter the Binance API Secret',
          validate: (input: string) => (input.match(/^[A-Z\d]{64}$/i) ? true : 'Please enter a valid API Secret')
        }
      ],
      {
        onCancel() {
          throw new Error(`${red(Icons.cross)} Operation cancelled`)
        }
      }
    )

    const api = new Binance(credentialsAnswers.key, credentialsAnswers.secret)

    let restrictions: Binance.Restrictions
    await spinner('Checking Restrictions', async () => {
      restrictions = await api.fetchRestrictions()

      echo`${yellow('?')} Restrictions Checklist`
      echo`Reading:                    ${restrictions.enableReading ? green(Icons.mark) : red(Icons.cross)}`
      echo`Spot and Margin Trading:    ${restrictions.enableSpotAndMarginTrading ? red(Icons.cross) : green(Icons.mark)}`
      echo`Margin:                     ${restrictions.enableMargin ? red(Icons.cross) : green(Icons.mark)}`
      echo`Futures:                    ${restrictions.enableFutures ? red(Icons.cross) : green(Icons.mark)}`
      echo`Vanilla Options:            ${restrictions.enableVanillaOptions ? red(Icons.cross) : green(Icons.mark)}`
      echo`Internal Transfer:          ${restrictions.enableInternalTransfer ? red(Icons.cross) : green(Icons.mark)}`
      echo`Permits Universal Transfer: ${restrictions.permitsUniversalTransfer ? red(Icons.cross) : green(Icons.mark)}`
      echo`Withdrawals:                ${restrictions.enableWithdrawals ? red(Icons.cross) : green(Icons.mark)}`
    })

    const saveAnswer: SetupSaveAnswer = await prompts<SetupSaveAnswer>(
      {
        name: 'save',
        type: () => 'toggle',
        message: 'Save your credentials to the configuration file?',
        initial: false,
        active: 'Yes',
        inactive: 'No'
      },
      {
        onCancel() {
          throw new Error(`${red(Icons.cross)} Operation cancelled`)
        }
      }
    )

    if (saveAnswer.save) {
      await config.sets({
        key: credentialsAnswers.key,
        secret: credentialsAnswers.secret,
        setup: true,
        unsafe: isUnsafeRestrictions(restrictions)
      })
      echo(green(`\n${Icons.mark} The configuration file was successfully saved`))
    } else {
      echo`\r`
      await setupCommand(config)
    }
  } catch (err) {
    echo((err as Error).message)
    process.exit(1)
  }
}
