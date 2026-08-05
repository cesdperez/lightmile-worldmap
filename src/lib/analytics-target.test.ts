import { describe, expect, it } from 'vitest';

import { shouldTrack } from './analytics-target';

const KEY = 'phc_realprojectapikey';

describe('shouldTrack', () => {
  it('tracks the production host', () => {
    expect(shouldTrack('worldmap.lightmile.nl', KEY)).toBe(true);
  });

  it('does not track local development', () => {
    expect(shouldTrack('localhost', KEY)).toBe(false);
    expect(shouldTrack('127.0.0.1', KEY)).toBe(false);
  });

  it('does not track Cloudflare preview deployments', () => {
    expect(shouldTrack('lightmile-worldmap.pages.dev', KEY)).toBe(false);
    expect(shouldTrack('abc123.lightmile-worldmap.pages.dev', KEY)).toBe(false);
  });

  it('does not track the main site, which reports under its own site key', () => {
    expect(shouldTrack('lightmile.nl', KEY)).toBe(false);
    expect(shouldTrack('www.lightmile.nl', KEY)).toBe(false);
  });

  it('stays off until a real project key is configured', () => {
    expect(shouldTrack('worldmap.lightmile.nl', '')).toBe(false);
    expect(shouldTrack('worldmap.lightmile.nl', 'REPLACE_ME')).toBe(false);
  });

  it('does not treat a lookalike suffix as production', () => {
    expect(shouldTrack('notworldmap.lightmile.nl', KEY)).toBe(false);
    expect(shouldTrack('worldmap.lightmile.nl.evil.com', KEY)).toBe(false);
  });
});
