// PostHog is a single free-tier project shared with lightmile.nl, so the project
// key ships in every build: preview deployments and localhost would report into the
// same stream as production. Gate on an exact production hostname instead of a
// suffix match, so neither *.pages.dev nor a lookalike domain can report.
const PRODUCTION_HOSTS = ['worldmap.lightmile.nl'];

export function shouldTrack(hostname: string, key: string): boolean {
  return key.startsWith('phc_') && PRODUCTION_HOSTS.includes(hostname);
}
