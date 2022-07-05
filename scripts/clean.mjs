#!/usr/bin/env node

import { fs } from 'zx'

void (async () => {
  await fs.emptyDir('./bin')
  await fs.emptyDir('./dist')
})()
