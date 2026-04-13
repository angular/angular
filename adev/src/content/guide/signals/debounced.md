# Debouncing signals with `debounced`

IMPORTANT: `debounced` is [experimental](reference/releases#experimental). It's ready for you to try, but it might change before it is stable.

Use `debounced` to delay reacting to a signal's value until it stops changing. It returns a `Resource` whose value reflects the debounced value of the source signal.

```angular-ts
import {debounced, resource, signal} from '@angular/core';

@Component({
  template: `
    <input (input)="query.set($event.target.value)" />

    @if (results.isLoading()) {
      <p>Searching…</p>
    }
    @for (item of results.value(); track item.id) {
      <li>{{ item.name }}</li>
    }
  `,
})
export class Search {
  query = signal('');

  debouncedQuery = debounced(this.query, 300);

  results = resource({
    params: () => this.debouncedQuery.value(),
    loader: ({params}) => fetchResults(params),
  });
}
```

`debounced` takes the source signal and a wait duration in milliseconds. The returned resource's `value()` always contains the last settled value, and `status()` tells you whether a new value is still pending.

## Status during debounce

While the debounce timer is counting down, `status()` is `'loading'` and `value()` returns the previously resolved value. When the timer expires, the resource settles to `'resolved'`. If the source signal throws, the resource enters `'error'` immediately no timer runs.

See [Resource status](/guide/signals/resource#resource-status) for the full list of statuses and their `value()` behavior.

## Custom wait function

Instead of a millisecond duration, you can pass a function that returns a `Promise<void>`. The resource resolves when the promise resolves. If the source signal changes before the promise settles, Angular discards the previous promise and starts a new one.

```ts
debouncedQuery = debounced(query, (value, lastSnapshot) => {
  // Retry immediately after an error rather than making the user wait again.
  if (lastSnapshot.status === 'error') return;
  // Short queries get a longer delay—the user is likely still typing.
  const ms = value.length < 3 ? 500 : 200;
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
});
```

See the `DebounceTimer` type in the API reference for details.

## Equality

By default, `debounced` uses `Object.is` to compare values.

Provide a custom equality function with the `equal` option when the default identity check is too strict:

```ts
debouncedFilter = debounced(filter, 200, {
  equal: (a, b) => a.category === b.category && a.minPrice === b.minPrice,
});
```

## Injection context

`debounced` must be called inside an [injection context](guide/di/dependency-injection-context). Angular automatically destroys the debounced resource and cancels any pending timer when the injector is destroyed.

To use `debounced` outside of an injection context, pass an explicit `Injector` via the options:

```ts
@Injectable({providedIn: 'root'})
export class SearchService {
  private injector = inject(Injector);

  createDebouncedQuery(query: Signal<string>): Resource<string> {
    return debounced(query, 300, {injector: this.injector});
  }
}
```
