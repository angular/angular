# HTTP

[HTTP](https://tools.ietf.org/html/rfc2616) is the primary protocol for browser/server communication.

<div class="l-sub-section">

  The [`WebSocket`](https://tools.ietf.org/html/rfc6455) protocol is another important communication technology;
  it isn't covered in this page.

</div>

Modern browsers support two HTTP-based APIs:
[XMLHttpRequest (XHR)](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) and
[JSONP](https://en.wikipedia.org/wiki/JSONP). A few browsers also support
[Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

The Angular HTTP library simplifies application programming with the **XHR** and **JSONP** APIs.

A <live-example>live example</live-example> illustrates these topics.

{@a demos}

## Demos

This page describes server communication with the help of the following demos:

* [The Tour of Heroes *HTTP* client demo](guide/http#http-client).
* [Fall back to Promises](guide/http#promises).
* [Cross-Origin Requests: Wikipedia example](guide/http#cors).
* [More fun with Observables](guide/http#more-observables).

The root `AppComponent` orchestrates these demos:

<code-example path="http/src/app/app.component.ts" title="src/app/app.component.ts"></code-example>

{@a http-providers}

## Providing HTTP services

First, configure the application to use server communication facilities.

The Angular <code>Http</code> client communicates with the server using a familiar HTTP request/response protocol.
The `Http` client is one of a family of services in the Angular HTTP library.


<div class="l-sub-section">

  When importing from the `@angular/http` module, SystemJS knows how to load services from
  the Angular HTTP library
  because the `systemjs.config.js` file maps to that module name.

</div>


Before you can use the `Http` client, you need to register it as a service provider with the dependency injection system.


<div class="l-sub-section">

  Read about providers in the [Dependency Injection](guide/dependency-injection) page.

</div>


Register providers by importing other NgModules to the root NgModule in `app.module.ts`.

<code-example path="http/src/app/app.module.1.ts" title="src/app/app.module.ts (v1)" linenums="false"></code-example>

Begin by importing the necessary members.
The newcomers are the `HttpModule` and the `JsonpModule` from the Angular HTTP library. For more information about imports and related terminology, see the [MDN reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) on the `import` statement.

To add these modules to the application, pass them to the `imports` array in the root `@NgModule`.


<div class="l-sub-section">

  The `HttpModule` is necessary for making HTTP calls.
  Though the `JsonpModule` isn't necessary for plain HTTP,
  there is a JSONP demo later in this page.
  Loading its module now saves time.

</div>


{@a http-client}

## The Tour of Heroes HTTP client demo

The first demo is a mini-version of the [tutorial](tutorial)'s "Tour of Heroes" (ToH) application.
This version gets some heroes from the server, displays them in a list, lets the user add new heroes, and saves them to the server.
The app uses the Angular <code>Http</code> client to communicate via **XMLHttpRequest (XHR)**.

It works like this:

<figure>
  <img src='generated/images/guide/http/http-toh.gif' alt="ToH mini app">
</figure>

This demo has a single component, the `HeroListComponent`.  Here's its template:

<code-example path="http/src/app/toh/hero-list.component.html" title="src/app/toh/hero-list.component.html"></code-example>

It presents the list of heroes with an `ngFor`.
Below the list is an input box and an *Add Hero* button where you can enter the names of new heroes
and add them to the database.
A [template reference variable](guide/template-syntax#ref-vars), `newHeroName`, accesses the
value of the input box in the `(click)` event binding.
When the user clicks the button, that value is passed to the component's `addHero` method and then
the event binding clears it to make it ready for a new hero name.

Below the button is an area for an error message.

{@a oninit}
{@a HeroListComponent}

### The *HeroListComponent* class

Here's the component class:

<code-example path="http/src/app/toh/hero-list.component.ts" region="component" title="src/app/toh/hero-list.component.ts (class)"></code-example>

Angular [injects](guide/dependency-injection) a `HeroService` into the constructor
and the component calls that service to fetch and save data.

The component **does not talk directly to the Angular <code>Http</code> client**.
The component doesn't know or care how it gets the data.
It delegates to the `HeroService`.

This is a golden rule: **always delegate data access to a supporting service class**.

Although _at runtime_ the component requests heroes immediately after creation,
you **don't** call the service's `get` method in the component's constructor.
Instead, call it inside the `ngOnInit` [lifecycle hook](guide/lifecycle-hooks)
and rely on Angular to call `ngOnInit` when it instantiates this component.


<div class="l-sub-section">

  This is a *best practice*.
  Components are easier to test and debug when their constructors are simple, and all real work
  (especially calling a remote server) is handled in a separate method.

</div>


The service's `getHeroes()` and `create()` methods return an `Observable` of hero data that the Angular <code>Http</code> client fetched from the server.

Think of an `Observable` as a stream of events published by some source.
To listen for events in this stream, ***subscribe*** to the `Observable`.
These subscriptions specify the actions to take when the web request
produces a success event (with the hero data in the event payload) or a fail event (with the error in the payload).

With a basic understanding of the component, you're ready to look inside the `HeroService`.

{@a HeroService}
{@a fetch-data}

## Fetch data with _http.get()_

In many of the previous samples the app faked the interaction with the server by
returning mock heroes in a service like this one:

<code-example path="toh-pt4/src/app/hero.service.ts" region="just-get-heroes" title="toh-pt4/src/app/hero.service.ts" linenums="false"></code-example>

You can revise that `HeroService` to get the heroes from the server using the Angular <code>Http</code> client service:

<code-example path="http/src/app/toh/hero.service.ts" region="v1" title="src/app/toh/hero.service.ts (revised)"></code-example>

Notice that the Angular <code>Http</code> client service is
[injected](guide/dependency-injection) into the `HeroService` constructor.

<code-example path="http/src/app/toh/hero.service.ts" region="ctor" title="src/app/toh/hero.service.ts"></code-example>

Look closely at how to call `http.get`:

<code-example path="http/src/app/toh/hero.service.ts" region="http-get" title="src/app/toh/hero.service.ts (getHeroes)" linenums="false"></code-example>

You pass the resource URL to `get` and it calls the server which returns heroes.


<div class="l-sub-section">

  The server returns heroes once you've set up the [in-memory web api](guide/http#in-mem-web-api)
  described in the appendix below.
  Alternatively, you can temporarily target a JSON file by changing the endpoint URL:

  <code-example path="http/src/app/toh/hero.service.ts" region="endpoint-json" title="src/app/toh/hero.service.ts" linenums="false"></code-example>

</div>


{@a rxjs}
If you are familiar with asynchronous methods in modern JavaScript, you might expect the `get` method to return a
<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise" title="Promise">promise</a>.
You'd expect to chain a call to `then()` and extract the heroes.
Instead you're calling a `map()` method.
Clearly this is not a promise.

In fact, the `http.get` method returns an **Observable** of HTTP Responses (`Observable<Response>`) from the RxJS library
and `map()` is one of the RxJS *operators*.

{@a rxjs-library}

## RxJS library

<a href="http://reactivex.io/rxjs" title="RxJS Reactive Extensions">RxJS</a>
is a third party library, endorsed by Angular, that implements the
<a href="https://www.youtube.com/watch?v=VLGCCpOWFFw" title="Video: Rob Wormald on Observables"><b>asynchronous Observable</b></a> pattern.

All of the Developer Guide samples have installed the RxJS npm package
because Observables are used widely in Angular applications.
_This_ app needs it when working with the HTTP client.
But you must take a critical extra step to make RxJS Observables usable:
_you must import the RxJS operators individually_.

### Enable RxJS operators

The RxJS library is large.
Size matters when building a production application and deploying it to mobile devices.
You should include only necessary features.

Each code file should add the operators it needs by importing from an RxJS library.
The `getHeroes()` method needs the `map()` and `catch()` operators so it imports them like this.

<code-example path="http/src/app/toh/hero.service.ts" region="rxjs-imports" title="src/app/app.component.ts (import rxjs)" linenums="false"></code-example>

{@a extract-data}

## Process the response object

Remember that the `getHeroes()` method used an `extractData()` helper method to map the `http.get` response object to heroes:

<code-example path="http/src/app/toh/hero.service.ts" region="extract-data" title="src/app/toh/hero.service.ts (excerpt)" linenums="false"></code-example>

The `response` object doesn't hold the data in a form the app can use directly.
You must parse the response data into a JSON object.

{@a parse-to-json}

### Parse to JSON

The response data are in JSON string form.
The app must parse that string into JavaScript objects by calling `response.json()`.


<div class="l-sub-section">

  This is not Angular's own design.
  The Angular HTTP client follows the Fetch specification for the
  [response object](https://fetch.spec.whatwg.org/#response-class) returned by the `Fetch` function.
  That spec defines a `json()` method that parses the response body into a JavaScript object.

</div>


<div class="l-sub-section">

  Don't expect the decoded JSON to be the heroes array directly.
  This server always wraps JSON results in an object with a `data`
  property. You have to unwrap it to get the heroes.
  This is conventional web API behavior, driven by
  [security concerns](https://www.owasp.org/index.php/OWASP_AJAX_Security_Guidelines#Always_return_JSON_with_an_Object_on_the_outside).

</div>


<div class="alert is-important">

  Make no assumptions about the server API.
  Not all servers return an object with a `data` property.

</div>


{@a no-return-response-object}

### Do not return the response object

The `getHeroes()` method _could_ have returned the HTTP response but this wouldn't
follow best practices.
The point of a data service is to hide the server interaction details from consumers.
The component that calls the `HeroService` only wants heroes and is kept separate
from getting them, the code dealing with where they come from, and the response object.

<div class="callout is-important">
  <header>HTTP GET is delayed</header>

  The `http.get` does **not send the request just yet.** This Observable is
  [*cold*](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/gettingstarted/creating.md#cold-vs-hot-observables),
  which means that the request won't go out until something *subscribes* to the Observable.
  That *something* is the [HeroListComponent](guide/http#subscribe).

</div>


{@a error-handling}

### Always handle errors

An important part of dealing with I/O is anticipating errors by preparing to catch them
and do something with them. One way to handle errors is to pass an error message
back to the component for presentation to the user,
but only if it says something that the user can understand and act upon.

This simple app conveys that idea, albeit imperfectly, in the way it handles a `getHeroes` error.

<code-example path="http/src/app/toh/hero.service.ts" region="error-handling" title="src/app/toh/hero.service.ts (excerpt)" linenums="false"></code-example>

The `catch()` operator passes the error object from `http` to the `handleError()` method.
The `handleError` method transforms the error into a developer-friendly message,
logs it to the console, and returns the message in a new, failed Observable via `Observable.throw`.


{@a subscribe}
{@a hero-list-component}

### **HeroListComponent** error handling

Back in the `HeroListComponent`, in `heroService.getHeroes()`,
the `subscribe` function has a second function parameter to handle the error message.
It sets an `errorMessage` variable that's bound conditionally in the `HeroListComponent` template.

<code-example path="http/src/app/toh/hero-list.component.ts" region="getHeroes" title="src/app/toh/hero-list.component.ts (getHeroes)" linenums="false"></code-example>


<div class="l-sub-section">

  Want to see it fail? In the `HeroService`, reset the api endpoint to a bad value. Afterward, remember to restore it.

</div>

{@a create}
{@a update}
{@a post}

## Send data to the server

So far you've seen how to retrieve data from a remote location using an HTTP service.
Now you'll add the ability to create new heroes and save them in the backend.

You'll write a method for the `HeroListComponent` to call, a `create()` method, that takes
just the name of a new hero and returns an `Observable` of `Hero`. It begins like this:

<code-example path="http/src/app/toh/hero.service.ts" region="create-sig" title="src/app/toh/hero.service.ts" linenums="false"></code-example>

To implement it, you must know the server's API for creating heroes.

[This sample's data server](guide/http#in-mem-web-api) follows typical REST guidelines.
It expects a [`POST`](http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.5) request
at the same endpoint as `GET` heroes.
It expects the new hero data to arrive in the body of the request,
structured like a `Hero` entity but without the `id` property.
The body of the request should look like this:

<code-example format="." language="javascript">
  { "name": "Windstorm" }
</code-example>

The server generates the `id` and returns the entire `JSON` representation
of the new hero including its generated id. The hero arrives tucked inside a response object
with its own `data` property.

Now that you know how the API works, implement `create()` as follows:

<code-example path="http/src/app/toh/hero.service.ts" region="import-request-options" title="src/app/toh/hero.service.ts (additional imports)" linenums="false"></code-example>

<code-example path="http/src/app/toh/hero.service.ts" linenums="false" title="src/app/toh/hero.service.ts (create)" region="create"></code-example>

{@a headers}

### Headers

In the `headers` object, the `Content-Type` specifies that the body represents JSON.

Next, the `headers` object is used to configure the `options` object. The `options`
object is a new instance of `RequestOptions`, a class that allows you to specify
certain settings when instantiating a request. In this way, [headers](api/http/Headers) is one of the [RequestOptions](api/http/RequestOptions).

In the `return` statement, `options` is the *third* argument of the `post()` method, as shown above.


{@a json-results}

### JSON results

As with `getHeroes()`, use the `extractData()` helper to [extract the data](guide/http#extract-data)
from the response.

Back in the `HeroListComponent`, its `addHero()` method subscribes to the Observable returned by the service's `create()` method.
When the data arrive it pushes the new hero object into its `heroes` array for presentation to the user.

<code-example path="http/src/app/toh/hero-list.component.ts" region="addHero" title="src/app/toh/hero-list.component.ts (addHero)" linenums="false"></code-example>

{@a promises}

## Fall back to promises

Although the Angular `http` client API returns an `Observable<Response>` you can turn it into a
[`Promise<Response>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).
It's easy to do, and in simple cases, a Promise-based version looks much
like the Observable-based version.


<div class="l-sub-section">

  While Promises may be more familiar, Observables have many advantages.

</div>


Here is a comparison of the `HeroService` using Promises versus Observables,
highlighting just the parts that are different.

<code-tabs>
  <code-pane title="src/app/toh/hero.service.promise.ts (promise-based)" path="http/src/app/toh/hero.service.promise.ts" region="methods"></code-pane>
  <code-pane title="src/app/toh/hero.service.ts (observable-based)" path="http/src/app/toh/hero.service.ts" region="methods"></code-pane>
</code-tabs>

You can follow the Promise `then(this.extractData).catch(this.handleError)` pattern as in
this example.

Alternatively, you can call `toPromise(success, fail)`. The Observable's `map` callback moves to the
first *success* parameter and its `catch` callback to the second *fail* parameter
in this pattern: `.toPromise(this.extractData, this.handleError)`.

The `errorHandler` forwards an error message as a failed `Promise` instead of a failed `Observable`.

The diagnostic *log to console* is just one more `then()` in the Promise chain.

You have to adjust the calling component to expect a `Promise` instead of an `Observable`:

<code-tabs>
  <code-pane title="src/app/toh/hero-list.component.promise.ts (promise-based)" path="http/src/app/toh/hero-list.component.promise.ts" region="methods"></code-pane>
  <code-pane title="src/app/toh/hero-list.component.ts (observable-based)" path="http/src/app/toh/hero-list.component.ts" region="methods"></code-pane>
</code-tabs>

The only obvious difference is that you call `then()` on the returned Promise instead of `subscribe`.
Both methods take the same functional arguments.


<div class="l-sub-section">

  The less obvious but critical difference is that these two methods return very different results.

  The Promise-based `then()` returns another Promise. You can keep chaining
  more `then()` and `catch()` calls, getting a new promise each time.

  The `subscribe()` method returns a `Subscription`. A `Subscription` is not another `Observable`.
  It's the end of the line for Observables. You can't call `map()` on it or call `subscribe()` again.
  The `Subscription` object has a different purpose, signified by its primary method, `unsubscribe`.

  To understand the implications and consequences of subscriptions,
  watch [Ben Lesh's talk on Observables](https://www.youtube.com/watch?v=3LKMwkuK0ZE)
  or his video course on [egghead.io](https://egghead.io/lessons/rxjs-rxjs-observables-vs-promises).

</div>


{@a cors}

## Cross-Origin Requests: Wikipedia example

You just learned how to make `XMLHttpRequests` using the Angular <code>Http</code> service.
This is the most common approach to server communication, but it doesn't work in all scenarios.

For security reasons, web browsers block `XHR` calls to a remote server whose origin is different from the origin of the web page.
The *origin* is the combination of URI scheme, hostname, and port number.
This is called the [same-origin policy](https://en.wikipedia.org/wiki/Same-origin_policy).


<div class="l-sub-section">

  Modern browsers do allow `XHR` requests to servers from a different origin if the server supports the
  [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) protocol.
  If the server requires user credentials, enable them in the [request headers](guide/http#headers).

</div>


Some servers do not support CORS but do support an older, read-only alternative called [JSONP](https://en.wikipedia.org/wiki/JSONP).
Wikipedia is one such server.


<div class="l-sub-section">

  This [Stack Overflow answer](http://stackoverflow.com/questions/2067472/what-is-jsonp-all-about/2067584#2067584) covers many details of JSONP.

</div>


{@a search-wikipedia}

### Search Wikipedia

Here is a simple search that shows suggestions from Wikipedia as the user
types in a text box:

<figure>
  <img src='generated/images/guide/http/wiki-1.gif' alt="Wikipedia search app (v.1)">
</figure>

Wikipedia offers a modern `CORS` API and a legacy `JSONP` search API. This example uses the latter.
The Angular `Jsonp` service both extends the `Http` service for JSONP and restricts you to `GET` requests.
All other HTTP methods throw an error because `JSONP` is a read-only facility.

As always, wrap the interaction with an Angular data access client service inside a dedicated service, here called `WikipediaService`.

<code-example path="http/src/app/wiki/wikipedia.service.ts" title="src/app/wiki/wikipedia.service.ts"></code-example>

The constructor expects Angular to inject its `Jsonp` service, which
is available because `JsonpModule` is in the root `@NgModule` `imports` array
in `app.module.ts`.

{@a query-parameters}

### Search parameters

The [Wikipedia "opensearch" API](https://www.mediawiki.org/wiki/API:Opensearch)
expects four parameters (key/value pairs) to arrive in the request URL's query string.
The keys are `search`, `action`, `format`, and `callback`.
The value of the `search` key is the user-supplied search term to find in Wikipedia.
The other three are the fixed values "opensearch", "json", and "JSONP_CALLBACK" respectively.


<div class="l-sub-section">

  The `JSONP` technique requires that you pass a callback function name to the server in the query string: `callback=JSONP_CALLBACK`.
  The server uses that name to build a JavaScript wrapper function in its response, which Angular ultimately calls to extract the data.
  All of this happens under the hood.

</div>


If you're looking for articles with the word "Angular", you could construct the query string by hand and call `jsonp` like this:

<code-example path="http/src/app/wiki/wikipedia.service.1.ts" region="query-string" title="src/app/wiki/wikipedia.service.ts" linenums="false"></code-example>

In more parameterized examples you could build the query string with the Angular `URLSearchParams` helper:

<code-example path="http/src/app/wiki/wikipedia.service.ts" region="search-parameters" title="src/app/wiki/wikipedia.service.ts (search parameters)" linenums="false"></code-example>

This time you call `jsonp` with *two* arguments: the `wikiUrl` and an options object whose `search` property is the `params` object.

<code-example path="http/src/app/wiki/wikipedia.service.ts" region="call-jsonp" title="src/app/wiki/wikipedia.service.ts (call jsonp)" linenums="false"></code-example>

`Jsonp` flattens the `params` object into the same query string you saw earlier, sending the request
to the server.

{@a wikicomponent}

### The WikiComponent

Now that you have a service that can query the Wikipedia API,
turn your attention to the component (template and class) that takes user input and displays search results.

<code-example path="http/src/app/wiki/wiki.component.ts" title="src/app/wiki/wiki.component.ts"></code-example>

The template presents an `<input>` element *search box* to gather search terms from the user,
and calls a `search(term)` method after each `keyup` event.

The component's `search(term)` method delegates to the `WikipediaService`, which returns an
Observable array of string results (`Observable<string[]>`).
Instead of subscribing to the Observable inside the component, as in the `HeroListComponent`,
the app forwards the Observable result to the template (via `items`) where the `async` pipe
in the `ngFor` handles the subscription. Read more about [async pipes](guide/pipes#async-pipe)
in the [Pipes](guide/pipes) page.


<div class="l-sub-section">

  The [async pipe](guide/pipes#async-pipe) is a good choice in read-only components
  where the component has no need to interact with the data.

  `HeroListComponent` can't use the pipe because `addHero()` pushes newly created heroes into the list.

</div>


{@a wasteful-app}

## A wasteful app

The Wikipedia search makes too many calls to the server.
It is inefficient and potentially expensive on mobile devices with limited data plans.

### 1. Wait for the user to stop typing

Presently, the code calls the server after every keystroke.
It should only make requests when the user *stops typing*.
Here's how it will work after refactoring:

<figure>
  <img src='generated/images/guide/http/wiki-2.gif' alt="Wikipedia search app (v.2)">
</figure>

### 2. Search when the search term changes

Suppose a user enters the word *angular* in the search box and pauses for a while.
The application issues a search request for *angular*.

Then the user backspaces over the last three letters, *lar*, and immediately re-types *lar* before pausing once more.
The search term is still _angular_. The app shouldn't make another request.

### 3. Cope with out-of-order responses

The user enters *angular*, pauses, clears the search box, and enters *http*.
The application issues two search requests, one for *angular* and one for *http*.

Which response arrives first? It's unpredictable.
When there are multiple requests in-flight, the app should present the responses
in the original request order.
In this example, the app must always display the results for the *http* search
no matter which response arrives first.

{@a more-observables}

## More fun with Observables

You could make changes to the `WikipediaService`, but for a better
user experience, create a copy of the `WikiComponent` instead and make it smarter,
with the help of some nifty Observable operators.

Here's the `WikiSmartComponent`, shown next to the original `WikiComponent`:

<code-tabs>
  <code-pane title="src/app/wiki/wiki-smart.component.ts" path="http/src/app/wiki/wiki-smart.component.ts"></code-pane>
  <code-pane title="src/app/wiki/wiki.component.ts" path="http/src/app/wiki/wiki.component.ts"></code-pane>
</code-tabs>

While the templates are virtually identical,
there's a lot more RxJS in the "smart" version,
starting with `debounceTime`, `distinctUntilChanged`, and `switchMap` operators,
imported as [described above](guide/http#rxjs-library).

{@a create-stream}

### Create a stream of search terms

The `WikiComponent` passes a new search term directly to the `WikipediaService` after every keystroke.

The `WikiSmartComponent` class turns the user's keystrokes into an Observable _stream of search terms_
with the help of a `Subject`, which you import from RxJS:

<code-example path="http/src/app/wiki/wiki-smart.component.ts" region="import-subject" title="src/app/wiki/wiki-smart.component.ts" linenums="false"></code-example>

The component creates a `searchTermStream` as a `Subject` of type `string`.
The `search()` method adds each new search box value to that stream via the subject's `next()` method.

<code-example path="http/src/app/wiki/wiki-smart.component.ts" region="subject" title="src/app/wiki/wiki-smart.component.ts" linenums="false"></code-example>

{@a listen-for-search-terms}

### Listen for search terms

The `WikiSmartComponent` listens to the *stream of search terms* and
processes that stream _before_ calling the service.

<code-example path="http/src/app/wiki/wiki-smart.component.ts" region="observable-operators" title="src/app/wiki/wiki-smart.component.ts" linenums="false"></code-example>

* <a href="https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/debounce.md" title="debounce operator"><i>debounceTime</i></a>
waits for the user to stop typing for at least 300 milliseconds.

* <a href="https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/distinctuntilchanged.md" title="distinctUntilChanged operator"><i>distinctUntilChanged</i></a>
ensures that the service is called only when the new search term is different from the previous search term.

* The <a href="https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/flatmaplatest.md" title="switchMap operator"><i>switchMap</i></a>
calls the `WikipediaService` with a fresh, debounced search term and coordinates the stream(s) of service response.

The role of `switchMap` is particularly important.
The `WikipediaService` returns a separate Observable of string arrays (`Observable<string[]>`) for each search request.
The user could issue multiple requests before a slow server has had time to reply,
which means a backlog of response Observables could arrive at the client, at any moment, in any order.

The `switchMap` returns its own Observable that _combines_ all `WikipediaService` response Observables,
re-arranges them in their original request order,
and delivers to subscribers only the most recent search results.

{@a xsrf}

## Guarding against Cross-Site Request Forgery

In a cross-site request forgery (CSRF or XSRF), an attacker tricks the user into visiting
a different web page with malignant code that secretly sends a malicious request to your application's web server.

The server and client application must work together to thwart this attack.
Angular's `Http` client does its part by applying a default `CookieXSRFStrategy` automatically to all requests.

The `CookieXSRFStrategy` supports a common anti-XSRF technique in which the server sends a randomly
generated authentication token in a cookie named `XSRF-TOKEN`.
The HTTP client adds an `X-XSRF-TOKEN` header with that token value to subsequent requests.
The server receives both the cookie and the header, compares them, and processes the request only if the cookie and header match.

See the [XSRF topic on the Security page](guide/security#xsrf) for more information about XSRF and Angular's `XSRFStrategy` counter measures.

{@a override-default-request-options}

## Override default request headers (and other request options)

Request options (such as headers) are merged into the
[default _RequestOptions_](/api/http/BaseRequestOptions "API: BaseRequestOptions")
before the request is processed.
The `HttpModule` provides these default options via the `RequestOptions` token.

You can override these defaults to suit your application needs
by creating a custom sub-class of `RequestOptions`
that sets the default options for the application.

This sample creates a class that sets the default `Content-Type` header to JSON.
It exports a constant with the necessary `RequestOptions` provider to simplify registration in `AppModule`.

<code-example path="http/src/app/default-request-options.service.ts" title="src/app/default-request-options.service.ts" linenums="false"></code-example>

Then it registers the provider in the root `AppModule`.

<code-example path="http/src/app/app.module.ts" region="provide-default-request-options" title="src/app/app.module.ts (provide default request header)" linenums="false"></code-example>


<div class="l-sub-section">

  Remember to include this provider during setup when unit testing the app's HTTP services.

</div>


After this change, the `header` option setting in `HeroService.create()` is no longer necessary,

<code-example path="http/src/app/toh/hero.service.ts" linenums="false" title="src/app/toh/hero.service.ts (create)" region="create"></code-example>

You can confirm that `DefaultRequestOptions` is working by examing HTTP requests in the browser developer tools' network tab.
If you're short-circuiting the server call with something like the [_in-memory web api_](guide/http#in-mem-web-api),
try commenting-out the `create` header option,
set a breakpoint on the POST call, and step through the request processing
to verify the header is there.

Individual requests options, like this one, take precedence over the default `RequestOptions`.
It might be wise to keep the `create` request header setting for extra safety.

{@a in-mem-web-api}

## Appendix: Tour of Heroes _in-memory web api_

If the app only needed to retrieve data, you could get the heroes from a `heroes.json` file:


<div class="l-sub-section">

  You wrap the heroes array in an object with a `data` property for the same reason that a data server does:
  to mitigate the [security risk](http://stackoverflow.com/questions/3503102/what-are-top-level-json-arrays-and-why-are-they-a-security-risk)
  posed by top-level JSON arrays.

</div>

You'd set the endpoint to the JSON file like this:

<code-example path="http/src/app/toh/hero.service.ts" region="endpoint-json" title="src/app/toh/hero.service.ts" linenums="false"></code-example>

The *get heroes* scenario would work,
but since the app can't save changes to a JSON file, it needs a web API server.
Because there isn't a real server for this demo,
it substitutes the Angular _in-memory web api_ simulator for the actual XHR backend service.


<div class="l-sub-section">

  The in-memory web api is not part of Angular _proper_.
  It's an optional service in its own
  <a href="https://github.com/angular/in-memory-web-api" title="In-memory Web API"><i>angular-in-memory-web-api</i></a>
  library installed with npm (see `package.json`).

  See the
  <a href="https://github.com/angular/in-memory-web-api/blob/master/README.md" title='In-memory Web API "README.md"'><i>README file</i></a>
  for configuration options, default behaviors, and limitations.

</div>


The in-memory web API gets its data from a custom application class with a `createDb()`
method that returns a map whose keys are collection names and whose values
are arrays of objects in those collections.

Here's the class for this sample, based on the JSON data:

<code-example path="http/src/app/hero-data.ts" title="src/app/hero-data.ts" linenums="false"></code-example>

Ensure that the `HeroService` endpoint refers to the web API:

<code-example path="http/src/app/toh/hero.service.ts" region="endpoint" title="src/app/toh/hero.service.ts" linenums="false"></code-example>

Finally, redirect client HTTP requests to the in-memory web API by
adding the `InMemoryWebApiModule` to the `AppModule.imports` list.
At the same time, call its `forRoot()` configuration method with the `HeroData` class.

<code-example path="http/src/app/app.module.ts" region="in-mem-web-api" title="src/app/app.module.ts" linenums="false"></code-example>

### How it works

Angular's `http` service delegates the client/server communication tasks
to a helper service called the `XHRBackend`.

Using standard Angular provider registration techniques, the `InMemoryWebApiModule`
replaces the default `XHRBackend` service with its own in-memory alternative.
At the same time, the `forRoot` method initializes the in-memory web API with the *seed data* from the mock hero dataset.


<div class="l-sub-section">

  The `forRoot()` method name is a strong reminder that you should only call the `InMemoryWebApiModule` _once_,
  while setting the metadata for the root `AppModule`. Don't call it again.

</div>


Here is the final, revised version of <code>src/app/app.module.ts</code>, demonstrating these steps.

<code-example path="http/src/app/app.module.ts" linenums="false" title="src/app/app.module.ts (excerpt)"></code-example>


<div class="alert is-important">

  Import the `InMemoryWebApiModule` _after_ the `HttpModule` to ensure that
  the `XHRBackend` provider of the `InMemoryWebApiModule` supersedes all others.

</div>


See the full source code in the <live-example></live-example>.
