import { parseData } from '$lib/data/schema';
import rawCities from '$lib/data/cities.json';
import rawPhotos from '$lib/data/photos.json';
import { buildMapData } from '$lib/state/derive';
import { buildPlaces } from '$lib/state/places';
import { buildLlmsTxt } from '$lib/state/agent-docs';
import type { RequestHandler } from './$types';

export const prerender = true;

// Generated rather than hand-written: the map is SVG, so this file is the only
// place a crawler or an assistant can read the city names as text.
export const GET: RequestHandler = () => {
  const { cities, photos } = parseData(rawCities, rawPhotos);
  const mapData = buildMapData(cities, photos);
  const continents = buildPlaces(mapData.cities);

  const body = buildLlmsTxt(
    {
      continents,
      countryCount: mapData.conqueredCountryCount,
      cityCount: mapData.conqueredCityCount,
      photoCount: photos.length
    },
    new Date()
  );

  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' }
  });
};
