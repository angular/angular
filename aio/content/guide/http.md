# HTTP Fundamentals

Most frontend applications communicate with their backends over the HTTP protocol. Modern browsers support two different APIs for making HTTP requests: the `XMLHttpRequest` interface and the `fetch()` API.

`@angular/common/http` provides a simplified API for HTTP functionality for use with Angular applications, building on top of the `XMLHttpRequest` interface exposed by browsers.

## Setup: installing the module

Before you can use the Angular HTTP APIs, you need to install the `HttpClientModule` which provides them. This can be done in your application module, and is only necessary once.

```javascript
// app.module.ts:

import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

// Import HttpClientModule from @angular/common/http
import {HttpClientModule} from '@angular/';

@NgModule({
  imports: [
  	BrowserModule,
    // Include it under 'imports' in your application module
    // after BrowserModule.
    HttpClientModule,
  ],
})
export class MyAppModule {}
```

Once `HttpClientModule` is imported into your app module, `HttpClient` will be injectable into your components and services.

## Making a request for JSON data

The most common type of request applications make to a backend is to request JSON data. For example, suppose you have an API endpoint that lists Angular developers, `/api/developers`, which returns a JSON object of the form:

```json
{
  "results": [
    "Misko",
    "Igor",
  ]
}
```

The `get()` method on `HttpClient` makes accessing this data very easy.


```javascript
@Component(...)
export class MyComponent implements NgOnInit {
  // Inject HttpClient into your component or service.
  constructor(private http: HttpClient) {}
  
  ngOnInit(): void {
    // Make the HTTP request:
    this.http.get('/api/developers').subscribe(data => {
      // Read the result field from the JSON response.
      this.results = data['results'];
    });
  }
}
```

That was easy!

### Typechecking the response

Looking at the above example, the `data['results']` field access stands out - why is the results field accessed via bracket notation? If you tried to write `data.results`, TypeScript would correctly complain that the `Object` coming back from HTTP does not have a `results` property. That's because while `HttpClient` parsed the JSON response into an `Object`, it doesn't know what shape that object is.

You can, however, tell `HttpClient` what type the response will be - in fact, it's recommended. To do so, first you should define an interface with the correct shape:

```javascript
interface DevelopersResponse {
  results: string[];
}
```

Then, when you make the `HttpClient.get` call, pass a type parameter:

```javascript
http.get<DevelopersResponse>('/api/developers').subscribe(data => {
  // data is now an instance of type DevelopersResponse, so this is allowed:
  this.results = data.results;
});
```


### Error handling

What happens if the request fails on the server, or if a poor network connection prevents it from even reaching the server? `HttpClient` will return an _error_ instead of a successful response.

To handle it, add an error handler to your `.subscribe()` call:

```javascript
http
  .get<DevelopersResponse>('/api/developers')
  .subscribe(
  	// Successful responses call the first callback.
  	data => {...},
    // Errors will call this callback instead:
    err => {
  	  console.log('Something went wrong!');
    }
  });
```

#### Getting error details

Detecting that an error occurred is one thing, but it's more useful to know what error actually occurred. The `err` parameter to the callback above is of type `HttpErrorResponse`, and contains useful information on what went wrong.

