<script lang="ts">
  import Disclosure from '$lib/components/Disclosure.svelte';
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
   Sits below the header on small screens. On desktop it becomes part of the
   header menu, beside the wordmark. The max height keeps a long list off the
   progress bar instead of scrolling under it.
-->
<div class="pointer-events-none absolute left-4 top-14 z-10 flex flex-col items-start gap-2 sm:top-16 lg:left-[28rem] lg:top-[max(0.75rem,env(safe-area-inset-top))] lg:flex-row">
  <Disclosure title="Visited places">
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
  </Disclosure>

  <Disclosure title="Runners">
    <div class="border border-t-0 border-ink/15 bg-paper/95 p-3 backdrop-blur">
      <h2 class="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-blue">Photo contributors</h2>
      <ul class="mt-3 space-y-1">
        {#each runners as runner (runner)}
          <li class="text-sm leading-snug text-ink">{runner}</li>
        {/each}
      </ul>
    </div>
  </Disclosure>
</div>
