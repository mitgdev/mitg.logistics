import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      exclude: [
        './dist',
        '**/node_modules/**',
        './src/index.ts',
        '**/main/adapters/**',
        'vite.config.mts',
        'commitlint.config.js',
        'eslint.config.mjs',
      ],
    },
    globals: true,
    restoreMocks: true,
  },
  plugins: [tsconfigPaths()],
})