There are two types of errors that can occur. If the backend returns an unsuccessful response code (404, 500, etc), it gets returned as an error. Also, if something goes wrong client-side (like an exception gets thrown in an RxJS operator, or if a network error prevents the request from completing successfully, an actual `Error` will be thrown.

In both cases, you can look at the `HttpErrorResponse` to figure out what happened.

```javascript
http
  .get<DevelopersResponse>('/api/developers')
  .subscribe(
  	data => {...},
    (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // A client-side or network error occurred. Handle it accordingly.
        console.log('An error occurred:', err.error.message);
      } else {
        // The backend returned an unsuccessful response code.
        // The response body may contain clues as to what went wrong,
        console.log(`Backend returned code ${err.status}, body was: ${err.error}`);
      }
    }
  });
```

#### .retry()

One way to deal with errors is to simply retry the request. This strategy can be useful when the errors are transient and unlikely to repeat.

RxJS has a very useful operator called `.retry()` which will automatically resubscribe to an Observable (thus reissuing the request) on an error.

It can be used with HTTP Observables like this:

```javascript
http
  .get<DevelopersResponse>('/api/developers')
  // Retry this request up to 3 times.
  .retry(3)
  // Any errors after the 3rd retry will fall through to the app.
  .subscribe(...);
```

### Requesting non-JSON data

Not all APIs return JSON data. Suppose you want to read a text file on the server. You have to tell `HttpClient` that you expect a textual response:

```javascript
http
  .get('/textfile.txt', {responseType: 'text'})
  // The Observable returned by get() is of type Observable<string>
  // because a text response was specified. There's no need to pass
  // a <string> type parameter to get().
  .subscribe(data => console.log(data));
```

## Sending data to the server

In addition to fetching data from the server, `HttpClient` supports mutating requests - sending data to the server in various forms.

### Making a POST request

One common operation is to POST data to a server, for example when submitting a form. The code for POSTing data is very similar to the code for GET above:

```javascript
const body = {name: 'Brad'};

http
  .post('/api/developers/add', body)
  // See below - subscribe() is still necessary when using .post().
  .subscribe(...);
```

#### Caution: Observables are cold

Note the `.subscribe()`. All Observables returned from `HttpClient` are _cold_, which is to say that they are _blueprints_ for making requests. Nothing will happen until you call `.subscribe()`, and every such call will make a separate request. For example, this code POSTs the same data twice:

```javascript
const req = http.post('/api/developers/add', body);
// 0 requests made - .subscribe() not called.
req.subscribe();
// 1 request made.
req.subscribe();
// 2 requests made.
```

### Configuring other parts of the request

Besides the URL and a possible request body, there are other aspects of an outgoing request which you may wish to configure. All of these are available via an options object which you pass to the request.

#### Headers

One common task is adding an `Authorization` header to outgoing requests. Here's how you would do that:

```javascript
http
  .post('/api/developers/add', body, {
    headers: new HttpHeaders().set('Authorization', 'my-auth-token'),
  })
  .subscribe();
```

The `HttpHeaders` class is immutable, so every `.set()` returns a new instance with the changes applied.

#### URL Parameters

Adding URL parameters works in the same way. To send a request with the `id` parameter set to 3, you would do:

```javascript
http
  .post('/api/developers/add', body, {
    params: new HttpParams().set('id', '3'),
  })
  .subscribe();
```

With this, the URL to which the POST will be made is `/api/developers/add?id=3`.

## Advanced usage

The above sections detail how to use the basic HTTP functionality in `@angular/common/http`, but sometimes you need to do more than just make requests and get data back.

### Reading the full response

Not all data is returned in the response body. Sometimes servers return special headers or status codes to indicate certain conditions, and inspecting those can be necessary. To do this, you can tell `HttpClient` you want the full response instead of just the body with the `observe` option:

```javascript
http
  .get<MyJsonData>('/data.json', {observe: 'response'})
  .subscribe(resp => {
    // Here, resp is of type HttpResponse<MyJsonData>.
    // You can inspect its headers:
    console.log(resp.headers.get('X-Custom-Header'));
    // And access the body directly, which is typed as MyJsonData as requested.
    console.log(resp.body.someField);
  });
```

As you can see, the resulting object has a `.body` property of the correct type.

### Intercepting all requests or responses

A major feature of `@angular/common/http` is _interception_, the ability to declare interceptors which sit in between your application and the backend. When your application makes a request, it will be transformed by interceptors before being sent to the server, and the response can be transformed on its way back before your application sees it. This is useful for everything from authentication to logging.

#### Writing an interceptor

To implement an interceptor, you declare a class that implements `HttpInterceptor`, which has a single `intercept` method. Here is a simple interceptor which does nothing but forward the request through without altering it:

```javascript
import {Injectable} from '@angular/core';
import {HttpEvent, HttpInterceptor, HttpHandler, HttpRequest) from '@angular/common/http';

@Injectable()
export class NoopInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(Req);
  }
}
```

This looks a little complicated, so let's break it down.

`intercept` is a method which transforms a request into an Observable that eventually returns the response. In this sense, each interceptor is entirely responsible for handling the request by itself.

Most of the time, though, interceptors will want to make some minor change to the request and forward it to the rest of the chain. That's where the `next` parameter comes in. `next` is an `HttpHandler`, an interface that, similarly to `intercept` itself, transforms a request into an Observable for the response. In an interceptor, `next` always represents the next interceptor in the chain, if any, or the final backend if there are no more interceptors. So most interceptors will end by calling `next` on the request they transformed.

Our do-nothing handler simply calls `next.handle` on the original request, forwarding it without mutating it at all.

If you've ever used middleware frameworks such as Express.js, this pattern will feel familiar.


##### Events

You may have also noticed that the Observable returned by `intercept` and `HttpHandler.handle` is not an `Observable<HttpResponse<any>>` but an `Observable<HttpEvent<any>>`. That's because interceptors work at a lower level than the `HttpClient` interface you used above. A single request can generate multiple events, including upload and download progress events. The `HttpResponse` class from above is actually an event itself, with a `.type` of `HttpEventType.HttpResponseEvent`.

Interceptors are required to deal with all `HttpEvent`s that a request may return. Many interceptors are only concerned with the outgoing request, though, and will simply return the event stream from `next` without modifying it.

##### Providing your interceptor

Simply declaring the `NoopInterceptor` above doesn't cause it to be used. You need to wire it up in your app module by providing it as an interceptor, which looks like this:

```javascript
import {NgModule} from '@angular/core';
import {HTTP_INTERCEPTORS} from '@angular/common/http';

@NgModule({
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: NoopInterceptor,
    multi: true,
  }],
})
export class AppModule {}
```

Note the `multi: true` option - this is required and tells Angular that `HTTP_INTERCEPTORS` is an array of values, rather than a single value.

##### Ordering

When multiple interceptors are provided in an application, they will be applied in the order that they were provided.

##### Immutability

Interceptors exist to examine and mutate outgoing requests and incoming responses. It may be surprising, then, to learn that the `HttpRequest` and `HttpResponse` classes are largely immutable.

This is for a reason: because requests may be retried, an individual request may be processed by the interceptor chain multiple times. If requests were mutable, a retried request would be different than the original request. Immutability ensures the interceptors see the same request for each try.

There is one case where type safety cannot protect you or anyone else writing interceptors &mdash; the request body. It is invalid to mutate a request body within an interceptor, but this is not checked by the type system.

To safely make changes within an interceptor, make use of `HttpRequest`'s `.clone()` functionality.

##### Cloning

Since requests are immutable, they cannot be modified directly. To mutate them, use `.clone()`:

```javascript
function intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpError<any>> {
  // This is a duplicate - exactly the same as the original.
  const dupReq = req.clone();
  
  // Change the URL and replace 'http://' with 'https://'
  const secureReq = req.clone({url: req.url.replace('http://', 'https://')});
}
```

As you can see, the hash accepted by `.clone()` allows you to mutate specific properties of the request while copying the others.

#### Setting new headers

A common use of interceptors is to set default headers on outgoing responses. For example, assuming we have an injectable `AuthService` which can provide an authentication token, here is how you would write an interceptor which adds it to all outgoing requests:

```javascript
import {Injectable} from '@angular/core';
import {HttpEvent, HttpInterceptor, HttpHandler, HttpRequest) from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}
 
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the auth header from the service.
    const authHeader: this.auth.getAuthorizationHeader();
    // Clone the request to add the new header.
    const authReq = req.clone({headers: req.headers.set('Authorization', authHeader)});
    // Pass on the cloned request instead of the original request.
    return next.handle(authReq);
  }
}
```

The practice of cloning a request to set new headers is so common that there's actually a shortcut for it:

```javascript
const authReq = req.clone({setHeaders: {Authorization: authHeader}});
```

An interceptor that alters headers can be used for a number of different operations, including:

* Authentication/authorization
* Caching behavior e.g. If-Modified-Since
* XSRF protection

#### Logging

Because interceptors can process the request and response _together_, they can do things like log or time requests. Consider this interceptor which `console.log`s how long each request takes:

```javascript
import 'rxjs/add/operator/do';

export class TimingInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}
 
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  	const elapsed = Date.now();
    return next
      .handle(req)
      .do(event => {
        if (event instanceof HttpResponse) {
          const time = Date.now() - started;
          console.log(`Request for ${req.urlWithParams} took ${elapsed} ms.`); 
        }
      });
  }
}
```

You may find the RxJS `.do` operator useful - it adds a side effect to an Observable without affecting the values on the stream. Here, it's used to detect the `HttpResponse` event and log the time the request took.

#### Caching

Interceptors can also be used to implement caching. For this example, assume that you've written an HTTP cache with a simple interface:

```javascript
abstract class HttpCache {
  /**
   * Returns a cached response, if any, or null if not present.
   */
  abstract get(req: HttpRequest<any>): HttpResponse<any>|null;
  
  /**
   * Adds or updates the response in the cache.
   */
  abstract put(req: HttpRequest<any>, resp: HttpResponse<any>): void;
}
```

An interceptor can apply this cache to outgoing requests.

```javascript
@Injectable()
export class CachingInterceptor implements HttpInterceptor {
  constructor(private cache: HttpCache) {}
 
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  	// Before we do anything, it's important to only cache GET requests.
    // Skip this interceptor if the request method isn't GET.
    if (req.method !== 'GET') {
      return next.handle(req);
    }
  
    // First, check the cache to see if this request exists.
    const cachedResponse = this.cache.get(req);
    if (cachedResponse) {
      // A cached response exists! Serve it instead of forwarding
      // the request to the next handler.
      return Observable.of(cachedResponse);
    }
    
    // No cached response exists. Go to the network, and cache
    // the response when it arrives.
    return next.handle(req).do(event => {
      // Remember, there may be other events besides just the response.
      if (event instanceof HttpResponse) {
      	// Update the cache.
      	this.cache.put(req, event);
      }
    });
  }
}
```

Obviously this example glosses over request matching, cache invalidation, etc, but it's easy to see that interceptors have a lot of power beyond just transforming requests. If desired, they can be used to completely take over the request flow.

To really demonstrate their flexibility, the above example can be changed to return _two_ response events if the request exists in cache - the cached response first, and an updated network response later.

```javascript
intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  // Still skip non-GET requests.
  if (req.method !== 'GET') {
    return next.handle(req);
  }
  
  // This will be an Observable of the cached value if there is one,
  // or an empty Observable otherwise. It starts out empty.
  let maybeCachedResponse: Observable<HttpEvent<any>> = Observable.empty();
  
  // Check the cache.
  const cachedResponse = this.cache.get(req);
  if (cachedResponse) {
    maybeCachedResponse = Observable.of(cachedResponse);
  }
  
  // Create an Observable (but don't subscribe) that represents making
  // the network request and caching the value.
  const networkResponse = next.handle(req).do(event => {
    // Just like before, check for the HttpResponse event and cache it.
    if (event instanceof HttpResponse) {
      this.cache.put(req, event);
    }
  });
  
  // Now, combine the two and send the cached response first (if there is
  // one), and the network response second.
  return Observable.concat(maybeCachedResponse, networkResponse);
}
```

Now anyone doing `http.get(url)` will receive _two_ responses if that URL has been cached before.

### Listening to progress events

Sometimes applications need to transfer large amounts of data, and those transfers can take time. It's a good user experience practice to provide feedback on the progress of such transfers (for example, uploading files), and `@angular/common/http` supports this.

To make a request with progress events enabled, first create an instance of `HttpRequest` with the special `reportProgress` option set:

```javascript
const req = new HttpRequest('POST', '/upload/file', file, {
  reportProgress: true,
});
```

This option enables tracking of progress events (remember, change detection will be triggered for every progress event, so only turn them on if you intend to actually update the UI on each event).

Next, make the request through the `.request()` method of `HttpClient`. The result will be an Observable of events, just like with interceptors:

```javascript
http.request(req).subscribe(event => {
  // Via this API, you get access to the raw event stream.
  // Look for upload progress events.
  if (event.type === HttpEventType.UploadProgress) {
    // This is an upload progress event. Compute and show the % done:
    const percentDone = Math.round(100 * event.loaded / event.total);
    console.log(`File is ${percentDone}% uploaded.`);
  } else if (event instanceof HttpResponse) {
    console.log('File is completely uploaded!');
  }
});
```
