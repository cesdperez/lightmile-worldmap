import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import Carousel from './Carousel.svelte';
import type { Cluster } from '$lib/state/cluster';

const cluster: Cluster = {
  id: 'eindhoven',
  x: 0,
  y: 0,
  tier: 'place',
  name: '',
  photoCount: 2,
  cities: [
    {
      id: 'eindhoven',
      name: 'Eindhoven',
      country: 'NL',
      lat: 51.44,
      lng: 5.48,
      numeric: '528',
      photos: [
        { city: 'eindhoven', src: 'photos/eindhoven/one.jpg', author: 'A' },
        { city: 'eindhoven', src: 'photos/eindhoven/two.jpg', author: 'B' }
      ]
    }
  ]
};

describe('Carousel', () => {
  it('shows a loading state until media settles and resets it after navigation', async () => {
    render(Carousel, { cluster, onClose: () => {} });

    expect(screen.getByRole('status').textContent).toContain('Loading media');
    await fireEvent.load(screen.getByAltText('Lightmile photo in Eindhoven by A'));
    expect(screen.queryByRole('status')).toBeNull();

    await fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('status').textContent).toContain('Loading media');
    expect(screen.getByAltText('Lightmile photo in Eindhoven by B')).not.toBeNull();
  });
});
