/// <reference types="vitest" />
import { defineConfig as defineViteConfig } from 'vite'
import { defineConfig as defineVitestConfig, mergeConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default mergeConfig(
  defineViteConfig({
    plugins: [react(), tailwindcss()],
  }),
  defineVitestConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
    },
  })
)
