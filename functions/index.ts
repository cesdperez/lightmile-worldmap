function prefersMarkdown(request: Request) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false;
  const preferences = new Map<string, number>();
  for (const entry of (request.headers.get('Accept') ?? '').split(',')) {
    const [type, ...parameters] = entry
      .toLowerCase()
      .split(';')
      .map((part) => part.trim());
    const weight = parameters.find((part) => /^q\s*=/.test(part));
    const quality = weight === undefined ? 1 : Number(weight.slice(weight.indexOf('=') + 1));
    if (type && quality >= 0 && quality <= 1) {
      preferences.set(type, Math.max(preferences.get(type) ?? 0, quality));
    }
  }
  const markdown = preferences.get('text/markdown') ?? 0;
  const html =
    preferences.get('text/html') ?? preferences.get('text/*') ?? preferences.get('*/*') ?? 0;
  return markdown > 0 && markdown >= html;
}

async function negotiateMarkdown(
  request: Request,
  html: Response,
  loadMarkdown: () => Promise<Response>
): Promise<Response> {
  if (html.status !== 200 && html.status !== 304) return html;
  const headers = new Headers(html.headers);
  headers.set('Content-Signal', 'ai-train=no, search=yes, ai-input=yes');
  headers.append('Vary', 'Accept');
  if (prefersMarkdown(request)) {
    const markdown = await loadMarkdown();
    if (markdown.ok && !markdown.headers.get('Content-Type')?.startsWith('text/html')) {
      for (const header of [
        'Content-Length',
        'Content-Encoding',
        'ETag',
        'Last-Modified',
        'Link'
      ]) {
        headers.delete(header);
      }
      headers.set('Content-Type', 'text/markdown; charset=utf-8');
      headers.set('Cache-Control', 'no-store');
      void html.body?.cancel();
      return new Response(markdown.body, { headers });
    }
    void markdown.body?.cancel();
  }
  return new Response(html.body, { status: html.status, headers });
}

export async function onRequest({
  request,
  next,
  env
}: {
  request: Request;
  next: () => Promise<Response>;
  env: { ASSETS: { fetch: (request: Request) => Promise<Response> } };
}): Promise<Response> {
  const html = await next();
  return negotiateMarkdown(request, html, () =>
    env.ASSETS.fetch(new Request(new URL('/llms.txt', request.url), { method: request.method }))
  );
}
