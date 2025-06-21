# The New Age of Reactivity in Angular

This interactive guide explores Angular Signals, a fundamental evolution in how the framework manages state and reactivity. The primary motivation behind signals is to enable fine-grained change detection, allowing Angular to know *exactly* which parts of the page have been affected by a state change and update only those specific DOM nodes. This precision is key to unlocking significant runtime performance improvements and is a critical step toward making Zone.js optional.

Beyond performance, signals dramatically improve the developer experience. They offer a more explicit and predictable data flow with a simple, easy-to-understand API. This guide is your "recipe book" for learning and applying these powerful new primitives. Use the navigation on the left to explore different concepts and try the interactive examples to see signals in action.

## Core Primitives

### The Source of Truth: `signal()`

A writable signal, created with the `signal()` function, is the foundation of all reactive state. It's a container for a value that notifies consumers when it changes. You create it with an initial value and read it by calling it as a function, like `mySignal()`. State is changed using the `.set()` or `.update()` methods.

<docs-code-multifile preview path="adev/src/content/examples/signals/src/signal/app/app.ts">
  <docs-code header="app/app.ts" path="adev/src/content/examples/signals/src/signal/app/app.ts"/>
  <docs-code header="app/app.html" path="adev/src/content/examples/signals/src/signal/app/app.html"/>
  <docs-code header="app/app.css" path="adev/src/content/examples/signals/src/signal/app/app.css"/>
</docs-code-multifile>

### The Reactive Calculator: `computed()`

A `computed()` signal derives its value from other signals. It's a read-only signal that automatically updates when its dependencies change. This is perfect for creating values that depend on other state, like combining a first and last name into a full name. They are also highly performant due to lazy evaluation and memoization.

<docs-code-multifile preview path="adev/src/content/examples/signals/src/computed/app/app.ts">
  <docs-code header="app/app.ts" path="adev/src/content/examples/signals/src/computed/app/app.ts"/>
  <docs-code header="app/app.html" path="adev/src/content/examples/signals/src/computed/app/app.html"/>
  <docs-code header="app/app.css" path="adev/src/content/examples/signals/src/computed/app/app.css"/>
</docs-code-multifile>

### Managing Side Effects: `effect()`

An `effect()` runs in response to signal changes and is used for side effects—interacting with systems outside the signal graph, like browser APIs (e.g., `localStorage`), logging, or custom DOM manipulation. It should be used sparingly and never to update other signals, as that is an anti-pattern.

<docs-code-multifile preview path="adev/src/content/examples/signals/src/effect/app/app.ts">
  <docs-code header="app/app.ts" path="adev/src/content/examples/signals/src/effect/app/app.ts"/>
  <docs-code header="app/app.html" path="adev/src/content/examples/signals/src/effect/app/app.html"/>
  <docs-code header="app/app.css" path="adev/src/content/examples/signals/src/effect/app/app.css"/>
</docs-code-multifile>

## Component APIs

### One-Way Data Flow: `input()`

The `input()` function is the modern, signal-based way to define component inputs. It offers superior type safety, especially with `input.required()`, and because the input is a signal, it can be easily composed with `computed()` to react to changes, often replacing the need for the `ngOnChanges` lifecycle hook.

This example demonstrates the robust type safety and clear intent provided by the new input APIs. Required inputs prevent runtime errors by enforcing contracts at build time, and optional inputs with defaults simplify component logic.

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

### Dependent Writable State: `linkedSignal()`

`linkedSignal` creates a *writable* signal whose value is derived from a source, but which can also be manually updated. It resets to a newly derived value whenever its source changes. This is ideal for form inputs that should reset when a related selection changes.

<docs-code-multifile preview path="adev/src/content/examples/signals/src/linked-signal/app/app.ts">
  <docs-code header="app/app.ts" path="adev/src/content/examples/signals/src/linked-signal/app/app.ts"/>
  <docs-code header="app/app.html" path="adev/src/content/examples/signals/src/linked-signal/app/app.html"/>
  <docs-code header="app/app.css" path="adev/src/content/examples/signals/src/linked-signal/app/app.css"/>
</docs-code-multifile>

### Accumulating State with `linkedSignal` and Previous Value

The `computation` function in a `linkedSignal` can optionally receive the previous value of the signal as its second argument. This powerful feature enables accumulation patterns, where new state is created based on the old state, such as appending items to a list for a "Load More" feature.

<docs-code-multifile preview path="adev/src/content/examples/signals/src/accumulator/app/app.ts">
  <docs-code header="app/app.ts" path="adev/src/content/examples/signals/src/accumulator/app/app.ts"/>
  <docs-code header="app/app.html" path="adev/src/content/examples/signals/src/accumulator/app/app.html"/>
  <docs-code header="app/app.css" path="adev/src/content/examples/signals/src/accumulator/app/app.css"/>
</docs-code-multifile>

### Persisting UI State During Loading with `linkedSignal`

Another powerful use of the previous value in a `linkedSignal` is to prevent UI "flicker" during data loading. By checking the status of a related `resource` signal, you can choose to keep displaying the previous (stale) data until the new data has been successfully loaded.

