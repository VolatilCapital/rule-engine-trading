import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/public-api.ts'],
  format: ['esm'],
  dts: false,
  clean: true,
  outDir: 'bundle',
  external: ['rule-engine-monorepo'],
});
