/// <reference types="vitest" />
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Redirige las peticiones de autenticación y API al backend
      '/oauth2': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/logout': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      all: true,
      exclude: [
        // Config files
        'postcss.config.mjs',
        'tailwind.config.ts',
        'vite.config.ts',
        'eslint.config.js',
        'components.json',

        // Directories
        '.github/**',
        'coverage/**',
        'dist/**',
        'node_modules/**',

        // Source files
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/setupTests.ts',
        'src/components/ui/**',
        'src/lib/**',
      ],
    },
  },
});
