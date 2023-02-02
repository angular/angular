# HTTP - Pass metadata to interceptors

Many interceptors require or benefit from configuration.
Consider an interceptor that retries failed requests.
By default, the interceptor might retry a request three times, but you might want to override this retry count for particularly error-prone or sensitive requests.

`HttpClient` requests contain a *context* that can carry metadata about the request.
This context is available for interceptors to read or modify, though it is not transmitted to the backend server when the request is sent.
This lets applications or other interceptors tag requests with configuration parameters, such as how many times to retry a request.

## Create a context token

Angular stores and retrieves a value in the context using an `HttpContextToken`.
You can create a context token using the `new` operator, as in the following example:

<code-example header="creating a context token" path="http/src/app/http-interceptors/retry-interceptor.ts" region="context-token"></code-example>

The lambda function `() => 3` passed during the creation of the `HttpContextToken` serves two purposes:

1.  It lets TypeScript infer the type of this token:
    `HttpContextToken<number>`
    The request context is type-safe &mdash;reading a token from a request's context returns a value of the appropriate type.

1.  It sets the default value for the token.
    This is the value that the request context returns if no other value was set for this token.
    Using a default value avoids the need to check if a particular value is set.

## Set context values when making a request

When making a request, you can provide an `HttpContext` instance, in which you have already set the context values.

<code-example header="setting context values" path="http/src/app/http-interceptors/retry-interceptor.ts" region="set-context"></code-example>

## Read context values in an interceptor

Within an interceptor, you can read the value of a token in a given request's context with `HttpContext.get()`.
If you have not explicitly set a value for the token, Angular returns the default value specified in the token.

<code-example header="reading context values in an interceptor" path="http/src/app/http-interceptors/retry-interceptor.ts" region="reading-context"></code-example>

## Contexts are mutable

Unlike most other aspects of `HttpRequest` instances, the request context is mutable and persists across other immutable transformations of the request.
This lets interceptors coordinate operations through the context.
For instance, the `RetryInterceptor` example could use a second context token to track how many errors occur during the execution of a given request:

<code-example header="coordinating operations through the context" path="http/src/app/http-interceptors/retry-interceptor.ts" region="mutable-context"></code-example>

@reviewed 2022-11-15
