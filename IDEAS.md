# Ideas

## Mobile admin panel

Goal: add photos from a phone without touching git or Cloudflare directly.

Approach: hidden `/admin` Svelte route + a Cloudflare Worker.

- Worker handles image upload to R2 (via R2 binding) and updates `cities.json`/`photos.json` via GitHub API (PAT stored as Worker secret)
- GitHub commit triggers Cloudflare Pages rebuild automatically
- Auth: single shared token, checked by the Worker
- Image compression client-side (Canvas API)

No database changes needed. JSON files stay as source of truth. Build still takes ~30s before the photo appears live.
