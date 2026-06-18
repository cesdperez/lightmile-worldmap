import type { City, Photo } from '$lib/data/schema';
import { alpha2ToNumeric } from '$lib/data/countryCodes';

export interface CityView extends City {
  numeric: string;
  photos: Photo[];
}

export interface MapData {
  cities: CityView[];
  /** Numeric ISO ids (zero-padded) of conquered countries, for joining to TopoJSON. */
  conqueredCountryIds: Set<string>;
  conqueredCityCount: number;
  conqueredCountryCount: number;
}

/**
 * A city is conquered iff it has >= 1 photo; a country iff >= 1 of its cities is.
 * Cities with no photos are dropped from the view (no pin, FR-3).
 */
export function buildMapData(cities: City[], photos: Photo[]): MapData {
  const photosByCity = new Map<string, Photo[]>();
  for (const photo of photos) {
    const list = photosByCity.get(photo.city) ?? [];
    list.push(photo);
    photosByCity.set(photo.city, list);
  }

  const conqueredCountryIds = new Set<string>();
  const cityViews: CityView[] = [];

  for (const city of cities) {
    const cityPhotos = photosByCity.get(city.id);
    if (!cityPhotos || cityPhotos.length === 0) continue;

    const numeric = alpha2ToNumeric(city.country)!;
    conqueredCountryIds.add(numeric);
    cityViews.push({ ...city, numeric, photos: cityPhotos });
  }

  return {
    cities: cityViews,
    conqueredCountryIds,
    conqueredCityCount: cityViews.length,
    conqueredCountryCount: conqueredCountryIds.size
  };
}

export interface Progress {
  conquered: number;
  total: number;
  fraction: number;
}

export function computeProgress(conqueredCountryCount: number, totalCountries: number): Progress {
  return {
    conquered: conqueredCountryCount,
    total: totalCountries,
    fraction: totalCountries > 0 ? conqueredCountryCount / totalCountries : 0
  };
}
