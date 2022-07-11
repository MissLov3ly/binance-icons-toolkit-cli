/**
 * Utility functions
 */

import { stdout, stderr, exit } from 'node:process'
import { homedir, platform } from 'node:os'
import { join, resolve, parse } from 'node:path'
import { promises as fs } from 'node:fs'

import { yellow, bold } from 'kolorist'
import { optimize, OptimizedSvg, XastElement } from 'svgo'
import { ensureDir, readJson } from 'fs-extra'
import writeFileAtomic from 'write-file-atomic'

export const isWindows = platform() === 'win32'

/**
 * Application Directory
 */
export const appDir: string = join(homedir(), '.binance-icons-toolkit')

export const generatedDir: string = join(homedir(), '.binance-icons-toolkit', 'generated')

export const releaseDir: string = join(homedir(), '.binance-icons-toolkit', 'release')

export const branchDir = (branch: string): string => join(homedir(), '.binance-icons-toolkit', 'git', branch)

/**
 * Icons
 */
export class Icons {
  static readonly spacer = ' '
  static readonly mark = '\u221a'
  static readonly mark2 = '\u2713'
  static readonly cross = '\u00d7'
  static readonly identical = '\u2261'
  static readonly bullet = '\u25cf'
  static readonly triangleRight = '\u25b6'
  static readonly awesome = '\u2728'
  static readonly questionWhite = '\u2754'
  static readonly questionRed = '\u2753'
}

export const banner = bold(yellow('\u25c6 Binance Icons Toolkit \u25c6\n\n'))

/**
 * Get directory only
 */
export const getPathDir = (dirname: string): string => parse(dirname).dir

/**
 * Sleep
 */
export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

/**
 * Check if it is a folder
 */
export const exists = async (...args: string[]): Promise<boolean> => {
  try {
    await fs.access(resolve(...args))
    return true
  } catch {
    return false
  }
}

/**
 * Is File
 */
export const isFile = async (file: string) => {
  try {
    const stats = await fs.stat(file)
    return stats.isFile()
  } catch {
    return false
  }
}

/**
 * Join Query String
 */
export const joinQueryString = (q: Record<string | number, string | number>): string => {
  if (q) {
    return '?'.concat(
      Object.keys(q)
        .map(v => `${encodeURIComponent(v)}=${encodeURIComponent(q[v])}`)
        .join('&')
    )
  }
  return ''
}

export const eq = (value, other): boolean => {
  return value === other || (value !== value && other !== other)
}

/**
 * Sort by a coin
 */
const sortByCoin = <T extends { coin: string }>(array: T[]) => {
  return array.sort((a: T, b: T) => {
    if (a.coin < b.coin) return -1
    if (a.coin > b.coin) return 1
    return 0
  })
}

export const isUnsafeRestrictions = (p: Binance.Restrictions): boolean => {
  return (
    p.enableSpotAndMarginTrading ||
    p.enableMargin ||
    p.enableFutures ||
    p.enableVanillaOptions ||
    p.enableInternalTransfer ||
    p.permitsUniversalTransfer ||
    p.enableWithdrawals
  )
}

/**
 * Sort by a symbol
 */
const sortBySymbol = <T extends { symbol: string }>(array: T[]) => {
  return array.sort((a: T, b: T) => {
    if (a.symbol < b.symbol) return -1
    if (a.symbol > b.symbol) return 1
    return 0
  })
}

export function uniqueSymbols(arr: Repository.Asset[]): Repository.Asset[] {
  return arr.filter((value, index, array) => index === array.findIndex(t => t.symbol === value.symbol))
}

/**
 * Whether is the FTX leverage token
 */
const isFtxEtf = (name: string) => (name.length > 13 ? (name.startsWith('3X Long') || name.startsWith('3X Short')) && name.endsWith('Token') : false)

/**
 * Extract Assets for Crypto
 */
export const extractAssetsCrypto = (data: Array<Binance.Asset>): Array<Binance.Asset> => {
  const filtered: Binance.Asset[] = data
    .map((item: Binance.Asset): Binance.Asset => {
      return { ...item, coin: item.coin.toLowerCase() }
    })
    .filter((value: Binance.Asset) => {
      const { name, isLegalMoney, networkList } = value
      const isETF = (networkList[0] && networkList[0].network && networkList[0].network === 'ETF') || isFtxEtf(name)
      return !isLegalMoney && !isETF
    })
  return sortByCoin<Binance.Asset>(filtered)
}

/**
 * Extract Assets for Crypto ETF
 */
export const extractAssetsCryptoEtf = (data: Array<Binance.Asset>): Array<Binance.Asset> => {
  const filtered: Binance.Asset[] = data
    .map((item: Binance.Asset): Binance.Asset => {
      return { ...item, coin: item.coin.toLowerCase() }
    })
    .filter((value: Binance.Asset) => {
      const { name, isLegalMoney, networkList } = value
      const isETF = (networkList[0] && networkList[0].network && networkList[0].network === 'ETF') || isFtxEtf(name)
      return !isLegalMoney && isETF
    })
  return sortByCoin<Binance.Asset>(filtered)
}

