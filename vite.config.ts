import { defineConfig } from 'vite'
import { foldkit } from '@foldkit/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [tailwindcss(), foldkit({ devToolsMcpPort: false })],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
})
