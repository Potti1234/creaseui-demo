import { fileURLToPath } from 'node:url'

import { foldkit } from '@foldkit/vite-plugin'
import stylex from '@stylexjs/unplugin'
import { defineConfig } from 'vite'

import { stylexCompilerOptions } from './stylex.config.js'

export default defineConfig({
  plugins: [stylex.vite(stylexCompilerOptions), foldkit({ devToolsMcpPort: false })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
