<script lang="ts">
  import { PHOTOS_BASE_URL } from '$lib/config';
  import type { Cluster } from '$lib/state/cluster';

  interface Props {
    cluster: Cluster;
    onClose: () => void;
  }

  let { cluster, onClose }: Props = $props();

  let index = $state(0);
  let dialogEl = $state<HTMLElement | null>(null);
  let touchStartX = 0;

  // Photos across all merged cities, kept grouped by city.
  const items = $derived(
    cluster.cities.flatMap((c) => c.photos.map((photo) => ({ photo, cityName: c.name })))
  );
  const count = $derived(items.length);
  const photo = $derived(items[index].photo);
  const cityName = $derived(items[index].cityName);

  // Pagination dots grouped by city, so a merged cluster reads as distinct places.
  const cityGroups = $derived(
    (() => {
      let start = 0;
      return cluster.cities.map((c) => {
        const indices = c.photos.map((_, j) => start + j);
        start += c.photos.length;
        return { name: c.name, indices };
      });
    })()
  );

  function go(delta: number) {
    index = (index + delta + count) % count;
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onClose();
    } else if (event.key === 'ArrowRight') {
      go(1);
    } else if (event.key === 'ArrowLeft') {
      go(-1);
    } else if (event.key === 'Tab') {
      trapFocus(event);
    }
  }

  function trapFocus(event: KeyboardEvent) {
    if (!dialogEl) return;
    const focusable = dialogEl.querySelectorAll<HTMLElement>(
      'button, [href], [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function onTouchStart(event: TouchEvent) {
    touchStartX = event.changedTouches[0].clientX;
  }

  function onTouchEnd(event: TouchEvent) {
    const dx = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  }

  $effect(() => {
    dialogEl?.focus();
  });
</script>

<svelte:window onkeydown={onKeydown} />

<!-- Backdrop: click outside closes -->
<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
  role="presentation"
  onclick={(e) => {
    if (e.target === e.currentTarget) onClose();
  }}
>
  <div
    bind:this={dialogEl}
    class="flex max-h-[92vh] w-full flex-col overflow-hidden border border-ink/15 bg-paper outline-none sm:max-h-[88vh] sm:max-w-lg"
    role="dialog"
    aria-modal="true"
    aria-label="Photos from {cluster.cities.map((c) => c.name).join(', ')}"
    tabindex="-1"
  >
    <header class="flex items-center justify-between gap-3 px-5 py-4">
      <div class="flex min-w-0 items-baseline gap-3">
        <h2 class="truncate font-display text-2xl font-black uppercase leading-none tracking-tight text-ink">
          {cityName}
        </h2>
        {#if count > 1}
          <span class="shrink-0 font-mono text-sm tabular-nums text-ink/60">{index + 1} / {count}</span>
        {/if}
      </div>
      <button
        type="button"
        class="-mr-1.5 grid h-9 w-9 shrink-0 place-items-center text-2xl leading-none text-ink/60 transition-colors hover:bg-paper-line hover:text-ink"
        aria-label="Close"
        onclick={onClose}>×</button
      >
    </header>

    <div
      class="relative flex min-h-0 flex-1 items-center justify-center bg-paper"
      role="group"
      aria-label="Photo viewer. Swipe left or right to navigate."
      ontouchstart={onTouchStart}
      ontouchend={onTouchEnd}
    >
      <img
        src="{PHOTOS_BASE_URL}/{photo.src}"
        alt={photo.note ?? (photo.author ? `Lightmile photo in ${cityName} by ${photo.author}` : `Lightmile photo in ${cityName}`)}
        loading="lazy"
        class="max-h-[60vh] w-full object-contain"
      />

      {#if count > 1}
        <button
          type="button"
          class="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center border border-ink/15 bg-paper/80 text-xl text-ink backdrop-blur-sm transition-colors hover:bg-paper"
          aria-label="Previous photo"
          onclick={() => go(-1)}>‹</button
        >
        <button
          type="button"
          class="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center border border-ink/15 bg-paper/80 text-xl text-ink backdrop-blur-sm transition-colors hover:bg-paper"
          aria-label="Next photo"
          onclick={() => go(1)}>›</button
        >
      {/if}
    </div>

    <footer class="px-5 py-4">
      <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        {#if photo.author}
          <span class="border border-ink/25 px-2 py-0.5 font-mono text-xs uppercase tracking-wide text-ink"
            >{photo.author}</span
          >
        {/if}
        {#if photo.date}
          <span class="font-mono text-xs tabular-nums text-ink/60">{photo.date}</span>
        {/if}
      </div>
      {#if photo.note}
        <p class="mt-2.5 text-sm leading-relaxed text-ink/80">{photo.note}</p>
      {/if}

      {#if count > 1}
        <div class="mt-4 flex flex-wrap justify-center gap-x-3 gap-y-2" role="tablist" aria-label="Choose photo">
          {#each cityGroups as group (group.name)}
            <div class="flex gap-1.5">
              {#each group.indices as i (i)}
                <button
                  type="button"
                  class="h-1.5 transition-all {i === index
                    ? 'w-6 bg-blue'
                    : 'w-2 bg-ink/25 hover:bg-ink/40'}"
                  role="tab"
                  aria-selected={i === index}
                  aria-label="Go to photo {i + 1} ({group.name})"
                  onclick={() => (index = i)}
                ></button>
              {/each}
            </div>
          {/each}
        </div>
      {/if}
    </footer>
  </div>
</div>
