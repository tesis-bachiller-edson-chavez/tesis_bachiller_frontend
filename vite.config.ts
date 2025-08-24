/// <reference types="vitest" />
import { fileURLToPath, URL } from "node:url";
import { defineConfig as defineViteConfig } from 'vite';
import { defineConfig as defineVitestConfig, mergeConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default mergeConfig(
  defineViteConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  }),
  defineVitestConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        all: true,
        exclude: [
          './.github/**',
          './coverage/**',
          './dist/**',
          './eslint.config.js',
          './vite.config.ts',
          './src/main.tsx',
          './src/vite-env.d.ts',
          './src/setupTests.ts',
        ],
      },
    },
  })
);
