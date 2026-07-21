<script lang="ts">
  import { theme } from '$lib/state/theme.svelte';

  const isDark = $derived(theme.value === 'dark');
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

<!-- Sliding switch: a cobalt knob travels a hairline groove, carrying the
     active icon while the destination mode shows faintly on the far side.
     Square knob + track honour the no-pill rule; shared with the landing. -->
<button
  type="button"
  class="theme-toggle"
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
  .theme-toggle {
    --track-w: 3.5rem;
    --track-h: 1.9rem;
    --pad: 0.22rem;
    --knob: calc(var(--track-h) - 2 * var(--pad));
    --travel: calc(var(--track-w) - var(--knob) - 2 * var(--pad));
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
  .hint {
    position: absolute;
    top: 0;
    display: grid;
    place-items: center;
    width: 50%;
    height: 100%;
    color: color-mix(in srgb, var(--color-ink) 40%, transparent);
  }
  .hint.sun {
    left: 0;
  }
  .hint.moon {
    right: 0;
  }
  .hint svg {
    width: 0.95rem;
    height: 0.95rem;
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
  .face {
    grid-area: 1 / 1;
    display: grid;
    place-items: center;
    color: #f4f3ef;
    transition:
      opacity 0.28s ease,
      transform 0.42s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .face svg {
    width: 0.95rem;
    height: 0.95rem;
  }
  .face.moon {
    opacity: 0;
    transform: rotate(-90deg) scale(0.4);
  }
  .theme-toggle[aria-checked='true'] .knob {
    transform: translateX(var(--travel));
  }
  .theme-toggle[aria-checked='true'] .face.sun {
    opacity: 0;
    transform: rotate(90deg) scale(0.4);
  }
  .theme-toggle[aria-checked='true'] .face.moon {
    opacity: 1;
    transform: rotate(0) scale(1);
  }
  @media (prefers-reduced-motion: reduce) {
    .knob,
    .face {
      transition-duration: 0.001ms;
    }
  }
</style>
