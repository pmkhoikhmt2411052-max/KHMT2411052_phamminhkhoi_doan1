import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globalSetup: ['./tests/global-setup.ts'],
    setupFiles: ['./tests/setup-env.ts'],
    testTimeout: 60_000,
    hookTimeout: 180_000,
    // Cùng dùng một CSDL test: không chạy song song các file.
    fileParallelism: false,
  },
})
