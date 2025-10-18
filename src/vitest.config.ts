import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['./src/tests/setup.ts'],
    poolOptions: {
      threads: {
        maxThreads: 1, // force single-threaded test execution
      },
    },
  },
});