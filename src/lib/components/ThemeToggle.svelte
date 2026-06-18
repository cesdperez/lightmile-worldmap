<script lang="ts">
  import { theme } from '$lib/state/theme.svelte';

  const isDark = $derived(theme.value === 'dark');
</script>

<button
  type="button"
  class="grid h-10 w-10 place-items-center rounded-full border border-ink/15 bg-paper/90 text-ink shadow-sm backdrop-blur transition-colors hover:bg-paper active:bg-paper-line"
  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
  aria-pressed={isDark}
  onclick={() => theme.toggle()}
>
  {#if isDark}
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
      />
    </svg>
  {:else}
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  {/if}
</button>
