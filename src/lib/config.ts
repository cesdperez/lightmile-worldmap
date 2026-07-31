// Photos are hosted in a public Cloudflare R2 bucket, served via its r2.dev URL.
// photos.json `src` values are bucket keys (e.g. "photos/<city>/<file>") appended to this base.
export const PHOTOS_BASE_URL = 'https://pub-2baa1a0f4aa548ce8d29ebf856e5d130.r2.dev';

/** This site. Shared by the page head, the generated llms.txt, and the sitemap. */
export const SITE_URL = 'https://worldmap.lightmile.nl/';

/** The club's canonical site. Authoritative for anything about the club itself. */
export const CLUB_URL = 'https://lightmile.nl/';
