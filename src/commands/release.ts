import { stdout, stderr } from 'node:process'
import { resolve } from 'node:path'

import { spinner } from 'zx/experimental'
import { emptyDir, copy, CopyOptions } from 'fs-extra'
import { green } from 'kolorist'

import { generatedDir, releaseDir, Icons, sleep } from '@/utils'

export async function releaseCommand(config: Config): Future<void> {
  await spinner('Cleaning release directory', async () => {
    await emptyDir(releaseDir)
  })

  await sleep(500)

  await spinner('Generating Release        ', async () => {
    try {
      const copyOptions: CopyOptions = { overwrite: true }
      await copy(resolve(generatedDir, 'crypto'), resolve(releaseDir, 'crypto'), copyOptions)
      await copy(resolve(generatedDir, 'etf'), resolve(releaseDir, 'crypto'), copyOptions)
      await copy(resolve(generatedDir, 'currency'), resolve(releaseDir, 'currency'), copyOptions)
      await copy(resolve(generatedDir, 'manifest.json'), resolve(releaseDir, 'manifest.json')), copyOptions
      await copy(resolve(generatedDir, 'README.md'), resolve(releaseDir, 'README.md'), copyOptions)
      await copy(resolve(generatedDir, 'PREVIEW.md'), resolve(releaseDir, 'PREVIEW.md'), copyOptions)

      stdout.write(`${green(Icons.mark)} ${green('Done')}                \n`)
      stdout.write(`  Release directory: ${green(releaseDir)}\n`)
    } catch (e) {
      stderr.write((e as Error).message)
    }
  })
}