/**
 * Extract Assets for Currency
 */
export const extractAssetsCurrency = (data: Array<Binance.Asset>): Array<Binance.Asset> => {
  const filtered: Binance.Asset[] = data
    .map((item: Binance.Asset): Binance.Asset => {
      return { ...item, coin: item.coin.toLowerCase() }
    })
    .filter((value: Binance.Asset) => {
      const { isLegalMoney } = value
      return isLegalMoney
    })
  return sortByCoin<Binance.Asset>(filtered)
}

/**
 * Extract Assets Names
 */
export const extractAssetsNames = (data: Generated.Asset[] = []): Generated.AssetName => {
  let result: Generated.AssetName[] = []
  for (let i = 0, j = data.length; i < j; i++) {
    const { coin, name, isLegalMoney } = data[i]
    if (!isLegalMoney) {
      result.push({ coin: coin.toLowerCase(), name })
    }
  }
  result = sortByCoin<Generated.AssetName>(result)

  const obj = {}
  for (let i = 0, j = result.length; i < j; i++) {
    const { coin, name } = result[i]
    obj[coin] = name
  }
  return obj
}

/**
 * Generate Manifest
 */
export const generateManifest = async (): Promise<Repository.Manifest> => {
  // crypto = crypto.map(item => item.symbol).filter((value, index, array) => array.indexOf(value) === index)
  const names = (await readJson(resolve(generatedDir, 'cryptoNames.json'))) as Map<string, string>

  const manifest = (await readJson(resolve(branchDir('main'), 'manifest.json'))) as Repository.Manifest

  // crypto
  const cryptoAssets = async (crypto: Repository.Asset[]): Promise<Repository.Asset[]> => {
    const assets = (await readJson(`${appDir}/generated/crypto.json`)) as Generated.Asset[]
    for await (const asset of assets) {
      if (await exists(`${appDir}/generated/crypto/${asset.coin}.svg`)) {
        if (asset.name === '' && names.has(asset.coin)) {
          asset.name = names.get(asset.coin)
        }
        crypto.push({ symbol: asset.coin, name: asset.name })
      }
    }
    return sortBySymbol<Repository.Asset>(uniqueSymbols(crypto))
  }

  // etf
  const etfAssets = async (etf: Repository.Asset[]): Promise<Repository.Asset[]> => {
    const assets = (await readJson(`${appDir}/generated/etf.json`)) as Generated.Asset[]
    for await (const asset of assets) {
      if (await exists(`${appDir}/generated/etf/${asset.coin}.svg`)) {
        if (asset.name === '' && names.has(asset.coin)) {
          asset.name = names.get(asset.coin)
        }
        etf.push({ symbol: asset.coin, name: asset.name })
      }
    }
    return sortBySymbol<Repository.Asset>(uniqueSymbols(etf))
  }

  // currency
  const currencyAssets = async (currency: Repository.Asset[]): Promise<Repository.Asset[]> => {
    const assets = (await readJson(`${appDir}/generated/currency.json`)) as Generated.Asset[]
    for await (const asset of assets) {
      if (await exists(`${appDir}/generated/currency/${asset.coin}.svg`)) {
        if (asset.name === '' && names.has(asset.coin)) {
          asset.name = names.get(asset.coin)
        }
        currency.push({ symbol: asset.coin, name: asset.name })
      }
    }
    return sortBySymbol<Repository.Asset>(uniqueSymbols(currency))
  }

  return {
    crypto: await cryptoAssets(manifest.crypto),
    etf: await etfAssets(manifest.etf),
    currency: await currencyAssets(manifest.currency)
  }
}

/**
 * Generate Markdown
 */
