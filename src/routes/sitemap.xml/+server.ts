import { buildSitemap } from '$lib/state/agent-docs';
import type { RequestHandler } from './$types';

export const prerender = true;

// Generated so `lastmod` is the deploy date rather than a hand-edited value.
export const GET: RequestHandler = () => {
  return new Response(buildSitemap(new Date()), {
    headers: { 'content-type': 'application/xml; charset=utf-8' }
  });
};
