# Server and Hybrid Rendering

Angular applications can combine server-side rendering (SSR), build-time prerendering (SSG), and client-side rendering (CSR) on a per-route basis. Use server routes to control how each route renders and keep application code compatible with server rendering and hydration.

## Server routes

Choose CSR, prerendering, or SSR for each route with `ServerRoute`:

```ts
import {inject} from '@angular/core';
import {PrerenderFallback, RenderMode, ServerRoute} from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'account',
    renderMode: RenderMode.Client,
  },
  {
    path: 'products/:id',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Server,
    async getPrerenderParams() {
      const catalog = inject(ProductCatalog);
      const ids = await catalog.getProductIds();

      return ids.map((id) => ({id: String(id)}));
    },
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
```

Keep the existing `provideServerRendering(withRoutes(serverRoutes))` wiring in the server application configuration.

Follow these rules:

- Put specific paths before the `**` fallback.
- Keep client router paths and server route paths aligned.
- Use `RenderMode.Prerender` only when the required data is available at build time.
- Call `inject()` before the first `await` in `getPrerenderParams`.
- Return string values with keys that exactly match each route parameter.
- Choose `PrerenderFallback.Server`, `Client`, or `None` for paths not generated at build time. The default is `Server`.
- Set static `headers` on server routes. Set `status` on client or server routes; prerender routes do not accept a status.

## Hydration

Keep `provideClientHydration()` in configuration shared by the browser and server bootstraps.

For Angular 22 and newer, `provideClientHydration()` enables incremental hydration and event replay by default. Do not add the deprecated `withIncrementalHydration()`. Use `withNoIncrementalHydration()` only for a deliberate opt-out.

Add a hydrate trigger to an `@defer` block when its server-rendered content should remain dehydrated until needed:

```html
@defer (on viewport; hydrate on interaction) {
<product-reviews />
} @placeholder {
<div class="reviews-placeholder"></div>
}
```

The hydrate trigger controls the initial server-rendered page; the regular `on viewport` trigger controls later client-side renders.

Keep the server and browser DOM identical:

- Do not conditionally render different templates with `isPlatformBrowser`.
- Avoid direct DOM insertion, removal, or movement.
- Keep HTML valid. Leave `preserveWhitespaces` at its default `false`; if set, keep browser and server configurations consistent.
- Use `ngSkipHydration` on a component host only as a temporary last resort because Angular rerenders the entire component subtree.

## Server-compatible code

Do not access browser-only APIs, such as DOM, storage, or layout APIs, while rendering on the
server.

Prefer:

- `afterNextRender`, `afterEveryRender`, or `afterRenderEffect` for browser-only work.
- The `DOCUMENT` injection token instead of the global `document`.
- Separate browser and server providers behind one application-owned token.
- Angular rendering APIs instead of manual DOM manipulation.

Do not store request-specific values in module-level variables or top-level `useValue` providers because those values can persist across requests. Create request-specific values with a factory.

## Request data and transfer cache

Use the request tokens from `@angular/core`:

- `REQUEST` for the Web API `Request`.
- `RESPONSE_INIT` for dynamic response status and headers.
- `REQUEST_CONTEXT` for adapter-provided context.

Treat these tokens as nullable. They are `null` during CSR, SSG, builds, and route extraction.

In current Angular versions, keep the HTTP transfer-cache defaults. Exclude user-specific requests with `withHttpTransferCacheOptions({filter})` or `transferCache: false`. Do not opt authenticated, credentialed, private, non-cacheable, or `Set-Cookie` responses into the cache without reviewing the data-leak risk. Verify the defaults before relying on them in older Angular versions.

Use `PendingTasks` or `pendingUntilEvent()` when custom asynchronous work must finish before Angular serializes the response.

Keep an explicit production `allowedHosts` list. Do not use a wildcard or enable `trustProxyHeaders` unless a trusted proxy validates and replaces forwarded headers.
