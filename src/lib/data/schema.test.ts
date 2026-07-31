import { describe, expect, it } from 'vitest';
import { photoSchema } from './schema';

const photo = { city: 'eindhoven', src: 'photos/eindhoven/photo.jpg' };

describe('photoSchema', () => {
  it('requires image dimensions together', () => {
    expect(photoSchema.safeParse({ ...photo, width: 1600 }).success).toBe(false);
    expect(photoSchema.safeParse({ ...photo, height: 900 }).success).toBe(false);
  });

  it('accepts complete dimensions or neither dimension', () => {
    expect(photoSchema.safeParse(photo).success).toBe(true);
    expect(photoSchema.safeParse({ ...photo, width: 1600, height: 900 }).success).toBe(true);
  });
});
