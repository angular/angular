# RxJS and Signals Interoperability

Angular provides a unified reactive model by bridging **RxJS** (ideal for asynchronous event streams) and **Signals** (ideal for synchronous application state and template rendering).

Use the `@angular/core/rxjs-interop` package to convert between the two models and manage subscriptions cleanly.

---

## Converting Observables to Signals (`toSignal`)

Use `toSignal` to read values from an Observable as a reactive Signal. This allows you to bind asynchronous streams directly to templates without using the `async` pipe.

```ts
import {Component, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {UserService} from './user.service';

@Component({
  selector: 'app-user-profile',
  template: `
    @if (user()) {
      <p>Welcome, {{ user()?.name }}</p>
    }
  `,
})
export class UserProfile {
  private readonly userService = inject(UserService);

  // Convert the Observable stream to a read-only Signal
  readonly user = toSignal(this.userService.getCurrentUser());
}
```

- **Subscription Management**: `toSignal` automatically subscribes to the Observable immediately and unsubscribes when the containing component or service is destroyed.
- **Injection Context**: By default, `toSignal` must be called in an injection context (like a constructor or field initializer) to obtain the `DestroyRef` needed for automatic cleanup. If called outside of an injection context, you must explicitly pass an `Injector`:
  ```ts
  const user = toSignal(this.userService.getCurrentUser(), {injector: this.injector});
  ```
- **Initial Value**: By default, the resulting signal returns `undefined` before the Observable emits its first value. Use the `initialValue` option to set a default:
  ```ts
  readonly user = toSignal(this.userService.getCurrentUser(), {initialValue: {name: 'Guest'}});
  ```
- **Synchronous Observables**: If the Observable emits synchronously upon subscription (e.g. a `BehaviorSubject`), pass `{ requireSync: true }` to avoid an `undefined` initial type:
  ```ts
  readonly theme = toSignal(this.themeService.theme$, {requireSync: true});
  ```
- **Error Handling**: If the Observable emits an error, reading the signal will throw that error. You can catch the error using standard try/catch or an error boundary.
- **Manual Cleanup**: If the subscription should persist until the Observable naturally completes (and avoid automatic teardown tied to the component), pass `{ manualCleanup: true }`.

---

## Converting Signals to Observables (`toObservable`)

Use `toObservable` to track changes to a Signal and pipe them into RxJS operators. This is highly useful for reacting to state changes and triggering asynchronous operations (like search auto-complete).

```ts
import {Component, inject, signal} from '@angular/core';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs';
import {SearchService} from './search.service';

@Component({
  selector: 'app-search',
  template: `
    <input (input)="query.set($any($event.target).value)" />
    <ul>
      @for (item of results(); track item.id) {
        <li>{{ item.name }}</li>
      }
    </ul>
  `,
})
export class SearchComponent {
  private readonly searchService = inject(SearchService);

  readonly query = signal('');

  // 1. Convert signal query to an Observable
  // 2. Debounce and switchMap to fetch data
  // 3. Convert back to a Signal for template binding
  readonly results = toSignal(
    toObservable(this.query).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((q) => this.searchService.search(q)),
    ),
    {initialValue: []},
  );
}
```

- **Execution Timing**: `toObservable` uses an `effect` internally to monitor changes. This means emissions are asynchronous and coalesced into microtask timings.
- **Injection Context**: `toObservable` must run in an injection context (such as a constructor or field initializer) unless you explicitly pass an `Injector`:
  ```ts
  const query$ = toObservable(this.query, {injector: this.injector});
  ```

---

## Automatic Unsubscription (`takeUntilDestroyed`)

Use `takeUntilDestroyed` to automatically complete an Observable stream and clean up subscriptions when the active component, directive, or service is destroyed.

### Inside an Injection Context

When called inside a constructor or property initializer, `takeUntilDestroyed` automatically resolves the current `DestroyRef`.

```ts
import {Component, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs';

@Component({
  selector: 'app-analytics',
  template: `...`,
})
export class AnalyticsComponent {
  private readonly router = inject(Router);

  constructor() {
    // Subscription will automatically be cleaned up on component destroy
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        this.trackPageView(event.url);
      });
  }

  private trackPageView(url: string) {
    /* ... */
  }
}
```

