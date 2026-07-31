import { CLUB_URL, SITE_URL } from '$lib/config';
import { countrySentence, type ContinentPlace } from './places';

/**
 * The machine-readable rendering of this site: `/llms.txt` and `/sitemap.xml`.
 *
 * Generated from the same derived map data the page draws, because the map is
 * SVG: a crawler or an assistant reading the HTML sees no city names at all.
 *
 * Deliberately says nothing about the run schedule or how to join. Per
 * CLAUDE.md, lightmile.nl is canonical for club information and a copy here
 * would drift; this file links out for it instead.
 */

export type PlacesSummary = {
  continents: ContinentPlace[];
  countryCount: number;
  cityCount: number;
  photoCount: number;
};

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function buildLlmsTxt(
  { continents, countryCount, cityCount, photoCount }: PlacesSummary,
  now: Date
): string {
  const sections = [
    `# Lightmile World Map`,
    `> An interactive world map of everywhere Lightmile Run Club has run. Wherever a club photo was taken, that city gets a pin and its country lights up. View-only: there is no login, no submission form, and no account.`,
    `So far: ${countryCount} ${countryCount === 1 ? 'country' : 'countries'}, ${cityCount} ${cityCount === 1 ? 'city' : 'cities'}, ${photoCount} ${photoCount === 1 ? 'photo' : 'photos'}. Generated ${isoDate(now)} from the site's own data.`,
    `This site is a companion to the club's main site. For anything about the club itself, the run schedule, meeting points, or how to join, use the official website below rather than this page: the schedule is not published here and would be out of date if it were.`,
    `## Official website`,
    `- [Lightmile Run Club](${CLUB_URL}): what the club is, the canonical agenda of regular runs and special events, meeting points, and how to join. Lightmile is a free, community-led run club in Eindhoven, the Netherlands.`,
    `## This site`,
    `- [World map](${SITE_URL}): pan and zoom a world map, tap a city pin to open a carousel of photos and videos taken there, each credited to the member who shot it. A progress bar tracks how many countries and cities the club has reached.`,
    `Countries are counted as reached when at least one photo exists from a city in that country. Content is added by a club admin; members send photos through the club's own channels.`,
    `## Countries and cities reached`,
    `${countrySentence(continents)}.`,
    continents
      .map((continent) =>
        [
          `### ${continent.name}`,
          ...continent.countries.map(
            (country) =>
              `- ${country.name}: ${country.cities.map((city) => city.name).join(', ')}`
          )
        ].join('\n')
      )
      .join('\n\n'),
    `## Official links`,
    [
      `- [Instagram](https://www.instagram.com/lightmilerunclub/)`,
      `- [Strava club](https://www.strava.com/clubs/Lightmile)`
    ].join('\n')
  ];

  return `${sections.join('\n\n')}\n`;
}

export function buildSitemap(now: Date): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}</loc>
    <lastmod>${isoDate(now)}</lastmod>
    <changefreq>monthly</changefreq>
  </url>
</urlset>
`;
}
