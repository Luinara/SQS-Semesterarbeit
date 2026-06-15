import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@angular/compiler': resolve(
        __dirname,
        'node_modules/@angular/compiler/fesm2022/compiler.mjs'
      ),
      '@angular/common': resolve(__dirname, 'node_modules/@angular/common/fesm2022/common.mjs'),
      '@angular/core': resolve(__dirname, 'node_modules/@angular/core/fesm2022/core.mjs'),
      '@angular/core/testing': resolve(
        __dirname,
        'node_modules/@angular/core/fesm2022/testing.mjs'
      ),
      '@angular/forms': resolve(__dirname, 'node_modules/@angular/forms/fesm2022/forms.mjs'),
      '@angular/router': resolve(__dirname, 'node_modules/@angular/router/fesm2022/router.mjs'),
    },
  },
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
