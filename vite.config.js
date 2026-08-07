import { defineConfig } from 'vite';

// Relative base so the built assets resolve correctly whether the app is
// served from a GitHub Pages project subpath (e.g. /rcms-demo-app/) or root.
// Build output goes to docs/ so GitHub Pages can serve it directly via
// "Deploy from a branch" (main / docs) with no Actions runner involved.
export default defineConfig({
  base: './',
  build: {
    outDir: 'docs',
  },
});
