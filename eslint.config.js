import { fileURLToPath } from 'node:url'
import { creaseui } from '@creaseui/lint'

export default [
  ...creaseui({
    rootDir: fileURLToPath(new URL('.', import.meta.url)),
    renderer: 'stylex',
    preset: 'strict',
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    tsconfig: './tsconfig.json',
    manifest: './crease.lock.json',
    policy: 'crease-default-v1',
  }),
]
