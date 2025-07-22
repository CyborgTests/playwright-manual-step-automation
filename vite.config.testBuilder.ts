import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { viteSingleFile } from 'vite-plugin-singlefile';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: 'test-builder',
  publicDir: 'test-builder-src/public',
  build: {
    outDir: 'test-builder-build',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './test-builder-src')
    }
  },
  server: {
    port: 3001
  }
});