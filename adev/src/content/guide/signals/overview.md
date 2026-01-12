<docs-decorative-header title="Angular Signals" imgSrc="adev/src/assets/images/signals.svg"> <!-- markdownlint-disable-line -->
Angular Signals is a system that granularly tracks how and where your state is used throughout an application, allowing the framework to optimize rendering updates.
</docs-decorative-header>

TIP: Check out Angular's [Essentials](essentials/signals) before diving into this comprehensive guide.

## What are signals?

A **signal** is a wrapper around a value that notifies interested consumers when that value changes. Signals can contain any value, from primitives to complex data structures.

You read a signal's value by calling its getter function, which allows Angular to track where the signal is used.

Signals may be either _writable_ or _read-only_.

### Writable signals

Writable signals provide an API for updating their values directly. You create writable signals by calling the `signal` function with the signal's initial value:

```ts
const count = signal(0);

// Signals are getter functions - calling them reads their value.
console.log('The count is: ' + count());
```

To change the value of a writable signal, either `.set()` it directly:

```ts
count.set(3);
```

or use the `.update()` operation to compute a new value from the previous one:

```ts
// Increment the count by 1.
count.update((value) => value + 1);
```

Writable signals have the type `WritableSignal`.

#### Converting writable signals to readonly

`WritableSignal` provide a `asReadonly()` method that returns a readonly version of the signal. This is useful when you want to expose a signal's value to consumers without allowing them to modify it directly:

```ts
@Injectable({providedIn: 'root'})
export class CounterState {
  // Private writable state
  private readonly _count = signal(0);

  readonly count = this._count.asReadonly(); // public readonly

  increment() {
    this._count.update((v) => v + 1);
  }
}

@Component({
  /* ... */
})
export class AwesomeCounter {
  state = inject(CounterState);

  count = this.state.count; // can read but not modify

  increment() {
    this.state.increment();
  }
}
```

The readonly signal reflects any changes made to the original writable signal, but cannot be modified using `set()` or `update()` methods.

IMPORTANT: The readonly signals do **not** have any built-in mechanism that would prevent deep-mutation of their value.

### Computed signals

**Computed signal** are read-only signals that derive their value from other signals. You define computed signals using the `computed` function and specifying a derivation:

```typescript
const count: WritableSignal<number> = signal(0);
const doubleCount: Signal<number> = computed(() => count() * 2);
```

The `doubleCount` signal depends on the `count` signal. Whenever `count` updates, Angular knows that `doubleCount` needs to update as well.

#### Computed signals are both lazily evaluated and memoized

`doubleCount`'s derivation function does not run to calculate its value until the first time you read `doubleCount`. The calculated value is then cached, and if you read `doubleCount` again, it will return the cached value without recalculating.

If you then change `count`, Angular knows that `doubleCount`'s cached value is no longer valid, and the next time you read `doubleCount` its new value will be calculated.

As a result, you can safely perform computationally expensive derivations in computed signals, such as filtering arrays.

#### Computed signals are not writable signals

You cannot directly assign values to a computed signal. That is,

```ts
doubleCount.set(3);
```

produces a compilation error, because `doubleCount` is not a `WritableSignal`.

#### Computed signal dependencies are dynamic

Only the signals actually read during the derivation are tracked. For example, in this `computed` the `count` signal is only read if the `showCount` signal is true:

```ts
const showCount = signal(false);
const count = signal(0);
const conditionalCount = computed(() => {
  if (showCount()) {
    return `The count is ${count()}.`;
  } else {
    return 'Nothing to see here!';
  }
});
```

When you read `conditionalCount`, if `showCount` is `false` the "Nothing to see here!" message is returned _without_ reading the `count` signal. This means that if you later update `count` it will _not_ result in a recomputation of `conditionalCount`.

If you set `showCount` to `true` and then read `conditionalCount` again, the derivation will re-execute and take the branch where `showCount` is `true`, returning the message which shows the value of `count`. Changing `count` will then invalidate `conditionalCount`'s cached value.

Note that dependencies can be removed during a derivation as well as added. If you later set `showCount` back to `false`, then `count` will no longer be considered a dependency of `conditionalCount`.

## Reactive contexts

A **reactive context** is a runtime state where Angular monitors signal reads to establish a dependency. The code reading the signal is the _consumer_, and the signal being read is the _producer_.

Angular automatically enters a reactive context when:

