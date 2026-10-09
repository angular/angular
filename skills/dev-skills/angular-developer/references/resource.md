# Async Reactivity with `resource`

A `Resource` incorporates asynchronous data fetching into Angular's signal-based reactivity. It executes an async loader function whenever its dependencies change, exposing the status and result as synchronous signals.

## Basic Usage

The `resource` function accepts an options object with two main properties:

1. `params`: A reactive computation (like `computed`). When signals read here change, the resource re-fetches.
2. `loader`: An async function that fetches data based on the parameters.

```ts
import { Component, resource, signal, computed } from '@angular/core';

@Component({...})
export class UserProfile {
  protected readonly userId = signal('123');

  protected readonly userResource = resource({
    // Reactively tracking userId
    params: () => ({ id: this.userId() }),

    // Executes whenever params change
    loader: async ({ params, abortSignal }) => {
      const response = await fetch(`/api/users/${params.id}`, { signal: abortSignal });
      if (!response.ok) throw new Error('Network error');
      return response.json();
    }
  });

  // Use the resource value in computed signals
  protected readonly userName = computed(() => {
    if (this.userResource.hasValue()) {
      return this.userResource.value()?.name;
    } else if (this.userResource.error()) {
      return 'Failed to load';
    } else {
      return 'Loading...';
    }
  });
}
```

## Aborting Requests

If the `params` signal changes while a previous loader is still running, the `Resource` will attempt to abort the outstanding request using the provided `abortSignal`. **Always pass `abortSignal` to your `fetch` calls.**

## Reloading Data

You can imperatively force the resource to re-run the loader without the params changing by calling `.reload()`.

```ts
this.userResource.reload();
```

## Resource Status Signals

The `Resource` object provides several signals to read its current state:

- `value()`: The resolved data, or `undefined` if there is none yet. **Throws if the resource is in the `'error'` status**, so guard reads with `hasValue()` or check `error()` first.
- `hasValue()`: Type-guard boolean. `true` if a value exists. It is `false` (and does not throw) in the `'error'` status.
- `isLoading()`: Boolean indicating if the loader is currently running (`'loading'` or `'reloading'`).
- `error()`: The error thrown by the loader, or `undefined`.
- `status()`: A string constant representing the exact state (`'idle'`, `'loading'`, `'resolved'`, `'error'`, `'reloading'`, `'local'`).

| `status()`    | `value()`                    | Meaning                                                   |
| ------------- | ---------------------------- | --------------------------------------------------------- |
| `'idle'`      | `undefined`                  | `params` returned `undefined`, so the loader did not run. |
| `'loading'`   | `undefined`                  | The loader is running because `params` changed.           |
| `'reloading'` | the previous value           | The loader is running because of `.reload()`.             |
| `'resolved'`  | the loaded value             | The loader completed.                                     |
| `'error'`     | **throws**                   | The loader threw or rejected.                             |
| `'local'`     | the value passed to `.set()` | The value was set locally.                                |

Do not read `value()` directly in a template or computed signal without a guard, because a failed request would throw there.

## Local Mutation

You can optimistically update the resource's value directly. This changes the status to `'local'`.

```ts
this.userResource.value.set({name: 'Optimistic Update'});
```

## Reactive Data Fetching with `httpResource`

If you are using Angular's `HttpClient`, prefer using `httpResource`. It is a specialized wrapper that leverages the Angular HTTP stack (including interceptors) while providing the same signal-based resource API.
