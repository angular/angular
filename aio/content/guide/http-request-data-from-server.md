# HTTP: Request data from a server

Use the [`HttpClient.get()`](api/common/http/HttpClient#get) method to fetch data from a server.

This asynchronous method sends an HTTP request, and returns an [Observable](guide/observables-in-angular) that emits the requested data when the response is received.

The `get(url, options)` method takes two arguments; the string endpoint URL from which to fetch, and an *optional options* object to configure the request.

<code-example format="typescript" language="typescript">

options: {
  headers?: HttpHeaders &verbar; {[header: string]: string &verbar; string[]},
  observe?: 'body' &verbar; 'events' &verbar; 'response',
  params?: HttpParams&verbar;{[param: string]: string &verbar; number &verbar; boolean &verbar; ReadonlyArray&lt;string &verbar; number &verbar; boolean&gt;},
  reportProgress?: boolean,
  responseType?: 'arraybuffer'&verbar;'blob'&verbar;'json'&verbar;'text',
  withCredentials?: boolean,
}

</code-example>

Important options include the *observe* and *responseType* properties.

*   The *observe* option specifies how much of the response to return
*   The *responseType* option specifies the desired format of the returned data

To better understand the `observe` and `responseType` option types, [see below](#string-union-types).

<div class="alert is-helpful">

Use the `options` object to configure various other aspects of an outgoing request.
In adding headers, for example, the service set the default headers using the `headers` option property.

Use the `params` property to configure a request with HTTP URL parameters, and the `reportProgress` option to listen for progress events when transferring large amounts of data.

</div>

Applications often request JSON data from a server.
In the `ConfigService` example, the app needs a configuration file on the server, `config.json`, that specifies resource URLs.

<code-example header="assets/config.json" path="http/src/assets/config.json"></code-example>

To fetch this kind of data, the `get()` call needs the following options: `{observe: 'body', responseType: 'json'}`.
*These are the **default values** for those options*, so most `get()` calls - and most of the following examples - do not pass the options object.
Later sections show some of the additional option possibilities.

<a id="config-service"></a>

### Handle data access in a service class

The example conforms to the best practice for maintainable solutions by isolating the data-access functionality in a re-usable [injectable service](guide/glossary#service "service definition") separate from the component.

The `ConfigService` fetches the JSON file using the `HttpClient.get()` method.

<code-example header="app/config/config.service.ts (getConfig v.1)" path="http/src/app/config/config.service.ts" region="getConfig_1"></code-example>

Notice that `get` was called 
* without an *options* value because the server endpoint returns JSON and JSON is the default data format.
* with a generic, `Config`, that indicates the data return type; you'll [learn why shortly](#typed-response).

In addition to fetching data, the service can post-process the data, 
[add error handling](guide/http-handle-request-errors), 
and add retry logic.

### Present the data in the component

The `ConfigComponent` injects the `ConfigService` in its constructor and offers a `showConfig` method, which calls the  service's  `getConfig` method.

<code-example header="app/config/config.component.ts (showConfig v.1)" path="http/src/app/config/config.component.ts" region="v1"></code-example>

Because the service's `getConfig` method returns an `Observable` of configuration data, the component *subscribes* to the method's return value.

If you didn't subscribe, the service would not have issued an HTTP request and there would be no config data to display. You will [understand why shortly](#always-subscribe).

This example subscription callback performs minimal post-processing.
It copies the data fields into the component's `config` object, which is data-bound in the component template for display.

<a id="always-subscribe"></a>

## Starting the request

For all `HttpClient` methods, the method doesn't begin its HTTP request until you call `subscribe()` on the observable the method returns.

This is true for *all* `HttpClient` *methods*.

<div class="alert is-helpful">

In general, you should unsubscribe from an observable when a component is destroyed.

You don't have to unsubscribe from `HttpClient` observables because they unsubscribe automatically after the server request responds or times out. Most developers choose not to unsubscribe. None of this guide's examples unsubscribe.

</div>

All observables returned from `HttpClient` methods are *cold* by design.
Execution of the HTTP request is *deferred*, letting you extend the observable with additional operations such as  `tap` and `catchError` before anything actually happens.

Calling `subscribe()` triggers execution of the observable and causes `HttpClient` to compose and send the HTTP request to the server.

Think of these observables as *blueprints* for actual HTTP requests.

<div class="alert is-helpful">

In fact, each `subscribe()` initiates a separate, independent execution of the observable.
Subscribing twice results in two HTTP requests.

<code-example format="javascript" language="javascript">

const req = http.get&lt;Heroes&gt;('/api/heroes');
// 0 requests made - .subscribe() not called.
req.subscribe();
// 1 request made.
req.subscribe();
// 2 requests made.

</code-example>

</div>

<a id="typed-response"></a>

## Requesting a typed response

Structure your `HttpClient` request to declare the type of the response object, to make consuming the output easier and more obvious.
Specifying the response type acts as a type assertion at compile time.

<div class="alert is-important">

Specifying the response type is a declaration to TypeScript that it should treat your response as being of the given type.
This is a build-time check and doesn't guarantee that the server actually responds with an object of this type.
It is up to the server to ensure that the type specified by the server API is returned.

</div>

Suppose you made the `get` call without specifying the return type like this:
<code-example header="Config Service - get without result type (not so good)" path="http/src/app/config/config.service.ts" region="untyped_response">
</code-example>

The return type would be `Object`, To access its properties you would have to explicitly convert them with `as any` like this: 

<code-example header="Config Component - without result type (not so good)" path="http/src/app/config/config.component.ts"  region="untyped_response">
</code-example>

It's safer and less clumsy if the returned object has the desired type.

Begin by defining an interface with the required properties.
Use an interface rather than a class, because the response is a plain object that cannot be automatically converted to an instance of a class.

<code-example path="http/src/app/config/config.service.ts" region="config-interface"></code-example>

Now, specify that interface as the `HttpClient.get()` call's type parameter in the service.

<code-example header="Config Service - get with result type (better)" path="http/src/app/config/config.service.ts" region="getConfig_2"></code-example>

The callback in the updated component method receives a typed data object, which is easier and safer to consume:

<code-example header="Config Component - with typed response" path="http/src/app/config/config.component.ts"  region="typed_response">
</code-example>

You can go a step further and clone the result directly into the component's `config` property with [destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#description).

<code-example header="Config Component - with destructured assignment" path="http/src/app/config/config.component.ts" region="v2"></code-example>


## Reading the full response

In the previous example, the call to `HttpClient.get()` did not specify any options.
By default, it returned the JSON data contained in the response body.

You might need more information about the transaction than is contained in the response body.
Sometimes servers return special headers or status codes to indicate certain conditions that are important to the application workflow.

Tell `HttpClient` that you want the full response with the `observe` option of the `get()` method:

<code-example path="http/src/app/config/config.service.ts" region="getConfigResponse"></code-example>

Now `HttpClient.get()` returns an `Observable` of type `HttpResponse` rather than just the JSON data contained in the body.

The component's `showConfigResponse()` method displays the response headers as well as the configuration:

<code-example header="app/config/config.component.ts (showConfigResponse)" path="http/src/app/config/config.component.ts" region="showConfigResponse"></code-example>

As you can see, the response object has a `body` property of the correct type.

<a id="string-union-types"></a>
## The `observe` and `responseType` options

The types of the `observe` and `responseType` options are *string unions*, rather than plain strings.

<code-example format="typescript" language="typescript">

options: {
  &hellip;
  observe?: 'body' &verbar; 'events' &verbar; 'response',
  &hellip;
  responseType?: 'arraybuffer'&verbar;'blob'&verbar;'json'&verbar;'text',
  &hellip;
}

</code-example>

This can cause confusion.
For example:

<code-example format="typescript" language="typescript">

// this works
client.get('/foo', {responseType: 'text'})

// but this does NOT work
const options = {
  responseType: 'text',
};
client.get('/foo', options)

</code-example>

In the second case, TypeScript infers the type of `options` to be `{responseType: string}`.
The type is too wide to pass to `HttpClient.get` which is expecting the type of `responseType` to be one of the *specific* strings.
`HttpClient` is typed explicitly this way so that the compiler can report the correct return type based on the options you provided.

Use `as const` to let TypeScript know that you really do mean to use a constant string type:

<code-example format="typescript" language="typescript">

const options = {
  responseType: 'text' as const,
};
client.get('/foo', options);

</code-example>

</div>

@reviewed 2023-08-18
