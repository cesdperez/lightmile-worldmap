import type { CityView } from './derive';
import { CONTINENT_NAMES, continentOf, type ContinentCode } from '$lib/data/continents';

/**
 * The conquered places as a readable hierarchy: continent -> country -> city.
 *
 * The map itself is an SVG of paths and pins, so every place name it shows is
 * invisible to a screen reader, a search engine, and an AI assistant. This turns
 * the same derived data into text, for the Places panel, `llms.txt`, and the
 * `ItemList` structured data.
 */

export interface CityPlace {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface CountryPlace {
  /** ISO 3166-1 alpha-2. */
  code: string;
  name: string;
  cities: CityPlace[];
}

export interface ContinentPlace {
  code: ContinentCode;
  name: string;
  countries: CountryPlace[];
  cityCount: number;
}

// Intl carries the English country names, so there is no second lookup table to
// keep in step with countryCodes.ts. Falls back to the code if a runtime lacks it.
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

export function countryName(alpha2: string): string {
  const code = alpha2.toUpperCase();
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

export function buildPlaces(cities: CityView[]): ContinentPlace[] {
  const byContinent = new Map<ContinentCode, Map<string, CityPlace[]>>();

  for (const city of cities) {
    const continent = continentOf(city.country);
    // schema.ts fails the build on a country with no continent, so this cannot
    // drop a city in practice; the guard keeps the function total.
    if (!continent) continue;

    const code = city.country.toUpperCase();
    const countries = byContinent.get(continent) ?? new Map<string, CityPlace[]>();
    const list = countries.get(code) ?? [];
    list.push({
      id: city.id,
      name: city.name,
      lat: city.lat,
      lng: city.lng
    });
    countries.set(code, list);
    byContinent.set(continent, countries);
  }

  const continents: ContinentPlace[] = [];

  for (const [continent, countries] of byContinent) {
    const entries: CountryPlace[] = [...countries]
      .map(([code, cityList]) => ({
        code,
        name: countryName(code),
        cities: cityList.toSorted((a, b) => a.name.localeCompare(b.name))
      }))
      .toSorted((a, b) => a.name.localeCompare(b.name));

    continents.push({
      code: continent,
      name: CONTINENT_NAMES[continent],
      countries: entries,
      cityCount: entries.reduce((total, country) => total + country.cities.length, 0)
    });
  }

  // Busiest continent first: Europe is where nearly every pin is, so it should
  // lead the panel and the llms.txt listing rather than sort alphabetically.
  return continents.toSorted(
    (a, b) => b.cityCount - a.cityCount || a.name.localeCompare(b.name)
  );
}

/** Flat, alphabetical country list. Used for the one-line summary sentence. */
export function countryList(continents: ContinentPlace[]): CountryPlace[] {
  return continents
    .flatMap((continent) => continent.countries)
    .toSorted((a, b) => a.name.localeCompare(b.name));
}

/** "Argentina, Austria, Belgium, ... and the United States" */
export function countrySentence(continents: ContinentPlace[]): string {
  const names = countryList(continents).map((country) => country.name);
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
}
