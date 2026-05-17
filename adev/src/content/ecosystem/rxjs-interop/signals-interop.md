# RxJS interop with Angular signals

The `@angular/core/rxjs-interop` package offers APIs that help you integrate RxJS and Angular signals.

## Create a signal from an RxJs Observable with `toSignal`

Use the `toSignal` function to create a signal which tracks the value of an Observable. It behaves similarly to the `async` pipe in templates, but is more flexible and can be used anywhere in an application.

```angular-ts
import {Component} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {interval} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  template: `{{ counter() }}`,
})
export class Ticker {
  counterObservable = interval(1000);

  // Get a `Signal` representing the `counterObservable`'s value.
  counter = toSignal(this.counterObservable, {initialValue: 0});
}
```

Like the `async` pipe, `toSignal` subscribes to the Observable immediately, which may trigger side effects. The subscription created by `toSignal` automatically unsubscribes from the given Observable when the component or service which calls `toSignal` is destroyed.

IMPORTANT: `toSignal` creates a subscription. You should avoid calling it repeatedly for the same Observable, and instead reuse the signal it returns.

### Injection context

`toSignal` by default needs to run in an [injection context](guide/di/dependency-injection-context), such as during construction of a component or service. If an injection context is not available, you can manually specify the `Injector` to use instead.

### Initial values

Observables may not produce a value synchronously on subscription, but signals always require a current value. There are several ways to deal with this "initial" value of `toSignal` signals.

#### The `initialValue` option

As in the example above, you can specify an `initialValue` option with the value the signal should return before the Observable emits for the first time.

#### `undefined` initial values

If you don't provide an `initialValue`, the resulting signal will return `undefined` until the Observable emits. This is similar to the `async` pipe's behavior of returning `null`.

#### The `requireSync` option

Some Observables are guaranteed to emit synchronously, such as `BehaviorSubject`. In those cases, you can specify the `requireSync: true` option.

When `requireSync` is `true`, `toSignal` enforces that the Observable emits synchronously on subscription. This guarantees that the signal always has a value, and no `undefined` type or initial value is required.

### `manualCleanup`

By default, `toSignal` automatically unsubscribes from the Observable when the component or service that creates it is destroyed.

To override this behavior, you can pass the `manualCleanup` option. You can use this setting for Observables that complete themselves naturally.

#### Custom equality comparison

Some observables may emit values that are **equals** even though they differ by reference or minor detail. The `equal` option lets you define a **custom equal function** to determine when two consecutive values should be considered the same.

When two emitted values are considered equal, the resulting signal **does not update**. This prevents redundant computations, DOM updates, or effects from re-running unnecessarily.

```ts
import {Component} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {interval, map} from 'rxjs';

@Component(/* ... */)
export class EqualExample {
  temperature$ = interval(1000).pipe(
    map(() => ({temperature: Math.floor(Math.random() * 3) + 20})), // 20, 21, or 22 randomly
  );

  // Only update if the temperature changes
  temperature = toSignal(this.temperature$, {
    initialValue: {temperature: 20},
    equal: (prev, curr) => prev.temperature === curr.temperature,
  });
}
```

### Error and Completion

If an Observable used in `toSignal` produces an error, that error is thrown when the signal is read.

If an Observable used in `toSignal` completes, the signal continues to return the most recently emitted value before completion.

## Create an RxJS Observable from a signal with `toObservable`

Use the `toObservable` utility to create an `Observable` which tracks the value of a signal. The signal's value is monitored with an `effect` which emits the value to the Observable when it changes.

```ts
import {Component, signal} from '@angular/core';
import {toObservable} from '@angular/core/rxjs-interop';

@Component(/* ... */)
export class SearchResults {
  query: Signal<string> = inject(QueryService).query;
  query$ = toObservable(this.query);

  results$ = this.query$.pipe(switchMap((query) => this.http.get('/search?q=' + query)));
}
```

