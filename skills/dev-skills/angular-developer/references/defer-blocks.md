# Defer Blocks

`@defer` is Angular's primary mechanism for deferring the loading and rendering of template sections until a condition is met. Its main use is lazy-loading below-fold content to reduce initial bundle size, defer parsing cost, and enable incremental hydration in SSR apps.

## Basic Structure

```html
@defer (on viewport) {
  <heavy-chart />
} @placeholder {
  <div class="chart-skeleton" style="height: 300px"></div>
} @loading (minimum 200ms) {
  <div class="chart-spinner"></div>
} @error {
  <p>Failed to load chart.</p>
}
```

Every `@defer` block should include a `@placeholder`. Omitting it causes the space to collapse and reappear on load, causing CLS.

## Triggers

| Trigger | When the block loads |
|---|---|
| `on viewport` | Element enters the viewport (supports Intersection Observer options from v21: `rootMargin`, `threshold`) |
| `on idle` | Browser is idle (`requestIdleCallback`); accepts `timeout` to cap the wait (v22+) |
| `on interaction` | User clicks or focuses the placeholder |
| `on timer(2s)` | After a fixed delay |
| `on immediate` | Immediately after rendering (still lazy — defers from initial bundle) |
| `when <expr>` | When a boolean expression becomes truthy |

Multiple triggers can be combined:

```html
@defer (on viewport; on timer(5s)) {
  <newsletter-signup />
}
```

## `@placeholder` Block

Renders immediately in place of the deferred content. Must match the expected layout size to prevent CLS.

- Accepts `minimum` to keep it visible for a minimum duration (avoids flash):

```html
@placeholder (minimum 500ms) {
  <div class="skeleton" style="height: 200px; width: 100%"></div>
}
```

## `@loading` Block

Renders while the deferred chunk is downloading. Accepts two parameters:

- `after`: how long to wait before showing the loading state (avoids flash on fast connections)
- `minimum`: how long to keep showing it (avoids flash on fast responses)

```html
@loading (after 100ms; minimum 200ms) {
  <mat-spinner />
}
```

## `@error` Block

Renders if the deferred import fails (network error, module not found).

```html
@error {
  <p>Content failed to load. <button (click)="reload()">Retry</button></p>
}
```

## Prefetching

Prefetch the chunk before the trigger fires to reduce latency:

```html
@defer (on interaction; prefetch on idle) {
  <modal-dialog />
} @placeholder {
  <button>Open dialog</button>
}
```

## `@defer` and Incremental Hydration (SSR)

In SSR apps, `@defer` blocks defer hydration of server-rendered HTML — the block renders on the server but hydrates lazily in the browser, reducing Time to Interactive.

From Angular v22, incremental hydration is enabled by default:

```ts
// app.config.ts (v22+)
provideClientHydration()
```

On Angular v21 and earlier, opt in explicitly:

```ts
// app.config.ts (v21 and earlier)
provideClientHydration(withIncrementalHydration())
```

## Anti-Patterns

**Do not defer above-the-fold content.** The LCP element must load immediately. Deferring it causes the browser to download and parse the deferred chunk before the primary content is visible, increasing LCP significantly.

```html
<!-- WRONG: hero image is the LCP candidate -->
@defer (on viewport) {
  <img ngSrc="hero.webp" priority width="1200" height="600" />
}

<!-- CORRECT: eager, with NgOptimizedImage priority -->
<img ngSrc="hero.webp" priority width="1200" height="600" />
```

**Always include `@placeholder`.** A missing placeholder collapses the layout area and causes CLS when content loads.

**Do not use `@defer (on immediate)` as a substitute for lazy routes.** It still fetches the chunk eagerly on idle — use lazy routes for true code splitting by page.

## When to Prefer `@defer` Over Lazy Routes

| Scenario | Prefer |
|---|---|
| Entire page / feature area | Lazy route (`loadComponent`) |
| Part of a page (sidebar, chart, comment section) | `@defer (on viewport)` or `@defer (on idle)` |
| Dialog / modal triggered by user action | `@defer (on interaction)` |
| Incrementally hydrating an SSR section | `@defer` (automatic in v22+; requires `withIncrementalHydration()` in v21 and earlier) |
