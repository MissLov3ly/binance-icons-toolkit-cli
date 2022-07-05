import { echo, fs } from 'zx'
import { spinner } from 'zx/experimental'
import { dim, red, green, yellow, cyan } from 'kolorist'
import prompts from 'prompts'
import { Binance } from '@/binance'
import { appDir, Icons, extractAssetsCrypto, extractAssetsCryptoEtf, extractAssetsCurrency, extractAssetsNames } from '@/utils'
import type { WriteOptions } from 'fs-extra'

export async function fetchCommand(config: Config): Future<void> {
  const key = config.get('key') as string
  const secret = config.get('secret') as string

  if (!key || !secret) {
    throw new Error('API key or secret is not set. Select the `setup` command.')
  }

  // Binance API instance.
  const api = new Binance(key, secret)

  try {
    // Fetch all available assets.
    let data: Array<Binance.Asset>

    await spinner('Fetching Assets', async () => {
      data = await api.fetchAll()
    })

    // Create folders for icons.
    for (const dir of ['crypto', 'etf', 'currency']) {
      await fs.ensureDir(`${appDir}/generated/${dir}`)
    }

    echo(cyan(`${Icons.identical} Extracted Assets `))

    // Json formatter.
    const opts: WriteOptions = { spaces: 2, EOL: '\n' }

    // Write all assets.
    await fs.writeJson(`${appDir}/generated/all.json`, data, opts)

    // Extract the crypto assets.
    const crypto = extractAssetsCrypto(data)
    await fs.writeJson(`${appDir}/generated/crypto.json`, crypto, opts)
    echo`${green(Icons.mark)} Crypto: ${cyan(crypto.length)}`

    // Extract the crypto ETF assets.
    const cryptoEtf = extractAssetsCryptoEtf(data)
    await fs.writeJson(`${appDir}/generated/etf.json`, cryptoEtf, opts)
    echo`${green(Icons.mark)} Crypto ETF: ${cyan(cryptoEtf.length)}`

    // Extract the currency assets.
    const currency = extractAssetsCurrency(data)
    await fs.writeJson(`${appDir}/generated/currency.json`, currency, opts)
    echo`${green(Icons.mark)} Currency: ${cyan(currency.length)}`

    // Extract the assets names.
    const names = extractAssetsNames(data)
    await fs.writeJson(`${appDir}/generated/cryptoNames.json`, names, opts)
  } catch (err) {
    echo((err as Error).message)
    process.exit(1)
  }
}
