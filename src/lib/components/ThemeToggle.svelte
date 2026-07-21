<script lang="ts">
  import { onMount } from 'svelte';
  import { theme } from '$lib/state/theme.svelte';

  const isDark = $derived(theme.value === 'dark');

  // SSR renders the switch in its light position, but the pre-paint script in
  // app.html may have already applied dark; hold the knob transition off until
  // mount so a dark-mode load starts settled instead of sliding on hydration.
  let toggleReady = $state(false);
  onMount(() => {
    toggleReady = true;
  });
</script>

{#snippet sunIcon()}
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" />
    <path
      d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
    />
  </svg>
{/snippet}

{#snippet moonIcon()}
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
{/snippet}

<!-- Vertical sliding switch: a square cobalt knob travels a hairline groove
     (sun on top, moon at the bottom), sized to sit atop the +/- zoom column as
     one aligned control. Shares the landing switch's mechanics, turned 90deg. -->
<button
  type="button"
  class="theme-toggle"
  class:no-anim={!toggleReady}
  role="switch"
  aria-label="Dark mode"
  aria-checked={isDark}
  onclick={() => theme.toggle()}
>
  <span class="hint sun" aria-hidden="true">{@render sunIcon()}</span>
  <span class="hint moon" aria-hidden="true">{@render moonIcon()}</span>
  <span class="knob" aria-hidden="true">
    <span class="face sun">{@render sunIcon()}</span>
    <span class="face moon">{@render moonIcon()}</span>
  </span>
</button>

<style>
  /* content-box so --track-w/-h are the inner size the geometry is derived from;
     the 1px border then sits outside and can't skew the knob. */
  .theme-toggle {
    --track-w: calc(2.5rem - 2px); /* 40px outer incl. border, matches zoom */
    --pad: 0.25rem;
    --knob: calc(var(--track-w) - 2 * var(--pad));
    /* two square cells stacked: each state sits centred in its own half so the
       knob never crosses the midline. */
    --track-h: calc(2 * (var(--knob) + 2 * var(--pad)));
    --travel: calc(var(--track-h) - var(--knob) - 2 * var(--pad));
    box-sizing: content-box;
    position: relative;
    width: var(--track-w);
    height: var(--track-h);
    padding: 0;
    border: 1px solid color-mix(in srgb, var(--color-ink) 15%, transparent);
    background: color-mix(in srgb, var(--color-paper) 82%, transparent);
    backdrop-filter: blur(6px);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .theme-toggle:hover {
    border-color: color-mix(in srgb, var(--color-ink) 40%, transparent);
  }
  .theme-toggle:focus-visible {
    outline: 2px solid var(--color-blue);
    outline-offset: 2px;
  }
  /* Each hint sits in the exact footprint the knob rests on, so the faint
     destination icon and the knob's active icon share one grid. */
  .hint {
    position: absolute;
    left: var(--pad);
    display: grid;
    place-items: center;
    width: var(--knob);
    height: var(--knob);
    color: color-mix(in srgb, var(--color-ink) 40%, transparent);
  }
  .hint.sun {
    top: var(--pad);
  }
  .hint.moon {
    top: calc(var(--pad) + var(--travel));
  }
  .hint svg {
    width: 1.05rem;
    height: 1.05rem;
  }
  .knob {
    position: absolute;
    top: var(--pad);
    left: var(--pad);
    display: grid;
    width: var(--knob);
    height: var(--knob);
    background: var(--color-blue);
    transition: transform 0.42s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  /* --color-paper flips opposite the knob's blue, so the icon stays legible in
     both themes (white on the deep day blue, ink on the lifted night blue). */
  .face {
    grid-area: 1 / 1;
    display: grid;
    place-items: center;
    color: var(--color-paper);
    transition:
      opacity 0.28s ease,
      transform 0.42s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .face svg {
    width: 1.05rem;
    height: 1.05rem;
  }
  .face.moon {
    opacity: 0;
    transform: rotate(-90deg) scale(0.4);
  }
  .theme-toggle[aria-checked='true'] .knob {
    transform: translateY(var(--travel));
  }
  .theme-toggle[aria-checked='true'] .face.sun {
    opacity: 0;
    transform: rotate(90deg) scale(0.4);
  }
  .theme-toggle[aria-checked='true'] .face.moon {
    opacity: 1;
    transform: rotate(0) scale(1);
  }
  /* Suppress the slide until hydration settles the knob in its real position. */
  .theme-toggle.no-anim .knob,
  .theme-toggle.no-anim .face {
    transition: none;
  }
  @media (prefers-reduced-motion: reduce) {
    .knob,
    .face {
      transition-duration: 0.001ms;
    }
  }
</style>
