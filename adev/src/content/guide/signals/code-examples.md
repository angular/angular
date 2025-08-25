# Code Examples

This interactive guide is your "recipe book" for learning and working with signals to manage state and reactivity in Angular. Check out our [signals guide](guide/signals) to learn more.

## Core Primitives

### The Source of Truth: `signal()`

<docs-pill-row>
  <docs-pill title="Signals guide" href="guide/signals" />
</docs-pill-row>

<docs-code-multifile preview path="adev/src/content/examples/signals/src/signal/app/app.ts">
  <docs-code header="app/app.ts" path="adev/src/content/examples/signals/src/signal/app/app.ts"/>
  <docs-code header="app/app.html" path="adev/src/content/examples/signals/src/signal/app/app.html"/>
  <docs-code header="app/app.css" path="adev/src/content/examples/signals/src/signal/app/app.css"/>
</docs-code-multifile>

### The Reactive Calculator: `computed()`

<docs-pill-row>
  <docs-pill title="Computed guide" href="signals#computed-signals" />
</docs-pill-row>

<docs-code-multifile preview path="adev/src/content/examples/signals/src/computed/app/app.ts">
  <docs-code header="app/app.ts" path="adev/src/content/examples/signals/src/computed/app/app.ts"/>
  <docs-code header="app/app.html" path="adev/src/content/examples/signals/src/computed/app/app.html"/>
  <docs-code header="app/app.css" path="adev/src/content/examples/signals/src/computed/app/app.css"/>
</docs-code-multifile>

### Managing Side Effects: `effect()`

<docs-pill-row>
  <docs-pill title="Effect guide" href="signals#effects" />
</docs-pill-row>

<docs-code-multifile preview path="adev/src/content/examples/signals/src/effect/app/app.ts">
  <docs-code header="app/app.ts" path="adev/src/content/examples/signals/src/effect/app/app.ts"/>
  <docs-code header="app/app.html" path="adev/src/content/examples/signals/src/effect/app/app.html"/>
  <docs-code header="app/app.css" path="adev/src/content/examples/signals/src/effect/app/app.css"/>
</docs-code-multifile>

## Component APIs

### One-Way Data Flow: `input()`

<docs-pill-row>
  <docs-pill title="Input guide" href="guide/components/inputs" />
</docs-pill-row>

<docs-code-multifile preview path="adev/src/content/examples/signals/src/input/app/app.ts">
  <docs-code header="child.ts" path="adev/src/content/examples/signals/src/input/app/child.ts"/>
  <docs-code header="child.html" path="adev/src/content/examples/signals/src/input/app/child.html"/>
  <docs-code header="child.css" path="adev/src/content/examples/signals/src/input/app/child.css"/>
  <docs-code header="app.ts" path="adev/src/content/examples/signals/src/input/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/signals/src/input/app/app.html"/>
  <docs-code header="app.css" path="adev/src/content/examples/signals/src/input/app/app.css"/>
</docs-code-multifile>

### Two-Way Data Binding: `model()`

The `model()` function simplifies two-way data binding. It creates a writable signal that can be updated from within a component, with changes automatically propagated back to the parent. It's the ideal tool for creating custom form controls or any component supporting the `[()]` syntax.

<docs-code-multifile preview path="adev/src/content/examples/signals/src/model/app/app.ts">
  <docs-code header="child.ts" path="adev/src/content/examples/signals/src/model/app/child.ts"/>
  <docs-code header="child.html" path="adev/src/content/examples/signals/src/model/app/child.html"/>
  <docs-code header="child.css" path="adev/src/content/examples/signals/src/model/app/child.css"/>
  <docs-code header="app.ts" path="adev/src/content/examples/signals/src/model/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/signals/src/model/app/app.html"/>
  <docs-code header="app.css" path="adev/src/content/examples/signals/src/model/app/app.css"/>
</docs-code-multifile>

### Dependent Writable State: `linkedSignal`

<docs-pill-row>
  <docs-pill title="linkedSignal guide" href="guide/signals/linked-signal" />
</docs-pill-row>

<docs-code-multifile preview path="adev/src/content/examples/signals/src/linked-signal/app/app.ts">
  <docs-code header="app/app.ts" path="adev/src/content/examples/signals/src/linked-signal/app/app.ts"/>
  <docs-code header="app/app.html" path="adev/src/content/examples/signals/src/linked-signal/app/app.html"/>
  <docs-code header="app/app.css" path="adev/src/content/examples/signals/src/linked-signal/app/app.css"/>
</docs-code-multifile>

### Accumulating State with `linkedSignal` and Previous Value

<docs-pill-row>
  <docs-pill title="linkedSignal with previous state guide" href="guide/signals/linked-signal#accounting-for-previous-state" />
</docs-pill-row>

