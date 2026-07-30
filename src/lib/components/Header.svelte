<header
  class="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center gap-2 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]"
>
  <!-- The wordmark is the way back to the club's main site. External domain, not a route. -->
  <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
  <a
    href="https://lightmile.nl/"
    aria-label="Lightmile Run Club home"
    title="Lightmile Run Club"
    class="pointer-events-auto rounded-sm transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue"
  >
    <span
      role="img"
      aria-label="Lightmile"
      class="block h-7 select-none bg-blue dark:bg-white"
      style="aspect-ratio: 2115.586123 / 298.435684;
             -webkit-mask: url('/logos/lightmile.svg') no-repeat center / contain;
             mask: url('/logos/lightmile.svg') no-repeat center / contain;"
    ></span>
  </a>
  <span
    class="pointer-events-auto mt-1 hidden whitespace-nowrap font-mono text-xs uppercase tracking-[0.14em] text-ink/70 sm:inline"
  >
    World Map
  </span>
  <!-- Eindhoven coordinate, echoes the landing page's wayfinding tick. -->
  <span
    class="pointer-events-auto mt-1 hidden whitespace-nowrap font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink/60 md:inline"
  >
    51.44°N 5.48°E
  </span>
</header>
