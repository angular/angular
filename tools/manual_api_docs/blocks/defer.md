A type of [block](api/core/@defer) that can be used to defer load the JavaScript for components,
directives and pipes used inside a component template.

## Syntax

```angular-html
@defer ( on <trigger>; when <condition>; prefetch on <trigger>; prefetch when <condition> ) {
  <!-- deferred template fragment -->
  <calendar-cmp />
} @placeholder ( minimum? <duration> ) {
  <!-- placeholder template fragment -->
  <p>Placeholder</p>
} @loading ( minimum? <duration>; after? <duration> ) {
  <!-- loading template fragment -->
  <img alt="loading image" src="loading.gif" />
} @error {
  <!-- error template fragment -->
  <p>An loading error occurred</p>
}
```

## Description

### Blocks

Supported sections of a defer block. Note: only the @defer block template fragment is deferred
loaded. The remaining optional blocks are eagerly loaded.

| block          | Description                                              |
|----------------|----------------------------------------------------------|
| `@defer`       | The defer loaded block of content                        |
| `@placeholder` | Content shown prior to defer loading (Optional)          |
| `@loading`     | Content shown during defer loading (Optional)            |
| `@error`       | Content shown when defer loading errors occur (Optional) |

<h3>Triggers</h3>

Triggers provide conditions for when defer loading occurs. Some allow a template reference variable
as an optional parameter. Separate multiple triggers with a semicolon.

| trigger                         | Triggers...                                   | 
|---------------------------------|-----------------------------------------------|
| `on idle`                       | when the browser reports idle state (default) |
| `on viewport(<elementRef>?)`    | when the element enters the viewport          |
| `on interaction(<elementRef>?)` | when clicked, touched, or focused             |
| `on hover(<elementRef>?)`       | when element has been hovered                 |
| `on immediate`                  | when the page finishes rendering              |
| `on timer(<duration>)`          | after a specific timeout                      |
| `when <condition>`              | on a custom condition                         |

<h2>Prefetch</h2>

Configures prefetching of the defer block used in the `@defer` parameters, but does not affect
rendering. Rendering is handled by the standard `on` and `when` conditions. Separate multiple
prefetch configurations with a semicolon.

```angular-html
@defer (prefetch on <trigger>; prefetch when <condition>) {
  <!-- deferred template fragment -->
}
```

Learn more in the [defer loading guide](guide/defer).