<docs-code-multifile preview path="adev/src/content/examples/signals/src/accumulator/app/app.ts">
  <docs-code header="app/app.ts" path="adev/src/content/examples/signals/src/accumulator/app/app.ts"/>
  <docs-code header="app/app.html" path="adev/src/content/examples/signals/src/accumulator/app/app.html"/>
  <docs-code header="app/app.css" path="adev/src/content/examples/signals/src/accumulator/app/app.css"/>
</docs-code-multifile>

### Persisting UI State During Loading with `linkedSignal`

<docs-pill-row>
  <docs-pill title="linkedSignal with previous state guide" href="guide/signals/linked-signal#accounting-for-previous-state" />
</docs-pill-row>

<docs-code-multifile preview path="adev/src/content/examples/signals/src/persist/app/app.ts">
  <docs-code header="app/app.ts" path="adev/src/content/examples/signals/src/persist/app/app.ts"/>
  <docs-code header="app/app.html" path="adev/src/content/examples/signals/src/persist/app/app.html"/>
  <docs-code header="app/app.css" path="adev/src/content/examples/signals/src/persist/app/app.css"/>
</docs-code-multifile>

### DOM Interaction: `viewChild()`

<docs-pill-row>
  <docs-pill title="View queries guide" href="guide/components/queries#view-queries" />
</docs-pill-row>

<docs-code-multifile preview path="adev/src/content/examples/signals/src/child-panel/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/signals/src/child-panel/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/signals/src/child-panel/app/app.html"/>
  <docs-code header="app.css" path="adev/src/content/examples/signals/src/child-panel/app/app.css"/>
  <docs-code header="child.ts" path="adev/src/content/examples/signals/src/child-panel/app/child.ts"/>
  <docs-code header="child.html" path="adev/src/content/examples/signals/src/child-panel/app/child.html"/>
  <docs-code header="child.css" path="adev/src/content/examples/signals/src/child-panel/app/child.css"/>
</docs-code-multifile>

## Async Patterns

### Declarative Data Fetching: `resource()`

<docs-pill-row>
  <docs-pill title="Resource guide" href="guide/signals/resource" />
</docs-pill-row>

<docs-code-multifile preview path="adev/src/content/examples/signals/src/resource/app/app.ts">
  <docs-code header="app/app.ts" path="adev/src/content/examples/signals/src/resource/app/app.ts"/>
  <docs-code header="app/app.html" path="adev/src/content/examples/signals/src/resource/app/app.html"/>
  <docs-code header="app/app.css" path="adev/src/content/examples/signals/src/resource/app/app.css"/>
</docs-code-multifile>

### Simplified HTTP Fetching: `httpResource()`

<docs-pill-row>
  <docs-pill title="httpResource guide" href="guide/signals/resource#reactive-data-fetching-with-httpresource" />
</docs-pill-row>

#### Basic Usage with a URL

<docs-code-multifile preview path="adev/src/content/examples/signals/src/http-resource/app/app.ts">
  <docs-code header="app/app.ts" path="adev/src/content/examples/signals/src/http-resource/app/app.ts"/>
  <docs-code header="app/app.html" path="adev/src/content/examples/signals/src/http-resource/app/app.html"/>
  <docs-code header="app/app.css" path="adev/src/content/examples/signals/src/http-resource/app/app.css"/>
</docs-code-multifile>

#### Advanced Usage with a Configuration Object

<docs-code-multifile preview path="adev/src/content/examples/signals/src/http-resource-config/app/app.ts">
  <docs-code header="app/app.ts" path="adev/src/content/examples/signals/src/http-resource-config/app/app.ts"/>
  <docs-code header="app/app.html" path="adev/src/content/examples/signals/src/http-resource-config/app/app.html"/>
  <docs-code header="app/app.css" path="adev/src/content/examples/signals/src/http-resource-config/app/app.css"/>
</docs-code-multifile>


### Essential RxJS Interoperability

Signals don't replace RxJS; they complement it. The `@angular/core/rxjs-interop` package provides tools to make them work together. `toSignal()` converts an Observable to a signal, perfect for data from `HttpClient`. `toObservable()` converts a signal to an Observable, ideal for feeding state into complex RxJS pipelines like a debounced search.

<docs-code-multifile preview path="adev/src/content/examples/signals/src/interop/app/app.ts">
  <docs-code header="app/app.ts" path="adev/src/content/examples/signals/src/interop/app/app.ts"/>
  <docs-code header="app/app.html" path="adev/src/content/examples/signals/src/interop/app/app.html"/>
  <docs-code header="app/app.css" path="adev/src/content/examples/signals/src/interop/app/app.css"/>
</docs-code-multifile>


### Reactive Data Streams with `rxResource`

The `rxResource` primitive from `@angular/core/rxjs-interop` is a powerful tool for creating reactive state from an `Observable`\-based data source. It listens to a `request` signal and triggers its `loader` function whenever that signal changes. The `loader` returns a new `Observable`, such as one from an `HttpClient` request. This pattern declaratively handles the entire data-fetching lifecycle, automatically managing `loading`, `resolved`, and `error` states while re-running the stream in response to state changes.

