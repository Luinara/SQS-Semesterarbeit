import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  server: {
    fs: {
      allow: [resolve(__dirname, '..')],
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [resolve(__dirname, '../tests/unit/setup.ts')],
    include: ['../tests/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'src/app/core/state/**/*.ts',
        'src/app/core/services/browser-storage.service.ts',
        'src/app/shared/mock/**/*.ts',
      ],
      exclude: ['**/*.model.ts'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});
