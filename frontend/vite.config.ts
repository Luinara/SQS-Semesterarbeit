import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Explicit aliases ensure that bare module imports made by test files in
    // ../tests/unit/ (outside this Vite project root) still resolve to the
    // correct packages installed in frontend/node_modules.
    alias: [
      { find: '@', replacement: resolve(__dirname, './src') },
      // React runtime – must be a singleton so all hooks work correctly
      { find: 'react', replacement: resolve(__dirname, 'node_modules/react') },
      { find: 'react-dom', replacement: resolve(__dirname, 'node_modules/react-dom') },
      // Testing helpers used by unit tests
      {
        find: '@testing-library/react',
        replacement: resolve(__dirname, 'node_modules/@testing-library/react'),
      },
      {
        find: '@testing-library/jest-dom',
        replacement: resolve(__dirname, 'node_modules/@testing-library/jest-dom'),
      },
      {
        find: '@testing-library/user-event',
        replacement: resolve(__dirname, 'node_modules/@testing-library/user-event'),
      },
    ],
  },
  server: {
    port: 3000,
    // Proxy API calls to the backend during development
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
    // Allow Vitest/Vite server to load files from the root tests/ directory,
    // which is one level above this frontend/ package.
    fs: {
      allow: ['..'],
    },
  },
  test: {
    // Vitest configuration – test files live in the root tests/ directory
    globals: true,
    environment: 'jsdom',
    // Setup file is kept inside frontend/ so Vite can resolve its dependencies
    // (e.g. @testing-library/jest-dom) from the correct node_modules folder.
    setupFiles: ['./vitest.setup.ts'],
    include: ['../tests/unit/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['node_modules/'],
    },
  },
});
