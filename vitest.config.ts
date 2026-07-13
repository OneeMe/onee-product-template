import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'lcov'],
      reportsDirectory: './coverage',
    },
    globals: true,
    include: ['**/*.{test,spec}.{ts,tsx}'],
  },
});