As the `query` signal changes, the `query$` Observable emits the latest query and triggers a new HTTP request.

### Injection context

`toObservable` by default needs to run in an [injection context](guide/di/dependency-injection-context), such as during construction of a component or service. If an injection context is not available, you can manually specify the `Injector` to use instead.

### Timing of `toObservable`

`toObservable` uses an effect to track the value of the signal in a `ReplaySubject`. On subscription, the first value (if available) may be emitted synchronously, and all subsequent values will be asynchronous.

Unlike Observables, signals never provide a synchronous notification of changes. Even if you update a signal's value multiple times, `toObservable` will only emit the value after the signal stabilizes.

```ts
const obs$ = toObservable(mySignal);
obs$.subscribe((value) => console.log(value));

mySignal.set(1);
mySignal.set(2);
mySignal.set(3);
```

Here, only the last value (3) will be logged.

## Using `rxResource` for async data

Angular's [`resource` function](/guide/signals/resource) gives you a way to incorporate async data into your application's signal-based code. Building on top of this pattern, `rxResource` lets you define a resource where the source of your data is defined in terms of an RxJS `Observable`. Instead of accepting a `loader` function, `rxResource` accepts a `stream` function that accepts an RxJS `Observable`.

```typescript
import {Component, inject} from '@angular/core';
import {rxResource} from '@angular/core/rxjs-interop';

@Component(/* ... */)
export class UserProfile {
  // This component relies on a service that exposes data through an RxJS Observable.
  private userData = inject(MyUserDataClient);

  protected userId = input<string>();

  private userResource = rxResource({
    params: () => ({userId: this.userId()}),

    // The `stream` property expects a factory function that returns
    // a data stream as an RxJS Observable.
    stream: ({params}) => this.userData.load(params.userId),
  });
}
```

The `stream` property accepts a factory function for an RxJS `Observable`. This factory function is passed the resource's `params` value and returns an `Observable`. The resource calls this factory function every time the `params` computation produces a new value. See [Resource loaders](/guide/signals/resource#resource-loaders) for more details on the parameters passed to the factory function.

In all other ways, `rxResource` behaves like and provides the same APIs as `resource` for specifying parameters, reading values, checking loading state, and examining errors.

# Migrating common RxJS patterns to signals

If you're moving from an RxJS-centric codebase, the following patterns show signal-based equivalents for common observable idioms.

> Signals are not a complete replacement for RxJS.
> RxJS remains the preferred solution for complex asynchronous event streams, advanced operators, and stream orchestration.

## `BehaviorSubject` → `signal`

A `BehaviorSubject` is the closest equivalent to a writable signal — both hold a current value and notify consumers on change.

### Before (RxJS)

```ts
import {BehaviorSubject} from 'rxjs';

export class CounterService {
  private _count = new BehaviorSubject(0);

  readonly count$ = this._count.asObservable();

  increment() {
    this._count.next(this._count.getValue() + 1);
  }
}
````

### After (Signals)

```ts
import {signal} from '@angular/core';

export class CounterService {
  private _count = signal(0);

  readonly count = this._count.asReadonly();

  increment() {
    this._count.update(v => v + 1);
  }
}
```

### Why use signals here?

* Simpler API surface
* No subscriptions required
* Automatic dependency tracking
* Better template integration

---

## `combineLatest` → `computed`

`combineLatest` combines multiple observable streams into one.

`computed` derives reactive state from other signals with automatic dependency tracking.

### Before (RxJS)

```ts
import {combineLatest, map} from 'rxjs';

readonly summary$ = combineLatest([
  this.firstName$,
  this.lastName$
]).pipe(
  map(([first, last]) => `${first} ${last}`)
);
```

### After (Signals)

```ts
import {computed} from '@angular/core';

