import '@testing-library/svelte/vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: () => ({ matches: false })
});
