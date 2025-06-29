# Making HTTP requests

`HttpClient` has methods corresponding to the different HTTP verbs used to make requests, both to load data and to apply mutations on the server. Each method returns an [RxJS `Observable`](https://rxjs.dev/guide/observable) which, when subscribed, sends the request and then emits the results when the server responds.

NOTE: `Observable`s created by `HttpClient` may be subscribed any number of times and will make a new backend request for each subscription.

Through an options object passed to the request method, various properties of the request and the returned response type can be adjusted.

## Fetching JSON data

Fetching data from a backend often requires making a GET request using the [`HttpClient.get()`](api/common/http/HttpClient#get) method. This method takes two arguments: the string endpoint URL from which to fetch, and an *optional options* object to configure the request.

For example, to fetch configuration data from a hypothetical API using the `HttpClient.get()` method:

<docs-code language="ts">
http.get<Config>('/api/config').subscribe(config => {
  // process the configuration.
});
</docs-code>

Note the generic type argument which specifies that the data returned by the server will be of type `Config`. This argument is optional, and if you omit it then the returned data will have type `Object`.

TIP: When dealing with data of uncertain structure and potential `undefined` or `null` values, consider using the `unknown` type instead of `Object` as the response type.

CRITICAL: The generic type of request methods is a type **assertion** about the data returned by the server. `HttpClient` does not verify that the actual return data matches this type.

## Fetching other types of data

By default, `HttpClient` assumes that servers will return JSON data. When interacting with a non-JSON API, you can tell `HttpClient` what response type to expect and return when making the request. This is done with the `responseType` option.

| **`responseType` value** | **Returned response type** |
| - | - |
| `'json'` (default) | JSON data of the given generic type |
| `'text'` | string data |
| `'arraybuffer'` | [`ArrayBuffer`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) containing the raw response bytes |
| `'blob'` | [`Blob`](https://developer.mozilla.org/docs/Web/API/Blob) instance |

For example, you can ask `HttpClient` to download the raw bytes of a `.jpeg` image into an `ArrayBuffer`:

<docs-code language="ts">
http.get('/images/dog.jpg', {responseType: 'arraybuffer'}).subscribe(buffer => {
  console.log('The image is ' + buffer.byteLength + ' bytes large');
});
</docs-code>

<docs-callout important title="Literal value for `responseType`">
Because the value of `responseType` affects the type returned by `HttpClient`, it must have a literal type and not a `string` type.

This happens automatically if the options object passed to the request method is a literal object, but if you're extracting the request options out into a variable or helper method you might need to explicitly specify it as a literal, such as `responseType: 'text' as const`.
</docs-callout>

## Mutating server state

Server APIs which perform mutations often require making POST requests with a request body specifying the new state or the change to be made.

The [`HttpClient.post()`](api/common/http/HttpClient#post) method behaves similarly to `get()`, and accepts an additional `body` argument before its options:

<docs-code language="ts">
http.post<Config>('/api/config', newConfig).subscribe(config => {
  console.log('Updated config:', config);
});
</docs-code>

Many different types of values can be provided as the request's `body`, and `HttpClient` will serialize them accordingly:

| **`body` type** | **Serialized as** |
| - | - |
| string | Plain text |
| number, boolean, array, or plain object | JSON |
| [`ArrayBuffer`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | raw data from the buffer |
| [`Blob`](https://developer.mozilla.org/docs/Web/API/Blob) | raw data with the `Blob`'s content type |
| [`FormData`](https://developer.mozilla.org/docs/Web/API/FormData) | `multipart/form-data` encoded data |
| [`HttpParams`](api/common/http/HttpParams) or [`URLSearchParams`](https://developer.mozilla.org/docs/Web/API/URLSearchParams) | `application/x-www-form-urlencoded` formatted string |

IMPORTANT: Remember to `.subscribe()` to mutation request `Observable`s in order to actually fire the request.

## Setting URL parameters

Specify request parameters that should be included in the request URL using the `params` option.

Passing an object literal is the simplest way of configuring URL parameters:

<docs-code language="ts">
http.get('/api/config', {
  params: {filter: 'all'},
}).subscribe(config => {
  // ...
});
</docs-code>

Alternatively, pass an instance of `HttpParams` if you need more control over the construction or serialization of the parameters.

IMPORTANT: Instances of `HttpParams` are _immutable_ and cannot be directly changed. Instead, mutation methods such as `append()` return a new instance of `HttpParams` with the mutation applied.

<docs-code language="ts">
const baseParams = new HttpParams().set('filter', 'all');

http.get('/api/config', {
  params: baseParams.set('details', 'enabled'),
}).subscribe(config => {
  // ...
});
</docs-code>

You can instantiate `HttpParams` with a custom `HttpParameterCodec` that determines how `HttpClient` will encode the parameters into the URL.

## Setting request headers

Specify request headers that should be included in the request using the `headers` option.

Passing an object literal is the simplest way of configuring request headers:

<docs-code language="ts">
http.get('/api/config', {
  headers: {
    'X-Debug-Level': 'verbose',
  }
}).subscribe(config => {
  // ...
});
</docs-code>

Alternatively, pass an instance of `HttpHeaders` if you need more control over the construction of headers

IMPORTANT: Instances of `HttpHeaders` are _immutable_ and cannot be directly changed. Instead, mutation methods such as `append()` return a new instance of `HttpHeaders` with the mutation applied.

<docs-code language="ts">
const baseHeaders = new HttpHeaders().set('X-Debug-Level', 'minimal');

http.get<Config>('/api/config', {
  headers: baseHeaders.set('X-Debug-Level', 'verbose'),
}).subscribe(config => {
  // ...
});
</docs-code>

## Interacting with the server response events

For convenience, `HttpClient` by default returns an `Observable` of the data returned by the server (the response body). Occasionally it's desirable to examine the actual response, for example to retrieve specific response headers.

To access the entire response, set the `observe` option to `'response'`:

<docs-code language="ts">
http.get<Config>('/api/config', {observe: 'response'}).subscribe(res => {
  console.log('Response status:', res.status);
  console.log('Body:', res.body);
});
</docs-code>

<docs-callout important title="Literal value for `observe`">
Because the value of `observe` affects the type returned by `HttpClient`, it must have a literal type and not a `string` type.

This happens automatically if the options object passed to the request method is a literal object, but if you're extracting the request options out into a variable or helper method you might need to explicitly specify it as a literal, such as `observe: 'response' as const`.
</docs-callout>

## Receiving raw progress events

In addition to the response body or response object, `HttpClient` can also return a stream of raw _events_ corresponding to specific moments in the request lifecycle. These events include when the request is sent, when the response header is returned, and when the body is complete. These events can also include _progress events_ which report upload and download status for large request or response bodies.

Progress events are disabled by default (as they have a performance cost) but can be enabled with the `reportProgress` option.

NOTE: The optional `fetch` implementation of `HttpClient` does not report _upload_ progress events.

To observe the event stream, set the `observe` option to `'events'`:

<docs-code language="ts">
http.post('/api/upload', myData, {
  reportProgress: true,
  observe: 'events',
}).subscribe(event => {
  switch (event.type) {
    case HttpEventType.UploadProgress:
      console.log('Uploaded ' + event.loaded + ' out of ' + event.total + ' bytes');
      break;
    case HttpEventType.Response:
      console.log('Finished uploading!');
      break;
  }
});
</docs-code>

<docs-callout important title="Literal value for `observe`">
Because the value of `observe` affects the type returned by `HttpClient`, it must have a literal type and not a `string` type.

This happens automatically if the options object passed to the request method is a literal object, but if you're extracting the request options out into a variable or helper method you might need to explicitly specify it as a literal, such as `observe: 'events' as const`.
</docs-callout>

Each `HttpEvent` reported in the event stream has a `type` which distinguishes what the event represents:

| **`type` value** | **Event meaning** |
| - | - |
| `HttpEventType.Sent` | The request has been dispatched to the server |
| `HttpEventType.UploadProgress` | An `HttpUploadProgressEvent` reporting progress on uploading the request body |
| `HttpEventType.ResponseHeader` | The head of the response has been received, including status and headers |
| `HttpEventType.DownloadProgress` | An `HttpDownloadProgressEvent` reporting progress on downloading the response body |
| `HttpEventType.Response` | The entire response has been received, including the response body |
| `HttpEventType.User` | A custom event from an Http interceptor.

## Handling request failure

There are three ways an HTTP request can fail:

* A network or connection error can prevent the request from reaching the backend server.
* A request didn't respond in time when the timeout option was set.
* The backend can receive the request but fail to process it, and return an error response.

`HttpClient` captures all of the above kinds of errors in an `HttpErrorResponse` which it returns through the `Observable`'s error channel. Network and timeout errors have a `status` code of `0` and an `error` which is an instance of [`ProgressEvent`](https://developer.mozilla.org/docs/Web/API/ProgressEvent). Backend errors have the failing `status` code returned by the backend, and the error response as the `error`. Inspect the response to identify the error's cause and the appropriate action to handle the error.

The [RxJS library](https://rxjs.dev/) offers several operators which can be useful for error handling.

You can use the `catchError` operator to transform an error response into a value for the UI. This value can tell the UI to display an error page or value, and capture the error's cause if necessary.

Sometimes transient errors such as network interruptions can cause a request to fail unexpectedly, and simply retrying the request will allow it to succeed. RxJS provides several *retry* operators which automatically re-subscribe to a failed `Observable` under certain conditions. For example, the `retry()` operator will automatically attempt to re-subscribe a specified number of times.

### Timeouts

To set a timeout for a request, you can set the `timeout` option to a number of milliseconds along other request options. If the backend request does not complete within the specified time, the request will be aborted and an error will be emitted.

NOTE: The timeout will only apply to the backend HTTP request itself. It is not a timeout for the entire request handling chain. Therefore, this option is not affected by any delay introduced by interceptors.

<docs-code language="ts">
http.get('/api/config', {
  timeout: 3000,
}).subscribe({
  next: config => {
    console.log('Config fetched successfully:', config);
  },
  error: err => {
    // If the request times out, an error will have been emitted.
  }
});
</docs-code>

## Advanced fetch options

When using the `withFetch()` provider, Angular's `HttpClient` provides access to advanced fetch API options that can improve performance and user experience. These options are only available when using the fetch backend.

### Fetch options

The following options provide fine-grained control over request behavior when using the fetch backend.

#### Keep-alive connections

The `keepalive` option allows a request to outlive the page that initiated it. This is particularly useful for analytics or logging requests that need to complete even if the user navigates away from the page.

<docs-code language="ts">
http.post('/api/analytics', analyticsData, {
  keepalive: true
}).subscribe();
</docs-code>

#### HTTP caching control

The `cache` option controls how the request interacts with the browser's HTTP cache, which can significantly improve performance for repeated requests.

<docs-code language="ts">
//  Use cached response regardless of freshness
http.get('/api/config', {
  cache: 'force-cache'
}).subscribe(config => {
  // ...
});

// Always fetch from network, bypass cache
http.get('/api/live-data', {
  cache: 'no-cache'
}).subscribe(data => {
  // ...
});

// Use cached response only, fail if not in cache
http.get('/api/static-data', {
  cache: 'only-if-cached'
}).subscribe(data => {
  // ...
});
</docs-code>

#### Request priority for Core Web Vitals

The `priority` option allows you to indicate the relative importance of a request, helping browsers optimize resource loading for better Core Web Vitals scores.

<docs-code language="ts">
// High priority for critical resources
http.get('/api/user-profile', {
  priority: 'high'
}).subscribe(profile => {
  // ...
});

// Low priority for non-critical resources
http.get('/api/recommendations', {
  priority: 'low'
}).subscribe(recommendations => {
  // ...
});

// Auto priority (default) lets the browser decide
http.get('/api/settings', {
  priority: 'auto'
}).subscribe(settings => {
  // ...
});
</docs-code>

Available `priority` values:
- `'high'`: High priority, loaded early (e.g., critical user data, above-the-fold content)
- `'low'`: Low priority, loaded when resources are available (e.g., analytics, prefetch data)
- `'auto'`: Browser determines priority based on request context (default)

TIP: Use `priority: 'high'` for requests that affect Largest Contentful Paint (LCP) and `priority: 'low'` for requests that don't impact initial user experience.

#### Request mode

The `mode` option controls how the request handles cross-origin requests and determines the response type.

<docs-code language="ts">
// Same-origin requests only
http.get('/api/local-data', {
  mode: 'same-origin'
}).subscribe(data => {
  // ...
});

// CORS-enabled cross-origin requests
http.get('https://api.external.com/data', {
  mode: 'cors'
}).subscribe(data => {
  // ...
});

// No-CORS mode for simple cross-origin requests
http.get('https://external-api.com/public-data', {
  mode: 'no-cors'
}).subscribe(data => {
  // ...
});
</docs-code>

Available `mode` values:
- `'same-origin'`: Only allow same-origin requests, fail for cross-origin requests
- `'cors'`: Allow cross-origin requests with CORS (default)
- `'no-cors'`: Allow simple cross-origin requests without CORS, response is opaque

TIP: Use `mode: 'same-origin'` for sensitive requests that should never go cross-origin.

#### Redirect handling

The `redirect` option specifies how to handle redirect responses from the server.

<docs-code language="ts">
// Follow redirects automatically (default behavior)
http.get('/api/resource', {
  redirect: 'follow'
}).subscribe(data => {
  // ...
});

// Prevent automatic redirects
http.get('/api/resource', {
  redirect: 'manual'
}).subscribe(response => {
  // Handle redirect manually
});

// Treat redirects as errors
http.get('/api/resource', {
  redirect: 'error'
}).subscribe({
  next: data => {
    // Success response
  },
  error: err => {
    // Redirect responses will trigger this error handler
  }
});
</docs-code>

Available `redirect` values:
- `'follow'`: Automatically follow redirects (default)
- `'error'`: Treat redirects as errors
- `'manual'`: Don't follow redirects automatically, return redirect response

TIP: Use `redirect: 'manual'` when you need to handle redirects with custom logic.

## Http `Observable`s

Each request method on `HttpClient` constructs and returns an `Observable` of the requested response type. Understanding how these `Observable`s work is important when using `HttpClient`.

`HttpClient` produces what RxJS calls "cold" `Observable`s, meaning that no actual request happens until the `Observable` is subscribed. Only then is the request actually dispatched to the server. Subscribing to the same `Observable` multiple times will trigger multiple backend requests. Each subscription is independent.

TIP: You can think of `HttpClient` `Observable`s as _blueprints_ for actual server requests.

Once subscribed, unsubscribing will abort the in-progress request. This is very useful if the `Observable` is subscribed via the `async` pipe, as it will automatically cancel the request if the user navigates away from the current page. Additionally, if you use the `Observable` with an RxJS combinator like `switchMap`, this cancellation will clean up any stale requests.

Once the response returns, `Observable`s from `HttpClient` usually complete (although interceptors can influence this).

Because of the automatic completion, there is usually no risk of memory leaks if `HttpClient` subscriptions are not cleaned up. However, as with any async operation, we strongly recommend that you clean up subscriptions when the component using them is destroyed, as the subscription callback may otherwise run and encounter errors when it attempts to interact with the destroyed component.

TIP: Using the `async` pipe or the `toSignal` operation to subscribe to `Observable`s ensures that subscriptions are disposed properly.

## Best practices

While `HttpClient` can be injected and used directly from components, generally we recommend you create reusable, injectable services which isolate and encapsulate data access logic. For example, this `UserService` encapsulates the logic to request data for a user by their id:

<docs-code language="ts">
@Injectable({providedIn: 'root'})
export class UserService {
  private http = inject(HttpClient);

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`/api/user/${id}`);
  }
}
</docs-code>

Within a component, you can combine `@if` with the `async` pipe to render the UI for the data only after it's finished loading:

<docs-code language="ts">
import { AsyncPipe } from '@angular/common';
@Component({
  imports: [AsyncPipe],
  template: `
    @if (user$ | async; as user) {
      <p>Name: {{ user.name }}</p>
      <p>Biography: {{ user.biography }}</p>
    }
  `,
})
export class UserProfileComponent {
  userId = input.required<string>();
  user$!: Observable<User>;

  private userService = inject(UserService);

  constructor(): void {
    effect(() => {
      this.user$ = this.userService.getUser(this.userId());
    });
  }
}
</docs-code>
