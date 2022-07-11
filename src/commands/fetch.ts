import { stdout, stderr, exit } from 'node:process'

import { ensureDir, writeJson, WriteOptions } from 'fs-extra'
import { spinner } from 'zx/experimental'
import { red, green, cyan } from 'kolorist'
import prompts from 'prompts'
import { Binance } from '@/binance'

import { appDir, Icons, extractAssetsCrypto, extractAssetsCryptoEtf, extractAssetsCurrency, extractAssetsNames } from '@/utils'

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
      await ensureDir(`${appDir}/generated/${dir}`)
    }

    stdout.write(cyan(`${Icons.identical} Extracted Assets \n`))

    // Json formatter.
    const opts: WriteOptions = { spaces: 2, EOL: '\n' }

    // Write all assets.
    await writeJson(`${appDir}/generated/all.json`, data, opts)

    // Extract the crypto assets.
    const crypto = extractAssetsCrypto(data)
    await writeJson(`${appDir}/generated/crypto.json`, crypto, opts)
    stdout.write(`${green(Icons.mark)} Crypto: ${cyan(crypto.length)}\n`)

    // Extract the crypto ETF assets.
    const cryptoEtf = extractAssetsCryptoEtf(data)
    await writeJson(`${appDir}/generated/etf.json`, cryptoEtf, opts)
    stdout.write(`${green(Icons.mark)} Crypto ETF: ${cyan(cryptoEtf.length)}\n`)

    // Extract the currency assets.
    const currency = extractAssetsCurrency(data)
    await writeJson(`${appDir}/generated/currency.json`, currency, opts)
    stdout.write(`${green(Icons.mark)} Currency: ${cyan(currency.length)}\n`)

    // Extract the assets names.
    const names = extractAssetsNames(data)
    await writeJson(`${appDir}/generated/cryptoNames.json`, names, opts)
  } catch (err) {
    stderr.write(`${(err as Error).message}\n`)
    exit(1)
  }
}
