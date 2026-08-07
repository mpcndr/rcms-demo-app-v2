import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Build a single, fully self-contained docs/index.html.
//
// The app is one HTML file but relies on ES modules (and a bundled Leaflet),
// which browsers only run over http(s). Opening the raw file with file://
// (double-clicking after `git clone`) left the page blank: the bare
// `import 'leaflet'` can't be resolved and external module <script src> is
// blocked by CORS on file://.
//
// viteSingleFile inlines the JS and CSS into the HTML, and a very high
// assetsInlineLimit embeds the images (logo PNG + login background WebP) as
// data: URIs. The result is one HTML file that just works when opened
// directly — while `npm run dev` still serves the same source for GitHub
// Pages ("Deploy from a branch", main / docs).
export default defineConfig({
  base: './',
  plugins: [viteSingleFile()],
  build: {
    outDir: 'docs',
    assetsInlineLimit: 100 * 1024 * 1024,
    cssCodeSplit: false,
  },
});
