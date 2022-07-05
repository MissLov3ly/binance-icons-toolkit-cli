import { stdout } from 'node:process'
import { resolve } from 'node:path'
import { emptyDir, copy } from 'fs-extra'
import { green } from 'kolorist'
import { generatedDir, releaseDir, Icons, sleep } from '@/utils'
import type { CopyOptions } from 'fs-extra'

export async function releaseCommand(config: Config): Future<void> {
  await emptyDir(releaseDir)

  await sleep(500)

  const copyOptions: CopyOptions = { overwrite: true }
  await copy(resolve(generatedDir, 'crypto'), resolve(releaseDir, 'crypto'), copyOptions)
  await copy(resolve(generatedDir, 'etf'), resolve(releaseDir, 'crypto'), copyOptions)
  await copy(resolve(generatedDir, 'currency'), resolve(releaseDir, 'currency'), copyOptions)
  await copy(resolve(generatedDir, 'manifest.json'), resolve(releaseDir, 'manifest.json')), copyOptions
  await copy(resolve(generatedDir, 'README.md'), resolve(releaseDir, 'README.md'), copyOptions)
  await copy(resolve(generatedDir, 'PREVIEW.md'), resolve(releaseDir, 'PREVIEW.md'), copyOptions)

  stdout.write(`${green(Icons.mark)} ${green('Release done')}\n`)
  stdout.write(`  Can be found here: ${releaseDir}\n`)
}
