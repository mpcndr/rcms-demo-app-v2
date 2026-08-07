import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { viteSingleFile } from 'vite-plugin-singlefile';

// The source app lives in src/ (src/index.html is the Vite entry). The build
// emits a single, fully self-contained index.html to the repository ROOT so
// GitHub Pages ("Deploy from a branch", main / root) serves a working page at
// https://<user>.github.io/rcms-demo-app/ — and so the file also opens when
// double-clicked (file://).
//
// Why single-file: the app uses ES modules and a bundled Leaflet, which
// browsers only run over http(s) with resolvable specifiers. viteSingleFile
// inlines the JS and CSS, and a very high assetsInlineLimit embeds the logo
// PNG and login-background WebP as data: URIs, leaving one dependency-free
// HTML file.
export default defineConfig({
  root: 'src',
  base: './',
  plugins: [viteSingleFile()],
  build: {
    // Absolute path to the project root (the directory holding this config).
    outDir: fileURLToPath(new URL('.', import.meta.url)),
    emptyOutDir: false, // never wipe the repo root — only (over)write index.html
    assetsInlineLimit: 100 * 1024 * 1024,
    cssCodeSplit: false,
  },
});
