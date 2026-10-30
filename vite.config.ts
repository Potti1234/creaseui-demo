import {defineConfig} from 'vite'
import tailwind from '@tailwindcss/vite'
import {fileURLToPath,URL} from 'node:url'
export default defineConfig({plugins:[tailwind()],resolve:{alias:{'@':fileURLToPath(new URL('./src',import.meta.url))}}})