export const generateMarkdown = async (): Promise<Generated.Markdown> => {
  // crypto
  const crypto = (
    manifest: Repository.Manifest
  ): {
    cryptoCount: number
    cryptoTable: string
  } => {
    const count = manifest.crypto.length
    const symbolLengthMax = Math.max(...manifest.crypto.map(el => el.symbol.length))
    const nameLengthMax = Math.max(...manifest.crypto.map(el => el.name.length))
    let table = '',
      i = 0
    for (const asset of manifest.crypto) {
      i++
      const n = symbolLengthMax - asset.symbol.length
      const n2 = nameLengthMax - asset.name.length
      const repeat = ' '.repeat(n + 1)
      const repeat2 = ' '.repeat(n2 + 1)
      const nl = count === i ? '' : '\n'
      table += `| <img src="https://raw.githubusercontent.com/VadimMalykhin/binance-icons/main/crypto/${asset.symbol}.svg" width="32" height="32" alt=""/>${repeat}| ${asset.symbol}${repeat}| ${asset.name}${repeat2}|${nl}`
    }
    return {
      cryptoCount: count,
      cryptoTable: table
    }
  }

  // etf
  const etf = (
    manifest: Repository.Manifest
  ): {
    etfCount: number
    etfTable: string
  } => {
    const count = manifest.etf.length
    const symbolLengthMax = Math.max(...manifest.etf.map(el => el.symbol.length))
    const nameLengthMax = Math.max(...manifest.etf.map(el => el.name.length))
    let table = '',
      i = 0
    for (const asset of manifest.etf) {
      i++
      const n = symbolLengthMax - asset.symbol.length
      const n2 = nameLengthMax - asset.name.length
      const repeat = ' '.repeat(n + 1)
      const repeat2 = ' '.repeat(n2 + 1)
      const nl = count === i ? '' : '\n'
      table += `| <img src="https://raw.githubusercontent.com/VadimMalykhin/binance-icons/main/crypto/${asset.symbol}.svg" width="32" height="32" alt=""/>${repeat}| ${asset.symbol}${repeat}| ${asset.name}${repeat2}|${nl}`
    }
    return {
      etfCount: count,
      etfTable: table
    }
  }

  // currency
  const currency = (
    manifest: Repository.Manifest
  ): {
    currencyCount: number
    currencyTable: string
  } => {
    const count = manifest.currency.length
    const symbolLengthMax = Math.max(...manifest.currency.map(el => el.symbol.length))
    const nameLengthMax = Math.max(...manifest.currency.map(el => el.name.length))
    let table = '',
      i = 0
    for (const asset of manifest.currency) {
      i++
      const n = symbolLengthMax - asset.symbol.length
      const n2 = nameLengthMax - asset.name.length
      const repeat = ' '.repeat(n + 1)
      const repeat2 = ' '.repeat(n2 + 1)
      const nl = count === i ? '' : '\n'
      table += `| <img src="https://raw.githubusercontent.com/VadimMalykhin/binance-icons/main/currency/${asset.symbol}.svg" width="32" height="32" alt=""/>${repeat}| ${asset.symbol}${repeat}| ${asset.name}${repeat2}|${nl}`
    }
    return {
      currencyCount: count,
      currencyTable: table
    }
  }

  const manifest = (await readJson(resolve(generatedDir, 'manifest.json'))) as Repository.Manifest

  return {
    ...crypto(manifest),
    ...etf(manifest),
    ...currency(manifest)
  }
}

/**
 * Generate NPM
 */

export const generateNPM = async (): Promise<void> => {
  const manifest = (await readJson(resolve(releaseDir, 'manifest.json'))) as Repository.Manifest

  await ensureDir(resolve(appDir, 'npm'))

  // todo npm
}

/**
 * Sort <defs>
 *
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Element/defs
 *
 * @type {import('@types/svgo').Plugin<void>}
 */
const sortDefsPlugin = {
  name: 'sortDefs',
  type: 'visitor',
  active: true,
  description: 'sort <defs> forward',
  fn: () => {
    return {
      element: {
        enter: (node: XastElement, parentNode: XastElement) => {
          if (node.name === 'defs') {
            const array = parentNode.children
            for (let i = 0, j = array.length; i < j; i++) {
              if (array[i].name === 'defs') {
                array.unshift.apply(array, ...[array.splice(i, 1)])
              }
            }
            parentNode.children = array
          }
        }
      }
    }
  }
}

/**
 * Optimize SVG
 */
export const optimizeSVG = async (source: string, dest: string, prefix?: string): Promise<void> => {
  prefix ??= 'bic' // abbr of Binance ICons

  try {
    const sourceBuf = await fs.readFile(source)
    const optimizedSvg = optimize(sourceBuf, {
      multipass: true,
      plugins: [
        {
          name: 'preset-default'
        },
        {
          name: 'cleanupIDs',
          params: {
            minify: true
          },
          active: true
        },
        {
          name: 'prefixIds',
          params: {
            prefix: prefix,
            delim: '__',
            prefixIds: true,
            prefixClassNames: true
          },
          active: true
        },
        { name: 'sortAttrs', active: true },
        sortDefsPlugin
      ]
    }) as OptimizedSvg
    if (!optimizedSvg.error) {
      const svgData = optimizedSvg.data
      await writeFileAtomic(dest, svgData, { encoding: 'utf8', mode: 0o0600 })
    }
  } catch (err) {
    stdout.write(`[optimizeSVG] ${source} -> ${dest} | ${(err as Error).message}\n`)
    // console.error(err)
    stderr.write({ kind: 'stderr', verbose: false, data: Buffer.from(err as Error) })
    exit(1)
  }
}

/**
 * !todo
 * Create webp image
 */
export const saveAsWebP = async (): Promise<void> => {}
