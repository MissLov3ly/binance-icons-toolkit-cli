import { stdout } from 'node:process'

export async function helpCommand(config: Config): Future<void> {
  stdout.write(`...
1. Clone https://github.com/VadimMalykhin/binance-icons #main and #dev branches
2. Fetch Binance Exchange Wallet assets.
3. ...
...
  `)
  await Promise.resolve()
}
