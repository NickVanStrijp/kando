import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({
        exclude: ['@kando/core', '@kando/db', '@kando/shared']
      })
    ]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve(rootDir, 'src/renderer/src'),
        '@kando/shared': resolve(rootDir, '../../packages/shared/src'),
        '@kando/core': resolve(rootDir, '../../packages/core/src'),
        '@kando/ui': resolve(rootDir, '../../packages/ui/src')
      }
    },
    plugins: [vue(), tailwindcss()]
  }
})
