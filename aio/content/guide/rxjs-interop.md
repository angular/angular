# RxJS Interop

<div class="alert is-important">

The RxJS Interop package is available for [developer preview](/guide/releases#developer-preview). It's ready for you to try, but it might change before it is stable.

</div>

Angular's `@angular/core/rxjs-interop` package which provides useful utilities to integrate [Angular Signals](/guide/signals) with RxJS Observables.

## `toSignal`

The `toSignal` function creates a signal which tracks the value of an Observable. It behaves similarly to the `async` pipe in templates, but is more flexible and can be used anywhere in an application.

```ts
import {Component} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {interval} from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  standalone: true,
  template: `{{ counter() }}`,
})
export class Ticker {
  counterObservable = interval(1000);

  // Get a `Signal` representing the `counterObservable`'s value.
  counter = toSignal(this.counterObservable, {initialValue: 0});
}
```

Like the `async` pipe, `toSignal` subscribes to the Observable immediately, which may trigger side effects. The subscription created by
`toSignal` automatically unsubscribes from the given Observable upon destruction of the component in which `toSignal` is called.

### Initial values

Observables may not produce a value synchronously on subscription, but signals always require a current value. There are several ways to deal with this "initial" value of `toSignal` signals.

#### The `initialValue` option

As in the example above, the `initialValue` option specifies the value the signal should return before the Observable emits for the first time.

#### `undefined` initial values

If `initialValue` is omitted, the signal returned by `toSignal` returns `undefined` until the Observable emits. This is similar to the `async` pipe's behavior of returning `null`.

#### The `requireSync` option

Some Observables are known to emit synchronously, such as `BehaviorSubject`. In those cases, you can specify the `requireSync: true` option.

When `requiredSync` is `true`, `toSignal` enforces that the Observable emits synchronously on subscription. This guarantees that the signal always has a value, and no `undefined` type or initial value is required.

### `manualCleanup`

By default, `toSignal` automatically unsubscribes from the Observable upon destruction of the context in which it's created. For example, if `toSignal` is called during creation of a component, it cleans up its subscription when the component is destroyed.

The `manualCleanup` option disables this automatic cleanup. You can use this setting for Observables that complete themselves naturally.

### Error and Completion

If an Observable used in `toSignal` produces an error, that error is thrown when the signal is read. It's recommended that errors be handled upstream in the Observable and turned into a value instead (which might indicate to the template that an error page needs to be displayed). This can be done using the `catchError` operator in RxJS.

If an Observable used in `toSignal` completes, the signal continues to return the most recently emitted value before completion.

#### The `rejectErrors` option

`toSignal`'s default behavior for errors propagates the error channel of the `Observable` through to the signal. An alternative approach is to reject errors entirely, using the `rejectErrors` option of `toSignal`. With this option, errors are thrown back into RxJS where they'll be trapped as uncaught exceptions in the global application error handler. Since Observables no longer produce values after they error, the signal returned by `toSignal` will keep returning the last successful value received from the Observable forever. This is the same behavior as the `async` pipe has for errors.

## `toObservable`

The `toObservable` utility creates an `Observable` which tracks the value of a signal. The signal's value is monitored with an `effect`, which emits the value to the Observable when it changes.

```ts
import { Component, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

@Component(...)
export class SearchResults {
  query: Signal<string> = inject(QueryService).query;
  query$ = toObservable(this.query);

  results$ = this.query$.pipe(
    switchMap(query => this.http.get('/search?q=' + query ))
  );
}
```

As the `query` signal changes, the `query$` Observable emits the latest query and triggers a new HTTP request.

### Injection context

`toObservable` by default needs to run in an [injection context](/guide/dependency-injection-context), such as during construction of a component or service. If an injection context is not available, an `Injector` can instead be explicitly specified.

### Timing of `toObservable`

`toObservable` uses an effect to track the value of the signal in a `ReplaySubject`. On subscription, the first value (if available) may be emitted synchronously, and all subsequent values will be asynchronous.

Unlike Observables, signals never provide a synchronous notification of changes. Even if your code updates a signal's value multiple times, effects which depend on its value run only after the signal has "settled".

```ts
const obs$ = toObservable(mySignal);
obs$.subscribe((value) => console.log(value));

mySignal.set(1);
mySignal.set(2);
mySignal.set(3);
```

Here, only the last value (3) will be logged.
