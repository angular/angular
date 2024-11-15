# Async reactivity with resources

IMPORTANT: `resource` is [experimental](reference/releases#experimental). It's ready for you to try, but it might change before it is stable.

Most signal APIs are synchronous— `signal`, `computed`, `input`, etc. However, applications often need to deal with data that is available asynchronously. A `Resource` gives you a way to incorporate async data into your application's signal-based code.

You can use a `Resource` to perform any kind of async operation, but the most common use-case for `Resource` is fetching data from a server. The following creates a resource to fetch some user data.

The easiest way to create a `Resource` is the `resource` function.

```typescript
import {resource, Signal} from '@angular/core';

const userId: Signal<string> = getUserId();

const userResource = resource({
  // Define a reactive request computation.
  // The request value recomputes whenever any read signals change.
  request: () => ({id: userId()}),

  // Define an async loader that retrieves data.
  // The resource calls this function every time the `request` value changes.
  loader: ({request}) => fetchUser(request),
});

// Created a computed based on the result of the resource's loader function.
const firstName = computed(() => userResource.value().firstName);
```

The `resource` function accepts a `ResourceOptions` object with two main properties: `request` and `loader`.

The `request` property defines a reactive computation that produce a request value. Whenever signals read in this computation change, the resource produces a new request value, similar to `computed`.

The `loader` property defines a `ResourceLoader`— an async function that retrieves some state. The resource calls the loader every time the `request` computation produces a new value, passing that value to the loader. See [Resource loaders](#resource-loaders) below for more details.

`Resource` has a `value` signal that contains the results of the loader.

## Resource loaders

When creating a resource, you specify a `ResourceLoader`. This loader is an async function that accepts a single parameter— a `ResourceLoaderParams` object— and returns a value.

The `ResourceLoaderParams` object contains three properties: `request`, `previous`, and `abortSignal`.

| Property      | Description                                                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`     | The value of the resource's `request` computation.                                                                                               |
| `previous`    | An object with a `status` property, containing the previous `ResourceStatus`.                                                                    |
| `abortSignal` | An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal). See [Aborting requests](#aborting-requests) below for details. |

### Aborting requests

A resource aborts an outstanding request if the `request` computation changes while the resource is loading.

You can use the `abortSignal` in `ResourceLoaderParams` to respond to aborted requests. For example, the native `fetch` function accepts an `AbortSignal`:

```typescript
const userId: Signal<string> = getUserId();

const userResource = resource({
  request: () => ({id: userId()}),
  loader: ({request, abortSignal}): Promise<User> => {
    // fetch cancels any outstanding HTTP requests when the given `AbortSignal`
    // indicates that the request has been aborted.
    return fetch(`users/${request.id}`, {signal: abortSignal});
  },
});
```

See [`AbortSignal` on MDN](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) for more details on request cancellation with `AbortSignal`.

### Reloading

You can programmatically trigger a resource's `loader` by calling the `reload` method.

```typescript
const userId: Signal<string> = getUserId();

const userResource = resource({
  request: () => ({id: userId()}),
  loader: ({request}) => fetchUser(request),
});

// ...

userResource.reload();
```

### `undefined` requests

A request value of `undefined` prevents the resource from running its loader, and will put the resource into an `Idle` state.

## Resource status

The resource object has several signal properties for reading the status of the asynchronous loader.

| Property    | Description                                                                                                     |
| ----------- | --------------------------------------------------------------------------------------------------------------- |
| `value`     | The most recent value of the resource, or `undefined` if no value has been recieved.                            |
| `hasValue`  | Whether the resource has a value.                                                                               |
| `error`     | The most recent error encountered while running the resource's loader, or `undefined` if no error has occurred. |
| `isLoading` | Whether the resource loader is currently running.                                                               |
| `status`    | The resource's specific `ResourceStatus`, as described below.                                                   |

The `status` signal provides a specific `ResourceStatus` that describes the state of the resource.

| Status      | `value()`         | Description                                                                  |
| ----------- | :---------------- | ---------------------------------------------------------------------------- |
| `Idle`      | `undefined`       | The resource has no valid request and the loader has not run.                |
| `Error`     | `undefined`       | The loader has encountered an error.                                         |
| `Loading`   | `undefined`       | The loader is running as a result of the `request` value changing.           |
| `Reloading` | Previous value    | The loader is running as a result calling of the resource's `reload` method. |
| `Resolved`  | Resolved value    | The loader has completed.                                                    |
| `Local`     | Locally set value | The resource's value has been set locally via `.set()` or `.update()`        |

You can use this status information to conditionally display user interface elements, such loading indicators and error messages.
