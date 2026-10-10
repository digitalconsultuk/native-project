/**
 * Test runner configuration
 * */
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

export default mergeConfig(viteConfig, defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/_tests_/setup.ts',
    include: ['src/**/*.test.{ts,tsx}', 'netlify/**/*.test.ts'],
    isolate: false,
    css: false,
    // MUI form tests drive many user-event keystrokes and run slower under coverage
    testTimeout: 15000,
    coverage: {
      provider: 'v8',
      include: ['src/**', 'netlify/**'],
      exclude: ['src/_tests_/**', 'src/main.tsx', 'src/vite-env.d.ts', '**/*.test.{ts,tsx}'],
    },
  },
}))
