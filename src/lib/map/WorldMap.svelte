<script lang="ts">
  import { select } from 'd3-selection';
  import 'd3-transition';
  import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from 'd3-zoom';
  import { countries, buildProjection } from './world';
  import type { CityView } from '$lib/state/derive';

  interface Props {
    cities: CityView[];
    conqueredCountryIds: Set<string>;
    onSelectCity: (city: CityView) => void;
  }

  let { cities, conqueredCountryIds, onSelectCity }: Props = $props();

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

  // Keep pin + border sizes visually constant as the map scales.
  const k = $derived(transform.k);
  const pinRadius = $derived(7 / k);
  const pinStroke = $derived(2 / k);
  const borderWidth = $derived(0.7 / k);

  $effect(() => {
    if (!ready || !svgEl) return;

    const zb = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 14])
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

      {#each pins as pin (pin.city.id)}
        <g
          class="cursor-pointer outline-none"
          role="button"
          tabindex="0"
          aria-label="{pin.city.name}: {pin.city.photos.length} photo{pin.city.photos.length === 1
            ? ''
            : 's'}. Open carousel."
          onclick={() => onSelectCity(pin.city)}
          onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectCity(pin.city);
            }
          }}
        >
          <circle
            cx={pin.x}
            cy={pin.y}
            r={pinRadius}
            fill="var(--color-blue)"
            stroke="var(--color-paper)"
            stroke-width={pinStroke}
          />
          <circle cx={pin.x} cy={pin.y} r={pinRadius * 0.4} fill="var(--color-paper)" />
        </g>
      {/each}
    </g>
  </svg>

  <!-- top-16 leaves room for the theme toggle, which sits at top-3 (see +page.svelte). -->
  <div class="absolute right-3 top-16 flex flex-col gap-2">
    <button
      type="button"
      class="grid h-10 w-10 place-items-center rounded-full border border-ink/15 bg-paper/90 text-xl font-bold text-ink shadow-sm backdrop-blur transition-colors hover:bg-paper active:bg-paper-line"
      aria-label="Zoom in"
      onclick={() => zoomBy(1.6)}>+</button
    >
    <button
      type="button"
      class="grid h-10 w-10 place-items-center rounded-full border border-ink/15 bg-paper/90 text-xl font-bold text-ink shadow-sm backdrop-blur transition-colors hover:bg-paper active:bg-paper-line"
      aria-label="Zoom out"
      onclick={() => zoomBy(1 / 1.6)}>−</button
    >
  </div>
</div>
