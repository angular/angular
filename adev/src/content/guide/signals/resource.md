# Async reactivity with resources

All signal APIs are synchronous— `signal`, `computed`, `input`, etc. However, applications often need to deal with data that is available asynchronously. A `Resource` gives you a way to incorporate async data into your application's signal-based code and still allow you to access its data synchronously.

You can use a `Resource` to perform any kind of async operation, but the most common use-case for `Resource` is fetching data from a server. The following example creates a resource to fetch some user data.

The easiest way to create a `Resource` is the `resource` function.

```typescript
import {resource, Signal} from '@angular/core';

const userId: Signal<string> = getUserId();

const userResource = resource({
  // Define a reactive computation.
  // The params value recomputes whenever any read signals change.
  params: () => ({id: userId()}),

  // Define an async loader that retrieves data.
  // The resource calls this function every time the `params` value changes.
  loader: ({params}) => fetchUser(params),
});

// Create a computed signal based on the result of the resource's loader function.
const firstName = computed(() => {
  if (userResource.hasValue()) {
    // `hasValue` serves 2 purposes:
    // - It acts as type guard to strip `undefined` from the type
    // - It protects against reading a throwing `value` when the resource is in error state
    return userResource.value().firstName;
  }

  // fallback in case the resource value is `undefined` or if the resource is in error state
  return undefined;
});
```

The `resource` function accepts a `ResourceOptions` object with two main properties: `params` and `loader`.

The `params` property defines a reactive computation that produces a parameter value. Whenever signals read in this computation change, the resource produces a new parameter value, similar to `computed`.

