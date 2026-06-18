<script lang="ts">
  import type { Progress } from '$lib/state/derive';

  interface Props {
    progress: Progress;
    cityCount: number;
  }

  let { progress, cityCount }: Props = $props();

  const pct = $derived(Math.round(progress.fraction * 100));
  const countryLabel = $derived(progress.conquered === 1 ? 'country' : 'countries');
  const cityLabel = $derived(cityCount === 1 ? 'city' : 'cities');
</script>

<div
  class="absolute inset-x-0 bottom-0 z-10 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-80 sm:rounded-2xl sm:border sm:border-ink/10 sm:bg-paper/85 sm:p-4 sm:shadow-lg sm:backdrop-blur"
>
  <div class="rounded-xl bg-paper/85 p-3 shadow-md backdrop-blur sm:bg-transparent sm:p-0 sm:shadow-none">
    <div class="flex items-baseline justify-between">
      <span class="font-display text-xl tracking-wide text-ink">CONQUER THE WORLD</span>
      <span class="text-sm font-semibold text-blue">{pct}%</span>
    </div>

    <div
      class="mt-2 h-3 w-full overflow-hidden rounded-full bg-paper-line"
      role="progressbar"
      aria-valuenow={progress.conquered}
      aria-valuemin={0}
      aria-valuemax={progress.total}
      aria-label="World conquered: {progress.conquered} of {progress.total} countries"
    >
      <div class="h-full rounded-full bg-blue transition-[width] duration-500" style="width: {progress.fraction * 100}%"></div>
    </div>

    <p class="mt-2 text-sm text-ink/70">
      <span class="font-semibold text-ink">{progress.conquered}/{progress.total}</span>
      {countryLabel}
      ·
      <span class="font-semibold text-ink">{cityCount}</span>
      {cityLabel}
    </p>
  </div>
</div>
