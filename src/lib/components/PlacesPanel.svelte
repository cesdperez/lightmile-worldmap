<script lang="ts">
  import type { ContinentPlace } from '$lib/state/places';

  interface Props {
    continents: ContinentPlace[];
    cityCount: number;
    countryCount: number;
  }

  let { continents, cityCount, countryCount }: Props = $props();
</script>

<!--
  The map is SVG paths and pins, so none of the place names it draws are readable
  by a screen reader, a search engine, or an AI assistant. This is the same data
  as text: a real disclosure a visitor can open, not markup hidden for crawlers.
  Closed by default so it stays out of the way of the map, which is the point of
  the page. Content lives in the DOM either way.
-->
<!--
  Sits below the header on the left. The right padding on narrow screens keeps it
  clear of the theme toggle and the zoom buttons, which share that edge; the max
  height keeps a long list off the progress bar instead of scrolling under it.
-->
<details
  class="pointer-events-auto absolute left-0 top-14 z-10 flex max-h-[calc(100dvh-13rem)] w-full flex-col overflow-y-auto pl-4 pr-[4.5rem] sm:left-4 sm:top-16 sm:max-h-[calc(100dvh-12rem)] sm:w-80 sm:px-0"
>
  <summary
    class="cursor-pointer list-none border border-ink/15 bg-paper/85 px-3 py-2 font-mono text-xs uppercase tracking-wide text-ink/70 backdrop-blur transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
  >
    <span class="font-semibold tabular-nums text-ink">{countryCount}</span>
    {countryCount === 1 ? 'country' : 'countries'},
    <span class="font-semibold tabular-nums text-ink">{cityCount}</span>
    {cityCount === 1 ? 'city' : 'cities'} conquered
  </summary>

  <div class="border border-t-0 border-ink/15 bg-paper/95 p-3 backdrop-blur">
    <h2 class="font-display text-lg font-black uppercase leading-none tracking-tight text-ink">
      Where Lightmile has run
    </h2>
    <p class="mt-2 font-mono text-[0.7rem] uppercase tracking-wide text-ink/60">
      Every city a club photo was taken in
    </p>

    {#each continents as continent (continent.code)}
      <section class="mt-4">
        <h3 class="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-blue">
          {continent.name}
        </h3>
        <ul class="mt-1.5 space-y-1">
          {#each continent.countries as country (country.code)}
            <li class="text-sm leading-snug text-ink">
              <span class="font-semibold">{country.name}</span>
              <span class="text-ink/70">
                {country.cities.map((city) => city.name).join(', ')}
              </span>
            </li>
          {/each}
        </ul>
      </section>
    {/each}
  </div>
</details>

<style>
  /* Safari still paints its own disclosure triangle without this. */
  summary::-webkit-details-marker {
    display: none;
  }
</style>
