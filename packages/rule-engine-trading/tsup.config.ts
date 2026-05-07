import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['dist/public-api.js'],
  format: ['esm'],
  dts: false,
  outDir: 'bundle',
  bundle: true,
  external: ['rule-engine-monorepo'],
});
