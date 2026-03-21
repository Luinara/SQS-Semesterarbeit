/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Run tests in a browser-like environment (jsdom)
    environment: 'jsdom',
    // Make Vitest globals (describe, it, expect, …) available without imports
    globals: true,
    coverage: {
      provider: 'v8',
      // Generate text summary, LCOV (for SonarQube), and HTML report
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
    },
  },
});
