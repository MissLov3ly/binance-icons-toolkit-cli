import { stdout } from 'node:process'
import { resolve } from 'node:path'
import { readJson } from 'fs-extra'
import { spinner } from 'zx/experimental'
import { green, red, yellow } from 'kolorist'
import { appDir, branchDir, Icons, isFile, sleep } from '@/utils'

export async function todoCommand(config: Config): Future<void> {
  const cryptoTodo = async (manifest: Repository.Asset[]): Promise<void> => {
    const crypto = (await readJson(resolve(appDir, 'generated', 'crypto.json'))) as Generated.Asset[]
    stdout.write(`\n${green(Icons.identical)} Crypto\n\n`)
    let i = 0
    for (const { coin, name } of crypto) {
      if (manifest.findIndex(el => el.symbol === coin.toLocaleLowerCase()) === -1) {
        stdout.write(`${green(Icons.triangleRight)} ${coin}  ${name}\n`)
        i++
      }
    }
    if (i === 0) {
      stdout.write(`${Icons.awesome} ${yellow('Awesome!')}\n   Nothing to do here.\n`)
    }
    stdout.write(`\n${green(Icons.bullet)} Displayed ${i} of ${crypto.length}\n`)
  }

  const etfTodo = async (manifest: Repository.Asset[]): Promise<void> => {
    const etfs = (await readJson(resolve(appDir, 'generated', 'etf.json'))) as Generated.Asset[]
    stdout.write(`\n${green(Icons.identical)} ETFs\n\n`)
    let i = 0
    for (const { coin, name } of etfs) {
      if (manifest.findIndex(el => el.symbol === coin.toLocaleLowerCase()) === -1) {
        stdout.write(`${green(Icons.triangleRight)} ${coin}  ${name}\n`)
        i++
      }
    }
    if (i === 0) {
      stdout.write(`${Icons.awesome} ${yellow('Awesome!')}\n   Nothing to do here.\n`)
    }
    stdout.write(`\n${green(Icons.bullet)} Displayed ${i} of ${etfs.length}\n`)
  }

  const currencyTodo = async (manifest: Repository.Asset[]): Promise<void> => {
    const currencies = (await readJson(resolve(appDir, 'generated', 'currency.json'))) as Generated.Asset[]
    stdout.write(`\n${green(Icons.identical)} Currencies\n\n`)
    let i = 0
    for (const { coin, name } of currencies) {
      if (manifest.findIndex(el => el.symbol === coin.toLocaleLowerCase()) === -1) {
        stdout.write(`${green(Icons.triangleRight)} ${coin}  ${name}\n`)
        i++
      }
    }
    if (i === 0) {
      stdout.write(`${Icons.awesome} ${yellow('Awesome!')}\n   Nothing to do here.\n`)
    }
    stdout.write(`\n${green(Icons.bullet)} Displayed ${i} of ${currencies.length}\n`)
  }

  if (!(await isFile(resolve(branchDir('main'), 'manifest.json')))) {
    stdout.write(red(`${Icons.cross} manifest file does not exist. Run 'Clone' command.\n`))
    await sleep(1000)
    return
  }

  const manifest = (await readJson(resolve(branchDir('main'), 'manifest.json'))) as Repository.Manifest
  await cryptoTodo(manifest.crypto)
  await etfTodo(manifest.etf)
  await currencyTodo(manifest.currency)
}
