<script lang="ts">
  import type { ContinentPlace } from '$lib/state/places';

  interface Props {
    continents: ContinentPlace[];
    runners: string[];
  }

  let { continents, runners }: Props = $props();
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
<div class="pointer-events-none absolute left-4 top-14 z-10 flex flex-col items-start gap-2 sm:top-16">
  <details
    class="group pointer-events-auto flex max-h-[calc(100dvh-13rem)] w-[12.5rem] flex-col overflow-y-auto open:w-[calc(100vw-4.5rem)] sm:max-h-[calc(100dvh-12rem)] sm:open:w-80"
  >
    <summary
      class="flex cursor-pointer list-none items-center justify-between gap-3 border border-ink/15 bg-paper/85 px-3 py-2 font-mono text-xs uppercase tracking-wide text-ink/70 backdrop-blur transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
    >
      <span class="whitespace-nowrap font-semibold text-ink">Visited places</span>
      <svg
        class="size-3 shrink-0 transition-transform duration-200 group-open:rotate-180"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
      >
        <path d="m2.5 4.5 3.5 3.5 3.5-3.5" stroke="currentColor" stroke-width="1.5" />
      </svg>
    </summary>

    <div class="border border-t-0 border-ink/15 bg-paper/95 p-3 backdrop-blur">
      <h2 class="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-blue">By continent</h2>

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

  <details
    class="group pointer-events-auto flex max-h-[calc(100dvh-13rem)] w-[12.5rem] flex-col overflow-y-auto open:w-[calc(100vw-4.5rem)] sm:max-h-[calc(100dvh-12rem)] sm:open:w-80"
  >
    <summary
      class="flex cursor-pointer list-none items-center justify-between gap-3 border border-ink/15 bg-paper/85 px-3 py-2 font-mono text-xs uppercase tracking-wide text-ink/70 backdrop-blur transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
    >
      <span class="font-semibold text-ink">Runners</span>
      <svg
        class="size-3 shrink-0 transition-transform duration-200 group-open:rotate-180"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
      >
        <path d="m2.5 4.5 3.5 3.5 3.5-3.5" stroke="currentColor" stroke-width="1.5" />
      </svg>
    </summary>

    <div class="border border-t-0 border-ink/15 bg-paper/95 p-3 backdrop-blur">
      <h2 class="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-blue">Photo contributors</h2>
      <ul class="mt-3 space-y-1">
        {#each runners as runner (runner)}
          <li class="text-sm leading-snug text-ink">{runner}</li>
        {/each}
      </ul>
    </div>
  </details>
</div>

<style>
  /* Safari still paints its own disclosure triangle without this. */
  summary::-webkit-details-marker {
    display: none;
  }
</style>
