<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  import Carousel from '$lib/components/Carousel.svelte';
  import WorldMap from '$lib/map/WorldMap.svelte';
  import { totalCountries } from '$lib/map/world';
  import { buildMapData, computeProgress } from '$lib/state/derive';
  import type { Cluster } from '$lib/state/cluster';

  let { data } = $props();

  const mapData = $derived(buildMapData(data.cities, data.photos));
  const progress = $derived(computeProgress(mapData.conqueredCountryCount, totalCountries));

  let selectedCluster = $state<Cluster | null>(null);

  const title = 'Lightmile World Map';
  const description =
    'Wherever a Lightmile photo lands, the world lights up. Browse the map, tap a city, and watch the club conquer the world.';

  const siteUrl = 'https://worldmap.lightmile.nl/';
  const clubUrl = 'https://lightmile.nl/';
  const socialCard = `${siteUrl}social-card.png`;

  // Escaping `<` keeps the serialised JSON from breaking out of the script element.
  // Mirrors `toJsonLd` in the main site's landing page.
  const toJsonLd = (payload: unknown) => JSON.stringify(payload).replace(/</g, '\\u003c');

  // Declares this site as part of the club's site rather than a standalone brand, so the
  // two domains are read as one entity. Generated from the same constants the page renders.
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: title,
    url: siteUrl,
    description,
    inLanguage: 'en',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Lightmile Run Club',
      url: clubUrl
    },
    publisher: {
      '@type': 'SportsClub',
      name: 'Lightmile Run Club',
      url: clubUrl
    }
  };
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={siteUrl} />

  <!-- Absolute URLs throughout: link-preview scrapers do not resolve relative paths.
       The card is a PNG because Facebook, WhatsApp, LinkedIn, Slack, and X all refuse
       to render an SVG og:image. -->
  <meta property="og:site_name" content="Lightmile Run Club" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={siteUrl} />
  <meta property="og:locale" content="en" />
  <meta property="og:image" content={socialCard} />
  <meta property="og:image:secure_url" content={socialCard} />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Lightmile World Map" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={socialCard} />

  <!-- Interpolated values are escaped by `toJsonLd`, so they cannot break out of the
       script element or drift from what visitors see. -->
  <!-- eslint-disable svelte/no-at-html-tags -->
  {@html `<script type="application/ld+json">${toJsonLd(structuredData)}</` + `script>`}
  <!-- eslint-enable svelte/no-at-html-tags -->
</svelte:head>

<main class="relative h-[100dvh] w-full overflow-hidden">
  <Header />

  <div class="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-20">
    <ThemeToggle />
  </div>

  <WorldMap
    cities={mapData.cities}
    conqueredCountryIds={mapData.conqueredCountryIds}
    onSelectCluster={(cluster) => (selectedCluster = cluster)}
  />

  <ProgressBar {progress} cityCount={mapData.conqueredCityCount} />

  {#if selectedCluster}
    <Carousel cluster={selectedCluster} onClose={() => (selectedCluster = null)} />
  {/if}
</main>
