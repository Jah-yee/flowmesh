import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',

    // Integration tests need real infra — longer timeout
    testTimeout: 30000,
    hookTimeout: 30000,

    // Run integration test files sequentially to avoid infra conflicts
    pool: 'forks',
    poolOptions: {
      forks: { singleFork: true },
    },

    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage-integration',
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
      ],
    },

    include: ['apps/*/src/**/*.integration.spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
})
