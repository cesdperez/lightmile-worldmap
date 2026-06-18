<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  import Carousel from '$lib/components/Carousel.svelte';
  import WorldMap from '$lib/map/WorldMap.svelte';
  import { totalCountries } from '$lib/map/world';
  import { buildMapData, computeProgress, type CityView } from '$lib/state/derive';

  let { data } = $props();

  const mapData = $derived(buildMapData(data.cities, data.photos));
  const progress = $derived(computeProgress(mapData.conqueredCountryCount, totalCountries));

  let selectedCity = $state<CityView | null>(null);

  const title = 'Lightmile World Map';
  const description =
    'Wherever a Lightmile photo lands, the world lights up. Browse the map, tap a city, and watch the club conquer the world.';
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="/og-image.svg" />
  <meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<main class="relative h-[100dvh] w-full overflow-hidden">
  <Header />

  <div class="absolute right-3 top-3 z-20">
    <ThemeToggle />
  </div>

  <WorldMap
    cities={mapData.cities}
    conqueredCountryIds={mapData.conqueredCountryIds}
    onSelectCity={(city) => (selectedCity = city)}
  />

  <ProgressBar {progress} cityCount={mapData.conqueredCityCount} />

  {#if selectedCity}
    <Carousel city={selectedCity} onClose={() => (selectedCity = null)} />
  {/if}
</main>