readonly summary = computed(
  () => `${this.firstName()} ${this.lastName()}`
);
```

### Benefits

* Automatic dependency tracking
* Memoized derived state
* No manual subscriptions
* Cleaner reactive code

---

## Observable → `toSignal`

Use `toSignal()` to bridge existing RxJS streams into the signal ecosystem.

This is especially useful when integrating legacy services or third-party observable APIs.

### Before (RxJS)

```ts
readonly user$ = this.userService.user$;
```

### After (Signals)

```ts
import {toSignal} from '@angular/core/rxjs-interop';

readonly user = toSignal(this.userService.user$, {
  initialValue: null,
});
```

### Notes

* `toSignal()` automatically subscribes to the Observable
* Cleanup happens automatically on destroy
* An `initialValue` may be required for async streams

---

## `switchMap` + HTTP → `resource` / `rxResource`

`switchMap` is commonly used to re-fetch data when a source value changes.

Consider using `resource` or `rxResource` for signal-based async data handling.

### Before (RxJS)

```ts
import {switchMap} from 'rxjs';

readonly user$ = this.userId$.pipe(
  switchMap(id =>
    this.http.get<User>(`/api/users/${id}`)
  )
);
```

### After (Signals)

```ts
import {resource, input} from '@angular/core';

readonly userId = input<string>();

readonly userResource = resource({
  params: () => ({
    id: this.userId(),
  }),

  loader: ({params}) =>
    fetch(`/api/users/${params.id}`)
      .then(r => r.json()),
});
```

### Accessing resource state

```ts
userResource.value()
userResource.isLoading()
userResource.error()
```

### Benefits

* Built-in loading state
* Built-in error handling
* Automatic re-fetching
* Signal-native async patterns

---

## `distinctUntilChanged` → signal equality

Signals only notify consumers when the value changes using `Object.is` by default.

Provide a custom `equal` function for object values — similar to `distinctUntilChanged`.

### Before (RxJS)

```ts
import {distinctUntilChanged} from 'rxjs';

readonly activeUser$ = this.user$.pipe(
  distinctUntilChanged(
    (a, b) => a.id === b.id
  )
);
```

### After (Signals)

```ts
import {signal} from '@angular/core';

readonly activeUser = signal<User | null>(
  null,
  {
    equal: (a, b) => a?.id === b?.id,
  }
);
```

### Benefits

* Prevents unnecessary recomputation
* Avoids redundant DOM updates
* Reduces effect re-execution

---

## `debounceTime` → RxJS interop with signals

Use `toObservable()` when RxJS operators such as `debounceTime` are still needed.

### Before (RxJS)

```ts
import {debounceTime, switchMap} from 'rxjs';

readonly results$ = this.query$.pipe(
  debounceTime(300),
  switchMap(query =>
    this.http.get(`/search?q=${query}`)
  )
);
```

### After (Signals + RxJS interop)

```ts
import {signal} from '@angular/core';
import {toObservable} from '@angular/core/rxjs-interop';

import {
  debounceTime,
  switchMap,
} from 'rxjs';

readonly query = signal('');

readonly results$ = toObservable(this.query).pipe(
  debounceTime(300),

  switchMap(query =>
    this.http.get(`/search?q=${query}`)
  )
);
```

### Why keep RxJS here?

RxJS operators remain powerful for:

* debouncing
* throttling
* retries
* cancellation
* stream composition

Signals and RxJS work best together rather than replacing one another completely.

---

## `takeUntilDestroyed` → automatic cleanup

Signals and resources clean up automatically when the component or service that created them is destroyed.

Manual unsubscription is often unnecessary.

### Before (RxJS)

```ts
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

this.user$
  .pipe(takeUntilDestroyed())
  .subscribe();
```

### After (Signals)

```ts
readonly user = toSignal(this.user$);
```

### Benefits

* Automatic lifecycle cleanup
* Less boilerplate
* Reduced memory leak risk

> If you still need to use `toSignal()` with an existing Observable, the resulting signal also unsubscribes automatically on destroy.

```
```