<docs-code-multifile preview path="adev/src/content/examples/signals/src/rx-resource/app/app.ts">
  <docs-code header="app/app.ts" path="adev/src/content/examples/signals/src/rx-resource/app/movie.ts"/>
  <docs-code header="app/app.ts" path="adev/src/content/examples/signals/src/rx-resource/app/app.ts"/>
  <docs-code header="app/app.html" path="adev/src/content/examples/signals/src/rx-resource/app/app.html"/>
  <docs-code header="app/app.css" path="adev/src/content/examples/signals/src/rx-resource/app/app.css"/>
</docs-code-multifile>


## Advanced Recipes

### Dynamic, Filterable Data Table

<docs-code-multifile preview path="adev/src/content/examples/signals/src/filter/app/app.ts">
  <docs-code header="app/app.ts" path="adev/src/content/examples/signals/src/filter/app/app.ts"/>
  <docs-code header="app/app.html" path="adev/src/content/examples/signals/src/filter/app/app.html"/>
  <docs-code header="app/app.css" path="adev/src/content/examples/signals/src/filter/app/app.css"/>
</docs-code-multifile>

### Interactive E-Commerce Shopping Cart with Dependency Injection

<docs-pill-row>
  <docs-pill title="Dependency injection guide" href="guide/di" />
</docs-pill-row>

<docs-code-multifile preview path="adev/src/content/examples/signals/src/service/app/app.ts">
  <docs-code header="app/cart.ts" path="adev/src/content/examples/signals/src/service/app/cart.ts"/>
  <docs-code header="app/product-list.ts" path="adev/src/content/examples/signals/src/service/app/product-list.ts"/>
  <docs-code header="app/product-list.html" path="adev/src/content/examples/signals/src/service/app/product-list.html"/>
  <docs-code header="app/product-list.css" path="adev/src/content/examples/signals/src/service/app/product-list.css"/>
  <docs-code header="app/cart-summary.ts" path="adev/src/content/examples/signals/src/service/app/cart-summary.ts"/>
  <docs-code header="app/cart-summary" path="adev/src/content/examples/signals/src/service/app/cart-summary.html"/>
  <docs-code header="app/cart-summary" path="adev/src/content/examples/signals/src/service/app/cart-summary.css"/>
  <docs-code header="app/app.ts" path="adev/src/content/examples/signals/src/service/app/app.ts"/>
  <docs-code header="app/app.html" path="adev/src/content/examples/signals/src/service/app/app.html"/>
  <docs-code header="app/app.css" path="adev/src/content/examples/signals/src/service/app/app.css"/>
</docs-code-multifile>

## Best Practices

### Preventing Unnecessary Updates with [Custom Equality](guide/signals#signal-equality-functions)

<docs-pill-row>
  <docs-pill title="Custom equality guide" href="guide/signals#signal-equality-functions" />
</docs-pill-row>

<docs-code-multifile preview path="adev/src/content/examples/signals/src/equality/app/app.ts">
  <docs-code header="app/app.ts" path="adev/src/content/examples/signals/src/equality/app/app.ts"/>
  <docs-code header="app/app.html" path="adev/src/content/examples/signals/src/equality/app/app.html"/>
  <docs-code header="app/app.css" path="adev/src/content/examples/signals/src/equality/app/app.css"/>
</docs-code-multifile>

### Breaking the Reactive Chain with [`untracked()`](guide/signals#reading-without-tracking-dependencies)

<docs-pill-row>
  <docs-pill title="Untracked signals guide" href="guide/signals#reading-without-tracking-dependencies" />
</docs-pill-row>


<docs-code-multifile preview path="adev/src/content/examples/signals/src/untracked/app/app.ts">
  <docs-code header="app/app.ts" path="adev/src/content/examples/signals/src/untracked/app/app.ts"/>
  <docs-code header="app/app.html" path="adev/src/content/examples/signals/src/untracked/app/app.html"/>
  <docs-code header="app/app.css" path="adev/src/content/examples/signals/src/untracked/app/app.css"/>
</docs-code-multifile>

### The Importance of Immutability

You should never mutate a signal's value directly (e.g., using `.push()` on an array). Doing so can break change detection because the object/array reference hasn't changed. Always create a new object or array instance when updating a signal's state to ensure changes are reliably detected.

<docs-code-multifile preview path="adev/src/content/examples/signals/src/immutability/app/app.ts">
  <docs-code header="app/app.ts" path="adev/src/content/examples/signals/src/immutability/app/app.ts"/>
  <docs-code header="app/app.html" path="adev/src/content/examples/signals/src/immutability/app/app.html"/>
  <docs-code header="app/app.css" path="adev/src/content/examples/signals/src/immutability/app/app.css"/>
</docs-code-multifile>