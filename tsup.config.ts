import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  splitting: false,
  clean: true,
  minify: false,
  external: [
    '@playwright/test',
    'playwright',
    'playwright-core',
    'child_process',
    'fs',
    'path',
    'os',
    'http',
    'chromium-bidi',
    'chromium-bidi/lib/cjs/bidiMapper/BidiMapper',
    'chromium-bidi/lib/cjs/cdp/CdpConnection',
  ]
});
