import { $, fs, glob } from 'zx'

void (async () => {
  await removePackages()
  const packageName = await makePackage()
  await installPackage(packageName)
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
  if (packOutput.exitCode !== 0) {
    return
  }
  return packOutput.stdout.trim()
}

async function installPackage(packageName) {
  await $`npm i -g ./${packageName}`
}