- Executing an `effect`, `afterRenderEffect` callback.
- Evaluating a `computed` signal.
- Evaluating a `linkedSignal`.
- Evaluating a `resource`'s params or loader function.
- Rendering a component template (including bindings in the [host property](guide/components/host-elements#binding-to-the-host-element)).

During these operations, Angular creates a _live_ connection. If a tracked signal changes, Angular will _eventually_ re-run the consumer.

### Asserts the reactive context

Angular provides the `assertNotInReactiveContext` helper function to assert that code is not executing within a reactive context. Pass a reference to the calling function so the error message points to the correct API entry point if the assertion fails. This produces a clearer, more actionable error message than a generic reactive context error.

```ts
import {assertNotInReactiveContext} from '@angular/core';

function subscribeToEvents() {
  assertNotInReactiveContext(subscribeToEvents);
  // Safe to proceed - subscription logic here
}
```

### Reading without tracking dependencies

Rarely, you may want to execute code which may read signals within a reactive function such as `computed` or `effect` _without_ creating a dependency.

For example, suppose that when `currentUser` changes, the value of a `counter` should be logged. You could create an `effect` which reads both signals:

```ts
effect(() => {
  console.log(`User set to ${currentUser()} and the counter is ${counter()}`);
});
```

This example will log a message when _either_ `currentUser` or `counter` changes. However, if the effect should only run when `currentUser` changes, then the read of `counter` is only incidental and changes to `counter` shouldn't log a new message.

You can prevent a signal read from being tracked by calling its getter with `untracked`:

```ts
effect(() => {
  console.log(`User set to ${currentUser()} and the counter is ${untracked(counter)}`);
});
```

`untracked` is also useful when an effect needs to invoke some external code which shouldn't be treated as a dependency:

```ts
effect(() => {
  const user = currentUser();
  untracked(() => {
    // If the `loggingService` reads signals, they won't be counted as
    // dependencies of this effect.
    this.loggingService.log(`User set to ${user}`);
  });
});
```

## Advanced derivations

While `computed` handles simple readonly derivations, you might find yourself needing a writable state that is dependant on other signals.
For more information see the [Dependent state with linkedSignal](/guide/signals/linked-signal) guide.

All signal APIs are synchronous— `signal`, `computed`, `input`, etc. However, applications often need to deal with data that is available asynchronously. A `Resource` gives you a way to incorporate async data into your application's signal-based code and still allow you to access its data synchronously. For more information see the [Async reactivity with resources](/guide/signals/resource) guide.

## Executing side effects on non-reactive APIs

Synchronous or asynchronous derivations are recommended when we want to react to state changes. However, this doesn't cover all the possible use cases, and you'll sometimes find yourself in a situation where you need to react to signal changes on non-reactive apis. Use `effect` or `afterRenderEffect` for those specific usecases. For more information see [Side effects for non-reactive APIs](/guide/signals/effect) guide.

## Reading signals in `OnPush` components

When you read a signal within an `OnPush` component's template, Angular tracks the signal as a dependency of that component. When the value of that signal changes, Angular automatically [marks](api/core/ChangeDetectorRef#markforcheck) the component to ensure it gets updated the next time change detection runs. Refer to the [Skipping component subtrees](best-practices/skipping-subtrees) guide for more information about `OnPush` components.

## Advanced topics

### Signal equality functions

When creating a signal, you can optionally provide an equality function, which will be used to check whether the new value is actually different than the previous one.

```ts
import _ from 'lodash';

const data = signal(['test'], {equal: _.isEqual});

// Even though this is a different array instance, the deep equality
// function will consider the values to be equal, and the signal won't
// trigger any updates.
data.set(['test']);
```

Equality functions can be provided to both writable and computed signals.

HELPFUL: By default, signals use referential equality ([`Object.is()`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/is) comparison).

### Type checking signals

You can use `isSignal` to check if a value is a `Signal`:

```ts
const count = signal(0);
const doubled = computed(() => count() * 2);

isSignal(count); // true
isSignal(doubled); // true
isSignal(42); // false
```

To specifically check if a signal is writable, use `isWritableSignal`:

```ts
const count = signal(0);
const doubled = computed(() => count() * 2);

isWritableSignal(count); // true
isWritableSignal(doubled); // false
```

## Using signals with RxJS

See [RxJS interop with Angular signals](ecosystem/rxjs-interop) for details on interoperability between signals and RxJS.
