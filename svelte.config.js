import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// Keep in sync with PHOTOS_BASE_URL in src/lib/config.ts.
const PHOTOS_ORIGIN = 'https://pub-2baa1a0f4aa548ce8d29ebf856e5d130.r2.dev';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
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
    prerender: { entries: ['*', '/llms.txt', '/sitemap.xml'] },
    // Prerendered pages have no server to set a CSP header, so SvelteKit emits a
    // <meta> CSP and hashes its own inline hydration bootstrap. `frame-ancestors`
    // is meta-ignored, so it stays in static/_headers alongside the other headers.
    csp: {
      mode: 'hash',
      directives: {
        'default-src': ['self'],
        // Cloudflare Web Analytics: the dashboard toggle injects the beacon at
        // serve time, so the prerendered CSP must allow it or it is silently
        // blocked. The beacon script loads from static.cloudflareinsights.com
        // and reports to cloudflareinsights.com (connect-src below).
        // PostHog: the bundled SDK fetches its remote config and lazy-loads
        // extensions from a PostHog-owned subdomain. Wildcarded rather than pinned
        // to eu.i.posthog.com on purpose: PostHog reroutes traffic across
        // subdomains without notice, and a pinned host fails silently, which for
        // analytics means noticing weeks later that data stopped.
        'script-src': ['self', 'https://static.cloudflareinsights.com', 'https://*.posthog.com'],
        // SvelteKit's route announcer, the progress bar width, and the d3 zoom
        // transform all set inline style attributes at runtime, which build-time
        // hashing cannot cover. Allow inline styles; script-src stays hash-locked.
        'style-src': ['self', 'unsafe-inline'],
        // Photos and videos are served from the public R2 bucket, not this origin.
        'img-src': ['self', 'data:', PHOTOS_ORIGIN],
        'media-src': ['self', PHOTOS_ORIGIN],
        'font-src': ['self'],
        'connect-src': ['self', 'https://cloudflareinsights.com', 'https://*.posthog.com'],
        'base-uri': ['self'],
        'form-action': ['self'],
        'worker-src': ['self'],
        'object-src': ['none']
      }
    }
  }
};

export default config;
