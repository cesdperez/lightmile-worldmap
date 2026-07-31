<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    children: Snippet;
  }

  let { title, children }: Props = $props();
</script>

<details
  class="group pointer-events-auto flex max-h-[calc(100dvh-13rem)] w-[12.5rem] flex-col overflow-y-auto open:w-[calc(100vw-4.5rem)] sm:max-h-[calc(100dvh-12rem)] sm:open:w-80"
>
  <summary
    class="flex cursor-pointer list-none items-center justify-between gap-3 border border-ink/15 bg-paper/85 px-3 py-2 font-mono text-xs uppercase tracking-wide text-ink/70 backdrop-blur transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
  >
    <span class="whitespace-nowrap font-semibold text-ink">{title}</span>
    <svg
      class="size-3 shrink-0 transition-transform duration-200 group-open:rotate-180"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path d="m2.5 4.5 3.5 3.5 3.5-3.5" stroke="currentColor" stroke-width="1.5" />
    </svg>
  </summary>

  {@render children()}
</details>

<style>
  summary::-webkit-details-marker {
    display: none;
  }
</style>
