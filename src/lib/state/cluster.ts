import type { CityView } from './derive';

export interface ProjectedPin {
  city: CityView;
  x: number;
  y: number;
}

export interface Cluster {
  /** Stable key: sorted member city ids joined. */
  id: string;
  /** Centroid of member pins, in projection (pre-transform) space. */
  x: number;
  y: number;
  cities: CityView[];
  photoCount: number;
}

/**
 * Merge pins that sit within `thresholdPx` screen pixels of one another at the
 * current zoom `k`. Cities from different countries never merge, so at the most
 * zoomed-out level a country collapses to a single pin at worst.
 */
export function clusterPins(pins: ProjectedPin[], k: number, thresholdPx: number): Cluster[] {
  const threshold = thresholdPx / k;

  const byCountry = new Map<string, ProjectedPin[]>();
  for (const pin of pins) {
    const list = byCountry.get(pin.city.numeric) ?? [];
    list.push(pin);
    byCountry.set(pin.city.numeric, list);
  }

  const clusters: Cluster[] = [];
  for (const group of byCountry.values()) {
    clusters.push(...clusterGroup(group, threshold));
  }
  return clusters;
}

/**
 * Cities in different countries never merge, so at low zoom two country-level
 * pins can land on top of each other and only the top one stays tappable. Nudge
 * any overlapping pins apart until every centre is at least `separationPx` from
 * the next, so each remains individually clickable without changing what merged.
 * Distances only depend on `k` (not pan), so the layout is stable while panning.
 *
 * Each pin stays within `maxShiftPx` of its true position. Without this cap, at
 * far zoom-out a dozen crammed European country-pins would relax into a blob and
 * land on the wrong countries; the cap keeps every pin geographically honest,
 * accepting some residual overlap in the worst crush instead of scattering.
 */
export function separateClusters(
  clusters: Cluster[],
  k: number,
  separationPx: number,
  maxShiftPx: number
): Cluster[] {
  const minDist = separationPx / k;
  const maxShift = maxShiftPx / k;
  const laid = clusters.map((c) => ({ ...c, ox: c.x, oy: c.y }));

  for (let iter = 0; iter < 60; iter++) {
    let moved = false;
    for (let i = 0; i < laid.length; i++) {
      for (let j = i + 1; j < laid.length; j++) {
        const a = laid[i];
        const b = laid[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let dist = Math.hypot(dx, dy);
        if (dist >= minDist) continue;

        if (dist < 1e-6) {
          // Exactly coincident: pick a deterministic direction (golden angle).
          const angle = i * 2.399963;
          dx = Math.cos(angle);
          dy = Math.sin(angle);
          dist = 1;
        }
        const push = (minDist - dist) / 2;
        const ux = dx / dist;
        const uy = dy / dist;
        a.x -= ux * push;
        a.y -= uy * push;
        b.x += ux * push;
        b.y += uy * push;
        clampShift(a, maxShift);
        clampShift(b, maxShift);
        moved = true;
      }
    }
    if (!moved) break;
  }

  return laid.map(({ ox: _ox, oy: _oy, ...c }) => c);
}

/** Pull a pin back so it never strays more than `maxShift` from its origin. */
function clampShift(p: { x: number; y: number; ox: number; oy: number }, maxShift: number): void {
  const dx = p.x - p.ox;
  const dy = p.y - p.oy;
  const dist = Math.hypot(dx, dy);
  if (dist <= maxShift) return;
  const scale = maxShift / dist;
  p.x = p.ox + dx * scale;
  p.y = p.oy + dy * scale;
}

interface WorkingCluster {
  cities: CityView[];
  sumX: number;
  sumY: number;
  x: number;
  y: number;
}

/** Agglomerative centroid-linkage: repeatedly merge the closest pair within threshold. */
function clusterGroup(pins: ProjectedPin[], threshold: number): Cluster[] {
  const clusters: WorkingCluster[] = pins.map((p) => ({
    cities: [p.city],
    sumX: p.x,
    sumY: p.y,
    x: p.x,
    y: p.y
  }));

  while (clusters.length > 1) {
    let bestI = -1;
    let bestJ = -1;
    let bestDist = threshold;
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const dist = Math.hypot(clusters[i].x - clusters[j].x, clusters[i].y - clusters[j].y);
        if (dist < bestDist) {
          bestDist = dist;
          bestI = i;
          bestJ = j;
        }
      }
    }
    if (bestI < 0) break;

    const a = clusters[bestI];
    const b = clusters[bestJ];
    const sumX = a.sumX + b.sumX;
    const sumY = a.sumY + b.sumY;
    const n = a.cities.length + b.cities.length;
    clusters[bestI] = {
      cities: [...a.cities, ...b.cities],
      sumX,
      sumY,
      x: sumX / n,
      y: sumY / n
    };
    clusters.splice(bestJ, 1);
  }

  return clusters.map((c) => ({
    id: c.cities
      .map((city) => city.id)
      .sort()
      .join('+'),
    x: c.x,
    y: c.y,
    cities: c.cities,
    photoCount: c.cities.reduce((sum, city) => sum + city.photos.length, 0)
  }));
}
