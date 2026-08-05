<script lang="ts">
  import { onMount } from 'svelte';

  import '../app.css';
  import { initAnalytics } from '$lib/analytics';

  let { children } = $props();

  // onMount only ever runs in the browser, so the prerendered HTML stays free of
  // any analytics call and the module is never evaluated at build time.
  onMount(initAnalytics);
</script>

{@render children()}
