<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  import PlacesPanel from '$lib/components/PlacesPanel.svelte';
  import Carousel from '$lib/components/Carousel.svelte';
  import WorldMap from '$lib/map/WorldMap.svelte';
  import { totalCountries } from '$lib/map/world';
  import { buildMapData, computeProgress } from '$lib/state/derive';
  import { buildPlaces } from '$lib/state/places';
  import { CLUB_URL, SITE_URL } from '$lib/config';
  import type { Cluster } from '$lib/state/cluster';

  let { data } = $props();

  const mapData = $derived(buildMapData(data.cities, data.photos));
  const progress = $derived(computeProgress(mapData.conqueredCountryCount, totalCountries));
  const continents = $derived(buildPlaces(mapData.cities));
  const runners = $derived(
    [...new Set(data.photos.flatMap((photo) => (photo.author ? [photo.author] : [])))].sort((a, b) =>
      a.localeCompare(b)
    )
  );

  let selectedCluster = $state<Cluster | null>(null);

  const title = 'Lightmile World Map | Every City the Run Club Has Run';
  // The counts come from the data, so the description states what the map holds
  // today rather than a claim that ages. The full country list stays out of it:
  // search engines cut a description around 155 characters.
  const description = $derived(
    `${mapData.conqueredCountryCount} countries and ${mapData.conqueredCityCount} cities lit up by Lightmile Run Club photos, from Eindhoven outwards. Tap a pin for the crew's shots from that city.`
  );
  /** Static twin of `description`, for the JSON-LD and link previews. */
  const shortDescription =
    'Wherever a Lightmile photo lands, the world lights up. Browse the map, tap a city, and watch the club conquer the world.';

  const siteUrl = SITE_URL;
  const clubUrl = CLUB_URL;
  const socialCard = `${siteUrl}social-card.png`;

  // Escaping `<` keeps the serialised JSON from breaking out of the script element.
  // Mirrors `toJsonLd` in the main site's landing page.
  const toJsonLd = (payload: unknown) => JSON.stringify(payload).replace(/</g, '\\u003c');

  // Declares this site as part of the club's site rather than a standalone brand, so the
  // two domains are read as one entity. Generated from the same constants the page renders.
  const webSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Lightmile World Map',
    url: siteUrl,
    description: shortDescription,
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

  // The place names the SVG cannot express. An assistant asked "where has this
  // club run" can answer from this without parsing map geometry.
  const placesList = $derived({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Cities Lightmile Run Club has run in',
    numberOfItems: mapData.conqueredCityCount,
    itemListOrder: 'https://schema.org/ItemListUnordered',
    itemListElement: continents.flatMap((continent) =>
      continent.countries.flatMap((country) =>
        country.cities.map((city) => ({
          '@type': 'ListItem',
          item: {
            '@type': 'Place',
            name: city.name,
            address: {
              '@type': 'PostalAddress',
              addressLocality: city.name,
              addressCountry: country.code
            },
            geo: {
              '@type': 'GeoCoordinates',
              latitude: city.lat,
              longitude: city.lng
            }
          }
        }))
      )
    )
  });
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
  <meta property="og:description" content={shortDescription} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={siteUrl} />
  <meta property="og:locale" content="en_NL" />
  <meta property="og:image" content={socialCard} />
  <meta property="og:image:secure_url" content={socialCard} />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Lightmile World Map" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={shortDescription} />
  <meta name="twitter:image" content={socialCard} />

  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <!-- The place list as plain text, generated from the same data the map draws. -->
  <link rel="alternate" type="text/plain" href="/llms.txt" title="llms.txt" />

  <!-- Interpolated values are escaped by `toJsonLd`, so they cannot break out of the
       script element or drift from what visitors see. -->
  <!-- eslint-disable svelte/no-at-html-tags -->
  {@html `<script type="application/ld+json">${toJsonLd(webSite)}</` + `script>`}
  {@html `<script type="application/ld+json">${toJsonLd(placesList)}</` + `script>`}
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

  <PlacesPanel
    {continents}
    {runners}
  />

  <ProgressBar {progress} cityCount={mapData.conqueredCityCount} />

  {#if selectedCluster}
    <!-- Keyed so a different cluster starts at its first photo instead of a stale index. -->
    {#key selectedCluster.id}
      <Carousel cluster={selectedCluster} onClose={() => (selectedCluster = null)} />
    {/key}
  {/if}
</main>
