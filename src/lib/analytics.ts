import posthog from 'posthog-js';

import { shouldTrack } from './analytics-target';

// PostHog project API keys are write-only and ship in the client bundle by design,
// so this is not a secret. `shouldTrack` is what keeps non-production traffic out.
const PROJECT_KEY = 'phc_xkmbRk2GHk3RjKKDdHPH5Ffs25yfn6sUk49mfHFLpmZX';
const API_HOST = 'https://eu.i.posthog.com';

// One PostHog project serves both lightmile.nl and worldmap.lightmile.nl. Every
// event carries `site` so the two can be told apart in any insight or breakdown.
const SITE = 'worldmap';

export function initAnalytics(): void {
  if (!shouldTrack(window.location.hostname, PROJECT_KEY)) return;

  posthog.init(PROJECT_KEY, {
    api_host: API_HOST,
    defaults: '2026-06-25',
    // No cookies, no local or session storage: visitors are counted via a hash
    // PostHog derives server-side, which is what lets the site run analytics
    // without a consent banner. Requires "cookieless" to be enabled in the
    // PostHog project settings, or every event is dropped on ingest.
    cookieless_mode: 'always',
    // Nothing here needs a persistent identifier or a recording, and each of
    // these would otherwise pull a further script at runtime.
    disable_session_recording: true,
    disable_surveys: true,
    capture_exceptions: false
  });

  posthog.register({ site: SITE });
}
