#!/usr/bin/env node

import { $, fs, glob, sleep } from 'zx'

void (async () => {
  await removePackages()
  const packageName = await makePackage()
  await installPackage(packageName)
  await sleep(2000)
  await removePackages()
})()

async function removePackages() {
  const packages = await glob('./binance-icons-toolkit-cli-*.tgz')
  for await (const p of packages) {
    await fs.remove(p)
  }
}

async function makePackage() {
  const packOutput = await $`npm pack .`
  if (packOutput.exitCode === 0) {
    return packOutput.stdout.trim()
  }
}

async function installPackage(packageName) {
  if (packageName !== undefined) {
    await $`npm i -g ./${packageName}`
  }
}
