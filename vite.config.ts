import { fileURLToPath } from 'node:url'

import { foldkit } from '@foldkit/vite-plugin'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [foldkit({ devToolsMcpPort: false })],
  resolve: {
    alias: {
      '@pleat/core': fileURLToPath(new URL('./src/lib/pleat/core/src/index.ts', import.meta.url)),
      '@pleat/foldkit': fileURLToPath(new URL('./src/lib/pleat/foldkit/src/index.ts', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
