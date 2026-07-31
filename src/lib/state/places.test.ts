import { describe, expect, it } from 'vitest';
import { buildPlaces, countrySentence } from './places';
import type { CityView } from './derive';

function city(id: string, name: string, country: string): CityView {
  return {
    id,
    name,
    country,
    lat: 0,
    lng: 0,
    numeric: '000',
    photos: []
  };
}

describe('buildPlaces', () => {
  it('groups and sorts cities and countries by continent', () => {
    const places = buildPlaces([
      city('utrecht', 'Utrecht', 'NL'),
      city('amsterdam', 'Amsterdam', 'NL'),
      city('mexico-city', 'Mexico City', 'MX')
    ]);

    expect(places.map((continent) => continent.name)).toEqual(['Europe', 'North America']);
    expect(places[0].countries[0].cities.map((place) => place.name)).toEqual([
      'Amsterdam',
      'Utrecht'
    ]);
    expect(countrySentence(places)).toBe('Mexico and Netherlands');
  });

  it('handles empty and singular country lists', () => {
    expect(countrySentence([])).toBe('');
    expect(countrySentence(buildPlaces([city('eindhoven', 'Eindhoven', 'NL')]))).toBe(
      'Netherlands'
    );
  });
});
