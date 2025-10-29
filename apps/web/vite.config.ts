import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  server: {
    port: 3330,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@v-tool/shared': path.resolve(__dirname, '../../packages/shared/src/types.ts'),
    },
  },
});

