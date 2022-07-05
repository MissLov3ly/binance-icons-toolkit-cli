import { resolve } from 'node:path'
import { echo, fs, sleep } from 'zx'
import { spinner } from 'zx/experimental'
import { green, red, yellow } from 'kolorist'
import { appDir, branchDir, Icons, isFile, isUnsafeRestrictions } from '@/utils'

export async function todoCommand(config: Config): Future<void> {
  const cryptoTodo = async (manifest: Repository.Asset[]): Promise<void> => {
    const crypto = (await fs.readJson(resolve(appDir, 'generated', 'crypto.json'))) as Generated.Asset[]
    echo(`\n${green(Icons.identical)} Crypto\n`)
    let i = 0
    for (const { coin, name } of crypto) {
      if (manifest.findIndex(el => el.symbol === coin.toLocaleLowerCase()) === -1) {
        echo(`${green(Icons.triangleRight)} ${coin}  ${name}`)
        i++
      }
    }
    if (i === 0) {
      echo`${Icons.awesome} ${yellow('Awesome!')}\n   Nothing to do here.`
    }
    echo`\n${green(Icons.bullet)} Displayed ${i} of ${crypto.length}`
  }

  const etfTodo = async (manifest: Repository.Asset[]): Promise<void> => {
    const etfs = (await fs.readJson(resolve(appDir, 'generated', 'etf.json'))) as Generated.Asset[]
    echo`\n${green(Icons.identical)} ETFs\n`
    let i = 0
    for (const { coin, name } of etfs) {
      if (manifest.findIndex(el => el.symbol === coin.toLocaleLowerCase()) === -1) {
        echo(`${green(Icons.triangleRight)} ${coin}  ${name}`)
        i++
      }
    }
    if (i === 0) {
      echo`${Icons.awesome} ${yellow('Awesome!')}\n   Nothing to do here.`
    }
    echo`\n${green(Icons.bullet)} Displayed ${i} of ${etfs.length}`
  }

  const currencyTodo = async (manifest: Repository.Asset[]): Promise<void> => {
    const currencies = (await fs.readJson(resolve(appDir, 'generated', 'currency.json'))) as Generated.Asset[]
    echo(`\n${green(Icons.identical)} Currencies\n`)
    let i = 0
    for (const { coin, name } of currencies) {
      if (manifest.findIndex(el => el.symbol === coin.toLocaleLowerCase()) === -1) {
        echo`${green(Icons.triangleRight)} ${coin}  ${name}`
        i++
      }
    }
    if (i === 0) {
      echo`${Icons.awesome} ${yellow('Awesome!')}\n   Nothing to do here.`
    }
    echo`\n${green(Icons.bullet)} Displayed ${i} of ${currencies.length}`
  }

  if (!(await isFile(resolve(branchDir('main'), 'manifest.json')))) {
    echo(red(`${Icons.cross} manifest file does not exist. Run 'Clone' command.`))
    await sleep(1000)
    return
  }

  const manifest = (await fs.readJson(resolve(branchDir('main'), 'manifest.json'))) as Repository.Manifest
  await cryptoTodo(manifest.crypto)
  await etfTodo(manifest.etf)
  await currencyTodo(manifest.currency)
}
