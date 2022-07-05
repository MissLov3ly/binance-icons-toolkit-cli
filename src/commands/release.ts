import { resolve } from 'node:path'
import { echo, fs, sleep } from 'zx'
import { spinner } from 'zx/experimental'
import { green } from 'kolorist'
import { generatedDir, releaseDir, Icons } from '@/utils'
import type { CopyOptions } from 'fs-extra'

export async function releaseCommand(config: Config): Future<void> {
  await fs.emptyDir(releaseDir)

  await sleep(500)

  const copyOptions: CopyOptions = { overwrite: true }
  await fs.copy(resolve(generatedDir, 'crypto'), resolve(releaseDir, 'crypto'), copyOptions)
  await fs.copy(resolve(generatedDir, 'etf'), resolve(releaseDir, 'crypto'), copyOptions)
  await fs.copy(resolve(generatedDir, 'currency'), resolve(releaseDir, 'currency'), copyOptions)
  await fs.copy(resolve(generatedDir, 'manifest.json'), resolve(releaseDir, 'manifest.json')), copyOptions
  await fs.copy(resolve(generatedDir, 'README.md'), resolve(releaseDir, 'README.md'), copyOptions)
  await fs.copy(resolve(generatedDir, 'PREVIEW.md'), resolve(releaseDir, 'PREVIEW.md'), copyOptions)

  echo(green(`${green(Icons.mark)} Release done`))
  echo`  Can be found here: ${releaseDir}`
}
