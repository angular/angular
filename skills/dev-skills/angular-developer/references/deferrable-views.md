# Deferrable Views

Use a `@defer` block for template content that can be lazy loaded and is not required for the initial render. Angular splits eligible
dependencies into a separate chunk and loads them when the block triggers.

## Code splitting

A component, directive, or pipe is deferred only when:

- It is standalone.
- It is not referenced outside the `@defer` block in the same file, including by a view query.

Dependencies used by `@placeholder`, `@loading`, and `@error` are eager. Keep those blocks small.
Avoid barrel imports when they cause a deferred dependency to be referenced eagerly.

## States and triggers

```html
@defer (on viewport; prefetch on idle) {
<product-reviews />
} @placeholder (minimum 200ms) {
<div class="reviews-placeholder" aria-hidden="true"></div>
} @loading (after 100ms; minimum 200ms) {
<p role="status">Loading reviews...</p>
} @error {
<p role="alert">Reviews could not be loaded.</p>
}
```

- `@placeholder` renders before the trigger.
- `@loading` renders while the deferred chunk loads. Use `after` and `minimum` to avoid flicker.
- `@error` renders when loading fails.
- `on idle` is the default. Other triggers are `viewport`, `interaction`, `hover`, `immediate`,
  and `timer`.
- `when expression` triggers when the expression first becomes truthy. The block does not revert
  if it later becomes false.
- `prefetch` downloads the chunk before the main trigger renders it.

See [defer block triggers](https://angular.dev/guide/templates/defer#controlling-deferred-content-loading-with-triggers)
for trigger details and options.

For `viewport`, `interaction`, or `hover`, use a single-root placeholder or pass a template
reference to the trigger.

## SSR and hydration

By default, SSR and prerendering render the `@placeholder` block, or nothing when it is absent,
without invoking triggers. In the browser, Angular hydrates the placeholder and activates the
regular trigger.

When incremental hydration is enabled and the server should render the deferred content, add a
hydrate trigger:

```html
@defer (on viewport; hydrate on interaction) {
<product-reviews />
} @placeholder {
<div class="reviews-placeholder" aria-hidden="true"></div>
}
```

The regular trigger controls later client-side rendering. The hydrate trigger controls when
server-rendered deferred content becomes interactive.

## Layout stability

- Do not defer above-the-fold or LCP content.
- Give placeholders the same dimensions or aspect ratio as the final content.
- Keep placeholder, loading, error, and final states geometrically consistent.
- Avoid initial-render triggers such as `immediate`, short `timer` values, or early `viewport`
  triggers when replacement would cause layout shift.
- Give nested `@defer` blocks different triggers to avoid cascading requests.