The `loader` property defines a `ResourceLoader`— an async function that retrieves some state. The resource calls the loader every time the `params` computation produces a new value, passing that value to the loader. See [Resource loaders](#resource-loaders) below for more details.

`Resource` has a `value` signal that contains the results of the loader.

## Resource loaders

When creating a resource, you specify a `ResourceLoader`. This loader is an async function that accepts a single parameter— a `ResourceLoaderParams` object— and returns a value.

The `ResourceLoaderParams` object contains three properties: `params`, `previous`, and `abortSignal`.

| Property      | Description                                                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `params`      | The value of the resource's `params` computation.                                                                                                |
| `previous`    | An object with a `status` property, containing the previous `ResourceStatus`.                                                                    |
| `abortSignal` | An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal). See [Aborting requests](#aborting-requests) below for details. |

If the `params` computation returns `undefined`, the loader function does not run and the resource status becomes `'idle'`.

### Aborting requests

A resource aborts an outstanding loading operation if the `params` computation changes while the resource is loading.

You can use the `abortSignal` in `ResourceLoaderParams` to respond to aborted requests. For example, the native `fetch` function accepts an `AbortSignal`:

```typescript
const userId: Signal<string> = getUserId();

const userResource = resource({
  params: () => ({id: userId()}),
  loader: ({params, abortSignal}): Promise<User> => {
    // fetch cancels any outstanding HTTP requests when the given `AbortSignal`
    // indicates that the request has been aborted.
    return fetch(`users/${params.id}`, {signal: abortSignal});
  },
});
```

See [`AbortSignal` on MDN](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) for more details on request cancellation with `AbortSignal`.

### Reloading

You can programmatically trigger a resource's `loader` by calling the `reload` method.

```typescript
const userId: Signal<string> = getUserId();

const userResource = resource({
  params: () => ({id: userId()}),
  loader: ({params}) => fetchUser(params),
});

// ...

userResource.reload();
```

## Resource status

The resource object has several signal properties for reading the status of the asynchronous loader.

| Property    | Description                                                                                                     |
| ----------- | --------------------------------------------------------------------------------------------------------------- |
| `value`     | The most recent value of the resource, or `undefined` if no value has been received.                            |
| `hasValue`  | Whether the resource has a value.                                                                               |
| `error`     | The most recent error encountered while running the resource's loader, or `undefined` if no error has occurred. |
| `isLoading` | Whether the resource loader is currently running.                                                               |
| `status`    | The resource's specific `ResourceStatus`, as described below.                                                   |

The `status` signal provides a specific `ResourceStatus` that describes the state of the resource using a string constant.

| Status        | `value()`         | Description                                                                  |
| ------------- | :---------------- | ---------------------------------------------------------------------------- |
| `'idle'`      | `undefined`       | The resource has no valid request and the loader has not run.                |
| `'error'`     | `undefined`       | The loader has encountered an error.                                         |
| `'loading'`   | `undefined`       | The loader is running as a result of the `params` value changing.            |
| `'reloading'` | Previous value    | The loader is running as a result of calling the resource's `reload` method. |
| `'resolved'`  | Resolved value    | The loader has completed.                                                    |
| `'local'`     | Locally set value | The resource's value has been set locally via `.set()` or `.update()`        |

You can use this status information to conditionally display user interface elements, such as loading indicators and error messages.

## Caching `resource` data with SSR

When an application renders on the server, a resource loader runs once to produce the initial HTML. During hydration, the browser normally runs the same loader again.

To reuse the server result, provide an `id` for the resource. Angular stores the resolved value in `TransferState` on the server and uses it on the client to initialize the resource in a `'resolved'` state.

```ts
const userId: Signal<string> = getUserId();

const userResource = resource({
  params: () => ({id: userId()}),
  loader: ({params}) => fetchUser(params),
  id: 'user-unique-id',
});
```

The `id` value must be unique within your application and identical on the server and the client so that Angular can match the cached entry to the resource that requested it.

IMPORTANT: Because the cached value is serialized into the page's HTML, avoid setting `id` on resources that load data specific to the user who triggered the server-side render, especially if the rendered HTML can be cached or shared between users.

## Chaining resources

Sometimes one resource depends on the result of another. You can express this dependency using the `chain` function available in the `params` context object.

```typescript
import {resource} from '@angular/core';

const userResource = resource({
  params: () => ({id: getUserId()}),
  loader: ({params}) => fetchUser(params),
});

const userPostsResource = resource({
  params: ({chain}) => ({userId: chain(userResource).id}),
  loader: ({params}) => fetchPostsForUser(params.userId),
});
```

`chain(userResource)` returns the resolved value of `userResource` and automatically propagates its status to `userPostsResource`:

- If `userResource` is **loading**, `userPostsResource` also enters the `loading` state and its loader does not run.
- If `userResource` is **idle**, `userPostsResource` also becomes `idle`.
- If `userResource` is in an **error** state, `userPostsResource` also enters the `error` state.
- If `userResource` is **resolved**, `chain` returns its value so `userPostsResource` can use it as params.

This means you never need to manually guard against `undefined` when chaining — the status propagates automatically.

### Chaining vs. reading resource values directly

You might be tempted to read a resource's value directly inside `params`:

```typescript
// Avoid: reads value() directly without status propagation
const userPostsResource = resource({
  params: () => {
    const user = userResource.value(); // may be undefined
    return user ? {userId: user.id} : undefined;
  },
  loader: ({params}) => fetchPostsForUser(params.userId),
});
```

While this works, returning `undefined` from `params` makes the resource go `idle` rather than reflecting the actual state of the upstream resource. Using `chain` is preferred because it correctly mirrors `loading` and `error` states.

### Synchronously transforming a resource value

`chain` is also useful when you want to map a resource's resolved value synchronously while the loader remains async:

```typescript
const numericResource = resource({
  params: () => ({}),
  loader: async () => 42,
});

const stringResource = resource({
  params: ({chain}) => ({value: chain(numericResource)}),
  loader: async ({params}) => `The answer is ${params.value}`,
});
```

Note that `stringResource` will only start loading once `numericResource` has resolved. If you only need a synchronous transformation and no additional async work, prefer `computed` over a chained resource.

## Reactive data fetching with `httpResource`

[`httpResource`](/guide/http/http-resource) is a wrapper around `HttpClient` that gives you the request status and response as signals. It makes HTTP requests through the Angular HTTP stack, including interceptors.

## Resource composition with snapshots

A `ResourceSnapshot` is a structured representation of a resource's current state. Every resource has a `snapshot` property that provides a signal of its current state.

```ts
const userId: Signal<string> = getUserId();

const userResource = resource({
  params: () => ({id: userId()}),
  loader: ({params}) => fetchUser(params),
});

const userSnapshot = userResource.snapshot;
```

Each snapshot contains a `status` and either a `value` or an `error`.

### Composing resources with snapshots

You can create new resources from snapshots using `resourceFromSnapshots`. This enables composition with signal APIs like `computed` and `linkedSignal` to transform resource behavior.

```ts
import {linkedSignal, resourceFromSnapshots, Resource, ResourceSnapshot} from '@angular/core';

function withPreviousValue<T>(input: Resource<T>): Resource<T> {
  const derived = linkedSignal<ResourceSnapshot<T>, ResourceSnapshot<T>>({
    source: input.snapshot,
    computation: (snap, previous) => {
      if (snap.status === 'loading' && previous && previous.value.status !== 'error') {
        // When the input resource enters loading state, we keep the value
        // from its previous state, if any.
        return {status: 'loading' as const, value: previous.value.value};
      }

      // Otherwise we simply forward the state of the input resource.
      return snap;
    },
  });

  return resourceFromSnapshots(derived);
}

@Component({
  /*... */
})
export class AwesomeProfile {
  userId = input.required<number>();
  user = withPreviousValue(httpResource(() => `/user/${this.userId()}`));
  // When userId changes, user.value() keeps the old user data until the new one loads
}
```