<docs-code-multifile preview path="adev/src/content/examples/signals/src/persist/app/app.ts">
  <docs-code header="app/app.ts" path="adev/src/content/examples/signals/src/persist/app/app.ts"/>
  <docs-code header="app/app.html" path="adev/src/content/examples/signals/src/persist/app/app.html"/>
  <docs-code header="app/app.css" path="adev/src/content/examples/signals/src/persist/app/app.css"/>
</docs-code-multifile>

### DOM Interaction: `viewChild()`

The `viewChild()` function is the signal-based alternative to the `@ViewChild()` decorator. It gets a reference to an element, directive, or component from the template and exposes it as a signal. This allows you to reactively respond to the child's state or availability, often replacing `ngAfterViewInit`.

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

The `resource` API (experimental) declaratively represents an async data source. It wraps an operation like a `Promise` and exposes its lifecycle (loading, success, error) through a collection of signals, making it easy to create reactive UIs for data fetching.

<docs-code-multifile preview path="adev/src/content/examples/signals/src/resource/app/app.ts">
  <docs-code header="app/app.ts" path="adev/src/content/examples/signals/src/resource/app/app.ts"/>
  <docs-code header="app/app.html" path="adev/src/content/examples/signals/src/resource/app/app.html"/>
  <docs-code header="app/app.css" path="adev/src/content/examples/signals/src/resource/app/app.css"/>
</docs-code-multifile>

### Simplified HTTP Fetching: `httpResource()`

The httpResource API (experimental) is a specialized version of resource that simplifies `HttpClient` requests. It accepts a reactive function that returns either a URL string for simple GET requests, or a full configuration object for more control.

#### Basic Usage with a URL

For simple GET requests, provide a function that returns the request URL string. `httpResource` will reactively re-fetch whenever any signal read inside this function changes.

<docs-code-multifile preview path="adev/src/content/examples/signals/src/http-resource/app/app.ts">
  <docs-code header="app/app.ts" path="adev/src/content/examples/signals/src/http-resource/app/app.ts"/>
  <docs-code header="app/app.html" path="adev/src/content/examples/signals/src/http-resource/app/app.html"/>
  <docs-code header="app/app.css" path="adev/src/content/examples/signals/src/http-resource/app/app.css"/>
</docs-code-multifile>

#### Advanced Usage with a Configuration Object

For more control over the request (e.g., to set a different method, headers, or params), the factory function can return a full configuration object. This provides access to all the options available on an `HttpRequest`.

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


## Advanced Recipes

### Dynamic, Filterable Data Table

A classic UI pattern that becomes remarkably elegant with signals. The solution is declarative: a signal for the search term, a signal for the master data list, and a `computed` signal that derives the filtered list. The UI simply renders the result of the computed signal.

<docs-code-multifile preview path="adev/src/content/examples/signals/src/filter/app/app.ts">
  <docs-code header="app/app.ts" path="adev/src/content/examples/signals/src/filter/app/app.ts"/>
  <docs-code header="app/app.html" path="adev/src/content/examples/signals/src/filter/app/app.html"/>
  <docs-code header="app/app.css" path="adev/src/content/examples/signals/src/filter/app/app.css"/>
</docs-code-multifile>

### Interactive E-Commerce Shopping Cart

For state that needs to be shared across components, a service is a great pattern. This recipe shows a `CartService` that uses signals to manage items and `computed` signals to derive the total price and item count. Components interact with the service via a clean API.

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

### Preventing Unnecessary Updates with Custom Equality

By default, signals use referential equality (`Object.is`). For objects, this means a new object instance always triggers an update, even if its data is identical. You can provide a custom `equal` function to `signal()` or `computed()` to define your own comparison logic, preventing unnecessary re-computations.

<docs-code-multifile preview path="adev/src/content/examples/signals/src/equality/app/app.ts">
  <docs-code header="app/app.ts" path="adev/src/content/examples/signals/src/equality/app/app.ts"/>
  <docs-code header="app/app.html" path="adev/src/content/examples/signals/src/equality/app/app.html"/>
  <docs-code header="app/app.css" path="adev/src/content/examples/signals/src/equality/app/app.css"/>
</docs-code-multifile>

### Breaking the Reactive Chain with `untracked()`

Inside a reactive context like `computed` or `effect`, you sometimes need to access a signal's value *without* creating a dependency on it. The `untracked()` function allows you to read a signal's current value on a one-off basis, preventing the context from re-running when that specific signal changes.

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

## Conclusion: The Future is Reactive and Signal-Driven

Angular Signals mark a transformative moment for the framework. By enabling precision change detection and offering a simplified developer experience, they are the cornerstone of a faster, more efficient, and zoneless future for Angular. Their seamless interoperability with RxJS ensures developers can use the best tool for the job: signals for state, and RxJS for complex event orchestration.

By embracing these new primitives and patterns, you can build applications that are not only more performant but also easier to reason about, debug, and maintain. Start using them in new components, embrace the declarative mindset, and incrementally refactor existing code to unlock the full potential of modern Angular.