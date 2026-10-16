import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    // Each database test file boots its own in-process Postgres; give it time on slow machines.
    testTimeout: 30000,
    hookTimeout: 60000,
  },
});
