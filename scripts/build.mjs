import * as esbuild from 'esbuild'
import { fs } from 'zx'

try {
  await fs.emptyDir('./dist')

  await esbuild.build({
    entryPoints: ['./src/index.ts'],
    outfile: './dist/cli.cjs',
    platform: 'node',
    target: 'node18.0.0',
    format: 'cjs',
    minify: false,
    bundle: true,
    allowOverwrite: true,
    legalComments: 'inline',
    banner: {
      js: '#!/usr/bin/env node\n'
    }
  })

  await esbuild.build({
    entryPoints: ['./src/index.ts'],
    outfile: './dist/cli.min.cjs',
    platform: 'node',
    target: 'node18.0.0',
    format: 'cjs',
    minify: true,
    bundle: true,
    allowOverwrite: true,
    legalComments: 'none',
    banner: {
      js: '#!/usr/bin/env node\n'
    }
  })

  await fs.copyFile('./dist/cli.min.cjs', './bin/cli.cjs')
} catch (e) {
  process.exit(1)
}
