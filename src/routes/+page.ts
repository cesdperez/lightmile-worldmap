import type { PageLoad } from './$types';
import { parseData } from '$lib/data/schema';
import rawCities from '$lib/data/cities.json';
import rawPhotos from '$lib/data/photos.json';

// Runs at prerender time: invalid or inconsistent data throws here and fails the build.
export const load: PageLoad = () => {
  const { cities, photos } = parseData(rawCities, rawPhotos);
  return { cities, photos };
};
