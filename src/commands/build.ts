import { resolve, parse } from 'node:path'
import { echo, fs, sleep } from 'zx'
import { spinner } from 'zx/experimental'
import { green, yellow } from 'kolorist'
import prompts from 'prompts'
import writeFileAtomic from 'write-file-atomic'
import { appDir, branchDir, generatedDir, releaseDir, Icons, optimizeSVG, generateManifest, generateMarkdown, generateNPM } from '@/utils'
import type { WriteOptions, CopyOptions } from 'fs-extra'

export async function buildCommand(config: Config): Future<void> {
  // icons
  const buildIcons = async () => {
    await spinner(yellow(`${Icons.spacer} Building icons...`), async () => {
      // Create folders for icons.
      for (const dir of ['crypto', 'etf', 'currency']) {
        await fs.ensureDir(`${appDir}/generated/${dir}`)
      }

      // crypto
      const cryptoSvgFiles = await fs.readdir(resolve(branchDir('dev'), 'sources', 'crypto'))
      for await (const file of cryptoSvgFiles) {
        if (!file.endsWith('.svg')) {
          continue
        }
        await optimizeSVG(resolve(branchDir('dev'), 'sources', 'crypto', file), resolve(generatedDir, 'crypto', file), parse(file).name)
      }

      // etf
      const etfSvgFiles = await fs.readdir(resolve(branchDir('dev'), 'sources', 'etf'))
      for await (const file of etfSvgFiles) {
        if (!file.endsWith('.svg')) {
          continue
        }
        await optimizeSVG(resolve(branchDir('dev'), 'sources', 'etf', file), resolve(generatedDir, 'etf', file))
      }

      // currency
      const currencySvgFiles = await fs.readdir(resolve(branchDir('dev'), 'sources', 'currency'))
      for await (const file of currencySvgFiles) {
        if (!file.endsWith('.svg')) {
          continue
        }
        await optimizeSVG(resolve(branchDir('dev'), 'sources', 'currency', file), resolve(generatedDir, 'currency', file))
      }
      echo(green(`${Icons.mark} Build icons done.`))
    })
  }

  // manifest
  const buildManifest = async () => {
    echo(yellow(`${Icons.spacer} Building manifest...`))
    const manifest = await generateManifest()
    const opts: WriteOptions = { spaces: 2, EOL: '\n' }
    await fs.writeJson(`${appDir}/generated/manifest.json`, manifest)
    await fs.writeJson(`${appDir}/generated/manifest.readable.json`, manifest, opts)
    echo(green(`${Icons.mark} Build manifest done.`))
  }

  // markdown
  const buildMarkdown = async () => {
    echo(yellow(`${Icons.spacer} Building markdown...`))

    const readmeTemplate = await fs.readFile(resolve(branchDir('dev'), 'sources', 'README.template.md'))
    await writeFileAtomic(resolve(generatedDir, 'README.md'), readmeTemplate, { encoding: 'utf8', mode: 0o0600 })
    echo(`${green(Icons.mark)} ${green('Updating `README.md` done')}`)

    const previewTemplate = await fs.readFile(resolve(branchDir('dev'), 'sources', 'PREVIEW.template.md'))
    const { cryptoCount, cryptoTable, etfCount, etfTable, currencyCount, currencyTable } = await generateMarkdown()
    const preview = previewTemplate
      .toString('utf-8')
      .replace('{{ previewCryptoCount }}', cryptoCount)
      .replace('{{ previewCryptoTable }}', cryptoTable)
      .replace('{{ previewEtfCount }}', etfCount)
      .replace('{{ previewEtfTable }}', etfTable)
      .replace('{{ previewCurrencyCount }}', currencyCount)
      .replace('{{ previewCurrencyTable }}', currencyTable)
    await writeFileAtomic(resolve(generatedDir, 'PREVIEW.md'), preview, { encoding: 'utf8', mode: 0o0600 })
    echo(`${green(Icons.mark)} ${green('Updating `PREVIEW.md` done')}`)

    echo(green(`${Icons.mark} Build markdown done.`))
  }

  // NPM
  const buildNPM = async () => {
    echo(yellow(`${Icons.spacer} Building NPM...`))

    try {
      await generateNPM()
      echo(green(`${Icons.mark} Build NPM done.`))
    } catch (e) {
      echo(green(`${Icons.mark} Build NPM fail.`))
      throw e
    }
  }

  try {
    const response = await prompts([
      {
        type: 'select',
        name: 'value',
        message: 'Select a Command',
        choices: [
          { title: 'Build All', description: 'Build all below', value: 'all' },
          { title: 'Build Icons', description: 'Build svg icons', value: 'icons' },
          { title: 'Build Manifest', description: 'Build manifest file that contains the svg icons metadata', value: 'manifest' },
          { title: 'Build Markdown', description: 'Build Markdown files', value: 'markdown' },
          { title: 'Build NPM', description: 'Build package for npm.org', value: 'npm' }
        ],
        initial: 0
      }
    ])

    switch (response.value) {
      case 'all': {
        await buildIcons()
        await buildManifest()
        await buildMarkdown()
        await buildNPM()
        break
      }
      case 'icons': {
        await buildIcons()
        break
      }
      case 'manifest': {
        await buildManifest()
        break
      }
      case 'markdown': {
        await buildMarkdown()
        break
      }
      case 'npm': {
        await buildNPM()
        break
      }
      default: {
        process.exit(1)
        break
      }
    }
    // echo`\r`
    // await startCommand(config)
  } catch (err) {
    echo((err as Error).message)
    process.exit(1)
  }
}
