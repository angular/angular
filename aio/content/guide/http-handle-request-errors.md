# HTTP client - Handle request errors

If the request fails on the server, `HttpClient` returns an *error* object instead of a successful response.

The same service that performs your server transactions should also perform error inspection, interpretation, and resolution.

When an error occurs, you can obtain details of what failed to inform your user.
In some cases, you might also automatically [retry the request](#retry).

<a id="error-details"></a>

## Getting error details

An app should give the user useful feedback when data access fails.
A raw error object is not particularly useful as feedback.
In addition to detecting that an error has occurred, you need to get error details and use those details to compose a user-friendly response.

Two types of errors can occur.

*   The server backend might reject the request, returning an HTTP response with a status code such as 404 or 500.
    These are error *responses*.

*   Something could go wrong on the client-side such as a network error that prevents the request from completing successfully or an exception thrown in an RxJS operator.
    These errors have `status` set to `0` and the `error` property contains a `ProgressEvent` object, whose `type` might provide further information.

`HttpClient` captures both kinds of errors in its `HttpErrorResponse`.
Inspect that response to identify the error's cause.

The following example defines an error handler in the previously defined ConfigService.

<code-example header="app/config/config.service.ts (handleError)" path="http/src/app/config/config.service.ts" region="handleError"></code-example>

The handler returns an RxJS `ErrorObservable` with a user-friendly error message.
The following code updates the `getConfig()` method, using a [pipe](guide/pipes "Pipes guide") to send all observables returned by the `HttpClient.get()` call to the error handler.

<code-example header="app/config/config.service.ts (getConfig v.3 with error handler)" path="http/src/app/config/config.service.ts" region="getConfig_3"></code-example>

<a id="retry"></a>

## Retrying a failed request

Sometimes the error is transient and goes away automatically if you try again.
For example, network interruptions are common in mobile scenarios, and trying again can produce a successful result.

The [RxJS library](guide/rx-library) offers several *retry* operators.
For example, the `retry()` operator automatically re-subscribes to a failed `Observable` a specified number of times.
*Re-subscribing* to the result of an `HttpClient` method call has the effect of reissuing the HTTP request.

The following example shows how to pipe a failed request to the `retry()` operator before passing it to the error handler.

<code-example header="app/config/config.service.ts (getConfig with retry)" path="http/src/app/config/config.service.ts" region="getConfig"></code-example>

## Sending data to a server

In addition to fetching data from a server, `HttpClient` supports other HTTP methods such as PUT, POST, and DELETE, which you can use to modify the remote data.

The sample app for this guide includes an abridged version of the "Tour of Heroes" example that fetches heroes and enables users to add, delete, and update them.
The following sections show examples of the data-update methods from the sample's `HeroesService`.

@reviewed 2023-02-27
