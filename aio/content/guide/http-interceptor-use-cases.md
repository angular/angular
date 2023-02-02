# HTTP -  interceptor use-cases

Following are a number of common uses for interceptors.

## Set default headers

Apps often use an interceptor to set default headers on outgoing requests.

The sample app has an `AuthService` that produces an authorization token.
Here is its `AuthInterceptor` that injects that service to get the token and adds an authorization header with that token to every outgoing request:

<code-example header="app/http-interceptors/auth-interceptor.ts" path="http/src/app/http-interceptors/auth-interceptor.ts"></code-example>

The practice of cloning a request to set new headers is so common that there's a `setHeaders` shortcut for it:

<code-example path="http/src/app/http-interceptors/auth-interceptor.ts" region="set-header-shortcut"></code-example>

An interceptor that alters headers can be used for a number of different operations, including:

*   Authentication/authorization
*   Caching behavior; for example, `If-Modified-Since`
*   XSRF protection

## Log request and response pairs

Because interceptors can process the request and response *together*, they can perform tasks such as timing and logging an entire HTTP operation.

Consider the following `LoggingInterceptor`, which captures the time of the request,
the time of the response, and logs the outcome with the elapsed time
with the injected `MessageService`.

<code-example header="app/http-interceptors/logging-interceptor.ts)" path="http/src/app/http-interceptors/logging-interceptor.ts" region="excerpt"></code-example>

The RxJS `tap` operator captures whether the request succeeded or failed.
The RxJS `finalize` operator is called when the response observable either returns an error or completes and reports the outcome to the `MessageService`.

Neither `tap` nor `finalize` touch the values of the observable stream returned to the caller.

<a id="custom-json-parser"></a>

## Custom JSON parsing

Interceptors can be used to replace the built-in JSON parsing with a custom implementation.

The `CustomJsonInterceptor` in the following example demonstrates how to achieve this.
If the intercepted request expects a `'json'` response, the `responseType` is changed to `'text'` to disable the built-in JSON parsing.
Then the response is parsed via the injected `JsonParser`.

<code-example header="app/http-interceptors/custom-json-interceptor.ts" path="http/src/app/http-interceptors/custom-json-interceptor.ts" region="custom-json-interceptor"></code-example>

You can then implement your own custom `JsonParser`.
Here is a custom JsonParser that has a special date reviver.

<code-example header="app/http-interceptors/custom-json-interceptor.ts" path="http/src/app/http-interceptors/custom-json-interceptor.ts" region="custom-json-parser"></code-example>

You provide the `CustomParser` along with the `CustomJsonInterceptor`.

<code-example header="app/http-interceptors/index.ts" path="http/src/app/http-interceptors/index.ts" region="custom-json-interceptor"></code-example>

<a id="caching"></a>

## Cache requests

Interceptors can handle requests by themselves, without forwarding to `next.handle()`.

For example, you might decide to cache certain requests and responses to improve performance.
You can delegate caching to an interceptor without disturbing your existing data services.

The `CachingInterceptor` in the following example demonstrates this approach.

<code-example header="app/http-interceptors/caching-interceptor.ts)" path="http/src/app/http-interceptors/caching-interceptor.ts" region="v1"></code-example>

*   The `isCacheable()` function determines if the request is cacheable.
    In this sample, only GET requests to the package search API are cacheable.

*   If the request is not cacheable, the interceptor forwards the request to the next handler in the chain
*   If a cacheable request is found in the cache, the interceptor returns an `of()` *observable* with the cached response, by-passing the `next` handler and all other interceptors downstream
*   If a cacheable request is not in cache, the code calls `sendRequest()`.
    This function forwards the request to `next.handle()` which ultimately calls the server and returns the server's response.

<a id="send-request"></a>

<code-example path="http/src/app/http-interceptors/caching-interceptor.ts" region="send-request"></code-example>

<div class="alert is-helpful">

Notice how `sendRequest()` intercepts the response on its way back to the application.
This method pipes the response through the `tap()` operator, whose callback adds the response to the cache.

The original response continues untouched back up through the chain of interceptors to the application caller.

Data services, such as `PackageSearchService`, are unaware that some of their `HttpClient` requests actually return cached responses.

</div>


<a id="cache-refresh"></a>

## Use interceptors to request multiple values

The `HttpClient.get()` method normally returns an observable that emits a single value, either the data or an error.
An interceptor can change this to an observable that emits [multiple values](guide/observables).

The following revised version of the `CachingInterceptor` optionally returns an observable that immediately emits the cached response, sends the request on to the package search API, and emits again later with the updated search results.

<code-example path="http/src/app/http-interceptors/caching-interceptor.ts" region="intercept-refresh"></code-example>

<div class="alert is-helpful">

The *cache-then-refresh* option is triggered by the presence of a custom `x-refresh` header.

A checkbox on the `PackageSearchComponent` toggles a `withRefresh` flag, which is one of the arguments to `PackageSearchService.search()`.
That `search()` method creates the custom `x-refresh` header and adds it to the request before calling `HttpClient.get()`.

</div>

The revised `CachingInterceptor` sets up a server request whether there's a cached value or not, using the same `sendRequest()` method described [above](#send-request).
The `results$` observable makes the request when subscribed.

*   If there's no cached value, the interceptor returns `results$`.
*   If there is a cached value, the code *pipes* the cached response onto `results$`. This produces a recomposed observable that emits two responses, so subscribers will see a sequence of these two responses:  
  *   The cached response that's emitted immediately
  *   The response from the server, that's emitted later

<a id="report-progress"></a>

@reviewed 2022-11-08
