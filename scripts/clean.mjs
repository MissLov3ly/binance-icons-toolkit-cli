import { fs } from 'zx'

void (async () => {
  await fs.emptyDir('./bin')
  await fs.emptyDir('./dist')
})()
