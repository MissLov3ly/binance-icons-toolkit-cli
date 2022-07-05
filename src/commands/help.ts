import { echo } from 'zx'
import { white, bgYellow, bold } from 'kolorist'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function helpCommand(config: Config): Future<void> {
  echo`...
1. Clone https://github.com/VadimMalykhin/binance-icons #main and #dev branches
2. Fetch Binance Exchange Wallet assets.
3. ...
...
  `
  await Promise.resolve()
}
