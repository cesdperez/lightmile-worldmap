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
  class="absolute inset-x-0 bottom-0 z-10 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-80 sm:border sm:border-ink/15 sm:bg-paper/85 sm:p-4 sm:backdrop-blur"
>
  <div class="border border-ink/15 bg-paper/85 p-3 backdrop-blur sm:border-0 sm:bg-transparent sm:p-0">
    <div class="flex items-baseline justify-between gap-3">
      <span class="font-display text-xl font-black uppercase leading-none tracking-tight text-ink"
        >Conquer the world</span
      >
      <span class="font-mono text-sm font-semibold tabular-nums text-blue">{pct}%</span>
    </div>

    <div
      class="mt-3 h-2 w-full overflow-hidden bg-paper-line"
      role="progressbar"
      aria-valuenow={progress.conquered}
      aria-valuemin={0}
      aria-valuemax={progress.total}
      aria-label="World conquered: {progress.conquered} of {progress.total} countries"
    >
      <div class="h-full bg-blue transition-[width] duration-500" style="width: {progress.fraction * 100}%"></div>
    </div>

    <p class="mt-2.5 font-mono text-xs uppercase tracking-wide text-ink/70">
      <span class="font-semibold tabular-nums text-ink">{progress.conquered}/{progress.total}</span>
      {countryLabel}
      ·
      <span class="font-semibold tabular-nums text-ink">{cityCount}</span>
      {cityLabel}
    </p>
  </div>
</div>
