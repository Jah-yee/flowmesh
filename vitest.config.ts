import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',

    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.module.ts',
        '**/main.ts',
        '**/migrations/**',
        '**/*.dto.ts',
        '**/*.entity.ts',
        '**/vitest.config.ts',
      ],
    },

    // Unit tests only — integration tests run separately
    include: ['apps/*/src/**/*.spec.ts', 'packages/*/src/**/*.spec.ts'],
    exclude: ['**/*.integration.spec.ts', '**/node_modules/**', '**/dist/**'],
  },
})
