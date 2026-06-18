import { z } from 'zod';
import { isValidAlpha2 } from './countryCodes';

export const citySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  country: z
    .string()
    .length(2)
    .refine((c) => isValidAlpha2(c), { message: 'unknown ISO 3166-1 alpha-2 country code' }),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
});

export const photoSchema = z.object({
  city: z.string().min(1),
  src: z.string().min(1),
  author: z.string().min(1).optional(),
  note: z.string().optional(),
  date: z.string().optional()
});

export type City = z.infer<typeof citySchema>;
export type Photo = z.infer<typeof photoSchema>;

/**
 * Validate the raw data collections and cross-check referential integrity.
 * Throws on any problem so the prerender build fails loudly (DATA-MODEL guardrails).
 */
export function parseData(rawCities: unknown, rawPhotos: unknown): { cities: City[]; photos: Photo[] } {
  const cities = z.array(citySchema).parse(rawCities);
  const photos = z.array(photoSchema).parse(rawPhotos);

  const cityIds = new Set(cities.map((c) => c.id));

  const duplicates = cities.map((c) => c.id).filter((id, i, arr) => arr.indexOf(id) !== i);
  if (duplicates.length > 0) {
    throw new Error(`Duplicate city id(s): ${[...new Set(duplicates)].join(', ')}`);
  }

  const orphans = photos.filter((p) => !cityIds.has(p.city));
  if (orphans.length > 0) {
    throw new Error(
      `Photo(s) reference unknown city id: ${[...new Set(orphans.map((p) => p.city))].join(', ')}`
    );
  }

  return { cities, photos };
}