### Outside an Injection Context

If you use `takeUntilDestroyed` inside helper methods or lifecycle hooks, you must explicitly inject and pass `DestroyRef`.

```ts
import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {interval} from 'rxjs';

@Component({
  selector: 'app-timer',
  template: `...`,
})
export class TimerComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit() {
    interval(1000)
      .pipe(
        takeUntilDestroyed(this.destroyRef), // Explicitly pass the destroy reference
      )
      .subscribe((val) => console.log(val));
  }
}
```

---

## Interoperability with Outputs (`outputFromObservable` & `outputToObservable`)

Angular allows you to bridge RxJS Observables and component outputs using `outputFromObservable` and `outputToObservable`.

### Creating Outputs from Observables (`outputFromObservable`)

Use `outputFromObservable` to declare an Angular output that is driven by an RxJS Observable.

```ts
import {Component} from '@angular/core';
import {outputFromObservable} from '@angular/core/rxjs-interop';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-search-input',
  template: `<input (input)="search$.next($any($event.target).value)" />`,
})
export class SearchInputComponent {
  readonly search$ = new Subject<string>();

  // Expose search$ as an Angular Output (emits whenever search$ emits)
  readonly search = outputFromObservable(this.search$);
}
```

- **Subscription Management**: Angular automatically manages the subscription to the underlying Observable and cleans it up when the component is destroyed.
- **Requirements**: Must be declared as a class property initializer.

### Converting Outputs to Observables (`outputToObservable`)

Use `outputToObservable` to convert an Angular output into an RxJS Observable.

```ts
import {Component, viewChild, afterNextRender} from '@angular/core';
import {outputToObservable} from '@angular/core/rxjs-interop';
import {CustomButtonComponent} from './custom-button.component';

@Component({
  selector: 'app-parent',
  imports: [CustomButtonComponent],
  template: `<app-custom-button #btn />`,
})
export class ParentComponent {
  readonly btn = viewChild(CustomButtonComponent);

  constructor() {
    afterNextRender(() => {
      const buttonInstance = this.btn();
      if (buttonInstance) {
        // Convert the click output to an Observable
        outputToObservable(buttonInstance.click).subscribe(() => {
          console.log('Button clicked!');
        });
      }
    });
  }
}
```

---

## Loading Async Data with Signals (`rxResource`)

The `rxResource` API bridges the asynchronous `Resource` pattern with RxJS. It provides a reactive, signal-based way to fetch data based on parameter changes, using an Observable-returning `loader`.

```ts
import {Component, inject, signal} from '@angular/core';
import {rxResource} from '@angular/core/rxjs-interop';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-product-details',
  template: `
    @if (productResource.isLoading()) {
      <p>Loading...</p>
    } @else if (productResource.error()) {
      <p>Error: {{ productResource.error() }}</p>
    } @else if (productResource.value()) {
      <p>Product: {{ productResource.value()?.name }}</p>
    }
  `,
})
export class ProductDetails {
  private readonly http = inject(HttpClient);
  readonly productId = signal(123);

  readonly productResource = rxResource({
    request: () => ({id: this.productId()}),
    loader: ({request}) => this.http.get<any>(`/api/products/${request.id}`),
  });
}
```

- **Reactivity**: The `request` function is evaluated reactively. Any signals read inside it (like `productId()`) will trigger the `loader` to run again when they change.
- **RxJS Loader**: Unlike standard `resource()` which requires a Promise, `rxResource` expects the `loader` to return an `Observable`.
- **State Signals**: It provides `.value()`, `.isLoading()`, `.error()`, and `.status()` as signals that you can read directly in your templates.

---

## Recommended Patterns

- **State vs Streams**: Use **Signals** for synchronous UI state, data bindings, and derived values. Use **RxJS** for asynchronous events, timers, HTTP calls, WebSockets, or multi-step coordination pipelines.
- **Async in Templates**: Prefer converting Observables to Signals with `toSignal` instead of subscribing manually or using the `async` pipe.
- **Clean Pipelines**: Do not write to signals inside an RxJS `tap` operator if you can avoid it; instead, use `toSignal` to derive the state.
