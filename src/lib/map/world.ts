import { geoNaturalEarth1, geoPath, type GeoProjection, type GeoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, Geometry } from 'geojson';
import topology from 'world-atlas/countries-110m.json';

export interface CountryFeature extends Feature<Geometry> {
  id: string;
  properties: { name: string };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const collection = feature(topology as any, (topology as any).objects.countries) as unknown as {
  features: CountryFeature[];
};

export const countries: CountryFeature[] = collection.features;
export const totalCountries = countries.length;

/** A projection fitted to the given size, plus its path generator. */
export function buildProjection(width: number, height: number): { projection: GeoProjection; path: GeoPath } {
  const projection = geoNaturalEarth1().fitExtent(
    [
      [8, 8],
      [width - 8, height - 8]
    ],
    collection as unknown as Feature
  );
  return { projection, path: geoPath(projection) };
}
