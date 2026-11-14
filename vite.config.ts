import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { cspScriptHashes } from './csp-script-hashes';
import { DEV_PORT, PREVIEW_PORT } from './scripts/ports';

export default defineConfig({
  server: { port: DEV_PORT, strictPort: true },
  preview: { port: PREVIEW_PORT, strictPort: true },
  plugins: [
    tailwindcss(),
    sveltekit({
      alias: { $lib: 'src/lib' },
      adapter: adapter({
        pages: 'build',
        assets: 'build',
        fallback: undefined,
        precompress: false,
        strict: true
      }),
      // Absolute asset URLs, not the relative default: Cloudflare Pages turns the
      // page's modulepreload tags into Early Hints Link headers, and relative
      // ./_app/... hints get resolved against whichever resource they ride on,
      // spawning recursive /_app/.../_app/... 404s in the browser.
      paths: { relative: false },
      // The generated crawler endpoints. They are referenced from <link
      // rel="alternate"> and robots.txt rather than from body links, so they are
      // listed explicitly instead of relying on the prerender crawler to find them.
      prerender: { entries: ['*', '/llms.txt', '/sitemap.xml'] }
    }),
    cspScriptHashes('build')
  ],
  resolve: {
    conditions: ['browser']
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
    setupFiles: ['src/test/setup.ts']
  }
});
