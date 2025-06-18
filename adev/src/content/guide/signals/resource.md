# Async reactivity with resources

IMPORTANT: `resource` is [experimental](reference/releases#experimental). It's ready for you to try, but it might change before it is stable.

Most signal APIs are synchronous— `signal`, `computed`, `input`, etc. However, applications often need to deal with data that is available asynchronously. A `Resource` gives you a way to incorporate async data into your application's signal-based code.

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
const firstName = computed(() => userResource.value().firstName);
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
| `'loading'`   | `undefined`       | The loader is running as a result of the `request` value changing.           |
| `'reloading'` | Previous value    | The loader is running as a result calling of the resource's `reload` method. |
| `'resolved'`  | Resolved value    | The loader has completed.                                                    |
| `'local'`     | Locally set value | The resource's value has been set locally via `.set()` or `.update()`        |

You can use this status information to conditionally display user interface elements, such loading indicators and error messages.

## Reactive data fetching with `httpResource`

[`httpResource`](/guide/http/httpResource) is a wrapper around `HttpClient` that gives you the request status and response as signals. It makes HTTP requests through the Angular HTTP stack, including interceptors.