<script lang="ts">
  import { select } from 'd3-selection';
  import 'd3-transition';
  import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from 'd3-zoom';
  import { countries, buildProjection } from './world';
  import type { CityView } from '$lib/state/derive';
  import { buildClusters, type Cluster } from '$lib/state/cluster';

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

  // Below this zoom, dots merge by continent into one marker per continent so a
  // fully zoomed-out map shows a handful of regional dots, not a European knot.
  const CONTINENT_ZOOM_MAX = 2;
  // Screen distance under which pins merge into one cluster (see cluster.ts).
  const PIN_MERGE_PX = 34;
  // Min screen gap between rendered pins; > the 22px hit radius so each centre
  // stays individually tappable even where different-country pins collide.
  const PIN_SEPARATION_PX = 26;
  // Cap on how far a pin may be nudged from its true spot, so far zoom-out never
  // scatters crammed pins onto the wrong countries (see separateClusters).
  const PIN_MAX_SHIFT_PX = 14;
  const clusters = $derived(
    buildClusters(pins, transform.k, {
      continentZoomMax: CONTINENT_ZOOM_MAX,
      mergePx: PIN_MERGE_PX,
      separationPx: PIN_SEPARATION_PX,
      maxShiftPx: PIN_MAX_SHIFT_PX
    })
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
    const photos = `${cluster.photoCount} photo${cluster.photoCount === 1 ? '' : 's'}`;
    if (cluster.tier === 'continent') {
      const cityCount = cluster.cities.length;
      const places = `${cityCount} ${cityCount === 1 ? 'city' : 'cities'}`;
      return `${cluster.name}: ${photos} across ${places}. Zoom in.`;
    }
    const places = cluster.cities.map((c) => c.name).join(', ');
    return `${places}: ${photos}. Open carousel.`;
  }

  function onClusterActivate(cluster: Cluster) {
    if (cluster.tier === 'continent') {
      zoomToCities(cluster.cities);
    } else {
      onSelectCluster(cluster);
    }
  }

  // Animate the viewport to fit a set of cities, revealing the finer place tier.
  function zoomToCities(regionCities: CityView[]) {
    if (!projection || !zoomBehavior || !svgEl) return;
    const pts = regionCities
      .map((c) => projection.projection([c.lng, c.lat]))
      .filter((p): p is [number, number] => p !== null);
    if (pts.length === 0) return;

    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    // Smaller inset on narrow screens so a fitted region isn't dwarfed by margin.
    const pad = Math.min(80, width * 0.12);
    const spanX = Math.max(maxX - minX, 1);
    const spanY = Math.max(maxY - minY, 1);
    const fit = Math.min((width - pad * 2) / spanX, (height - pad * 2) / spanY);
    // Clamp above the continent threshold so we always land on the place tier,
    // and below a ceiling so a single-city region doesn't rocket to max zoom.
    const scale = Math.max(CONTINENT_ZOOM_MAX + 0.5, Math.min(fit, 12));
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    const target = zoomIdentity
      .translate(width / 2, height / 2)
      .scale(scale)
      .translate(-cx, -cy);
    select(svgEl).transition().duration(600).call(zoomBehavior.transform, target);
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
          onclick={() => onClusterActivate(cluster)}
          onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClusterActivate(cluster);
            }
          }}
        >
          <title
            >{cluster.tier === 'continent'
              ? cluster.name
              : cluster.cities.map((c) => c.name).join(', ')}</title
          >
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

  <!-- Sits below the vertical theme toggle (top 0.75rem + 4.75rem tall + 2px
       border ≈ 5.625rem bottom; see ThemeToggle.svelte + +page.svelte), with a
       ~0.625rem gap between the two control groups. -->
  <div class="absolute right-3 top-[calc(6.25rem+env(safe-area-inset-top))] flex flex-col gap-2">
    <button
      type="button"
      class="grid h-10 w-10 place-items-center border border-ink/15 bg-paper/90 text-xl font-bold text-ink backdrop-blur transition-colors hover:bg-paper active:bg-paper-line"
      aria-label="Zoom in"
      onclick={() => zoomBy(1.4)}>+</button
    >
    <button
      type="button"
      class="grid h-10 w-10 place-items-center border border-ink/15 bg-paper/90 text-xl font-bold text-ink backdrop-blur transition-colors hover:bg-paper active:bg-paper-line"
      aria-label="Zoom out"
      onclick={() => zoomBy(1 / 1.4)}>−</button
    >
  </div>
</div>
