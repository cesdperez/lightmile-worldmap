<script lang="ts">
  import { select } from 'd3-selection';
  import 'd3-transition';
  import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from 'd3-zoom';
  import { countries, buildProjection } from './world';
  import type { CityView } from '$lib/state/derive';
  import { clusterPins, separateClusters, type Cluster } from '$lib/state/cluster';

  interface Props {
    cities: CityView[];
    conqueredCountryIds: Set<string>;
    onSelectCluster: (cluster: Cluster) => void;
  }

  let { cities, conqueredCountryIds, onSelectCluster }: Props = $props();

  let width = $state(0);
  let height = $state(0);
  let transform = $state<ZoomTransform>(zoomIdentity);
  let svgEl: SVGSVGElement;
  let zoomBehavior: ZoomBehavior<SVGSVGElement, unknown> | undefined;

  const ready = $derived(width > 0 && height > 0);
  const projection = $derived(ready ? buildProjection(width, height) : null);

  const countryPaths = $derived(
    projection
      ? countries.map((c) => ({
          id: c.id,
          name: c.properties.name,
          d: projection.path(c) ?? '',
          conquered: conqueredCountryIds.has(c.id)
        }))
      : []
  );

  const pins = $derived(
    projection
      ? cities
          .map((city) => {
            const point = projection.projection([city.lng, city.lat]);
            return point ? { city, x: point[0], y: point[1] } : null;
          })
          .filter((p): p is { city: CityView; x: number; y: number } => p !== null)
      : []
  );

  // Screen distance under which pins merge into one cluster (see cluster.ts).
  const PIN_MERGE_PX = 34;
  // Min screen gap between rendered pins; > the 22px hit radius so each centre
  // stays individually tappable even where different-country pins collide.
  const PIN_SEPARATION_PX = 26;
  const clusters = $derived(
    separateClusters(clusterPins(pins, transform.k, PIN_MERGE_PX), transform.k, PIN_SEPARATION_PX)
  );

  // Keep pin + border sizes visually constant as the map scales.
  const k = $derived(transform.k);
  const pinStroke = $derived(2 / k);
  const borderWidth = $derived(0.7 / k);

  // Merged pins get a larger dot; size hints at how much is bundled together.
  function pinRadius(count: number) {
    return (7 + Math.min(count - 1, 5) * 2.2) / k;
  }
  // Invisible hit area so pins meet the ~44px mobile tap-target minimum.
  function pinHitRadius(count: number) {
    return Math.max(22 / k, pinRadius(count) * 1.6);
  }

  function clusterLabel(cluster: Cluster) {
    const places = cluster.cities.map((c) => c.name).join(', ');
    const photos = `${cluster.photoCount} photo${cluster.photoCount === 1 ? '' : 's'}`;
    return `${places}: ${photos}. Open carousel.`;
  }

  $effect(() => {
    if (!ready || !svgEl) return;

    const zb = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 100])
      .on('zoom', (event) => {
        transform = event.transform;
      });
    zoomBehavior = zb;

    const selection = select(svgEl);
    selection.call(zb);

    // First-run view: start zoomed on Europe (around Eindhoven).
    const proj = buildProjection(width, height);
    const focus = proj.projection([6, 50]);
    if (focus) {
      const scale = 3.5;
      const initial = zoomIdentity
        .translate(width / 2, height / 2)
        .scale(scale)
        .translate(-focus[0], -focus[1]);
      selection.call(zb.transform, initial);
    }

    return () => {
      selection.on('.zoom', null);
    };
  });

  function zoomBy(factor: number) {
    if (!zoomBehavior || !svgEl) return;
    select(svgEl).transition().duration(250).call(zoomBehavior.scaleBy, factor);
  }
</script>

<div class="relative h-full w-full" bind:clientWidth={width} bind:clientHeight={height}>
  <svg
    bind:this={svgEl}
    {width}
    {height}
    viewBox="0 0 {width} {height}"
    class="block h-full w-full touch-none"
    role="application"
    aria-label="Interactive world map of Lightmile photo locations. Drag to pan, pinch or scroll to zoom."
  >
    <g transform={transform.toString()}>
      {#each countryPaths as country, i (i)}
        <path
          d={country.d}
          fill={country.conquered ? 'var(--color-blue)' : 'var(--color-land)'}
          stroke="var(--color-land-line)"
          stroke-width={borderWidth}
          stroke-linejoin="round"
        >
          <title>{country.name}</title>
        </path>
      {/each}

      {#each clusters as cluster (cluster.id)}
        {@const r = pinRadius(cluster.cities.length)}
        <g
          class="cursor-pointer outline-none"
          role="button"
          tabindex="0"
          aria-label={clusterLabel(cluster)}
          onclick={() => onSelectCluster(cluster)}
          onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectCluster(cluster);
            }
          }}
        >
          <title>{cluster.cities.map((c) => c.name).join(', ')}</title>
          <circle cx={cluster.x} cy={cluster.y} r={pinHitRadius(cluster.cities.length)} fill="transparent" />
          <circle
            cx={cluster.x}
            cy={cluster.y}
            r={r}
            fill="var(--color-ink)"
            stroke="var(--color-paper)"
            stroke-width={pinStroke}
          />
          <circle cx={cluster.x} cy={cluster.y} r={r * 0.4} fill="var(--color-paper)" />
        </g>
      {/each}
    </g>
  </svg>

  <!-- Sits below the theme toggle (top-3 + safe-area inset; see +page.svelte). -->
  <div class="absolute right-3 top-[calc(4rem+env(safe-area-inset-top))] flex flex-col gap-2">
    <button
      type="button"
      class="grid h-10 w-10 place-items-center rounded-full border border-ink/15 bg-paper/90 text-xl font-bold text-ink shadow-sm backdrop-blur transition-colors hover:bg-paper active:bg-paper-line"
      aria-label="Zoom in"
      onclick={() => zoomBy(1.4)}>+</button
    >
    <button
      type="button"
      class="grid h-10 w-10 place-items-center rounded-full border border-ink/15 bg-paper/90 text-xl font-bold text-ink shadow-sm backdrop-blur transition-colors hover:bg-paper active:bg-paper-line"
      aria-label="Zoom out"
      onclick={() => zoomBy(1 / 1.4)}>−</button
    >
  </div>
</div>
