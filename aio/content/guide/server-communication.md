@title
HTTP Client

@intro
Use an HTTP Client to talk to a remote server.

@description

[HTTP](https://tools.ietf.org/html/rfc2616) is the primary protocol for browser/server communication.

~~~ {.l-sub-section}

The [`WebSocket`](https://tools.ietf.org/html/rfc6455) protocol is another important communication technology;
it isn't covered in this page.

~~~

Modern browsers support two HTTP-based APIs:
[XMLHttpRequest (XHR)](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) and
[JSONP](https://en.wikipedia.org/wiki/JSONP). A few browsers also support
[Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

The !{_Angular_http_library} simplifies application programming with the **XHR** and **JSONP** APIs.
# Contents
* [Demos](guide/server-communication#demos)
* [Providing HTTP Services](guide/server-communication#http-providers)
* [The Tour of Heroes *HTTP* client demo](guide/server-communication#http-client)
  - [The `HeroListComponent` class](guide/server-communication#HeroListComponent)
* [Fetch data with `http.get()`](guide/server-communication#fetch-data)
<li if-docs="ts"> [RxJS library](guide/server-communication#rxjs-library)
  <ul>
    <li> [Enable RxJS operators](guide/server-communication#enable-rxjs-operators)</li>
  </ul>
</li>
* [Process the response object](guide/server-communication#extract-data)
  - [Parse to `JSON`](guide/server-communication#parse-to-json)
  - [Do not return the response object](guide/server-communication#no-return-response-object)
  - [Always handle errors](guide/server-communication#error-handling)
  - [`HeroListComponent` error handling](guide/server-communication#hero-list-component)
* [Send data to the server](guide/server-communication#update)
  - [Headers](guide/server-communication#headers)
  - [JSON results](guide/server-communication#json-results)

<ul><li if-docs="ts"> [Fall back to promises](guide/server-communication#promises)</ul>

* [Cross-Origin Requests: Wikipedia example](guide/server-communication#cors)
<ul if-docs="ts">
  <li> [Search Wikipedia](guide/server-communication#search-wikipedia)</li>
  <li> [Search parameters](guide/server-communication#search-parameters)</li>
  <li> [The WikiComponent](guide/server-communication#wikicomponent)</li>
</ul>
* [A wasteful app](guide/server-communication#wasteful-app)
<li if-docs="ts"> [More fun with Observables](guide/server-communication#more-observables)
    <ul>
      <li> [Create a stream of search terms](guide/server-communication#create-stream)</li>
      <li> [Listen for search terms](guide/server-communication#listen-for-search-terms)</li>
    </ul>
</li>
* [Guarding against Cross-Site Request Forgery](guide/server-communication#xsrf)
* [Override default request headers (and other request options)](guide/server-communication#override-default-request-options)
* [Appendix: Tour of Heroes _in-memory web api_](guide/server-communication#in-mem-web-api)

A <live-example>live example</live-example> illustrates these topics.


{@a demos}

# Demos

This page describes server communication with the help of the following demos:

- [The Tour of Heroes *HTTP* client demo](guide/server-communication#http-client).
- [Fall back to !{_Promise}s](guide/server-communication#promises).
- [Cross-Origin Requests: Wikipedia example](guide/server-communication#cors).
- [More fun with Observables](guide/server-communication#more-observables).
The root `AppComponent` orchestrates these demos:

<code-example path="server-communication/src/app/app.component.ts">

</code-example>


# Providing HTTP services

First, configure the application to use server communication facilities.

The !{_Angular_Http} client communicates with the server using a familiar HTTP request/response protocol.
The `!{_Http}` client is one of a family of services in the !{_Angular_http_library}.
Before you can use the `!{_Http}` client, you need to register it as a service provider with the dependency injection system.


~~~ {.l-sub-section}

Read about providers in the [Dependency Injection](guide/dependency-injection) page.


~~~

Register providers by importing other NgModules to the root NgModule in `app.module.ts`.


<code-example path="server-communication/src/app/app.module.1.ts" linenums="false">

</code-example>


Begin by importing the necessary members.
The newcomers are the `HttpModule` and the `JsonpModule` from the !{_Angular_http_library}. For more information about imports and related terminology, see the [MDN reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) on the `import` statement.

To add these modules to the application, pass them to the `imports` array in the root `@NgModule`.

~~~ {.l-sub-section}

The `HttpModule` is necessary for making HTTP calls.
Though the `JsonpModule` isn't necessary for plain HTTP,
there is a JSONP demo later in this page.
Loading its module now saves time.

~~~


## The Tour of Heroes HTTP client demo

The first demo is a mini-version of the [tutorial](tutorial)'s "Tour of Heroes" (ToH) application.
This version gets some heroes from the server, displays them in a list, lets the user add new heroes, and saves them to the server.
The app uses the !{_Angular_Http} client to communicate via **XMLHttpRequest (XHR)**.

It works like this:
<figure class='image-display'>
  <img src='assets/images/devguide/server-communication/http-toh.gif' alt="ToH mini app" width="250">  </img>
</figure>

This demo has a single component, the `HeroListComponent`.  Here's its template:

<code-example path="server-communication/src/app/toh/hero-list.component.html">

</code-example>

It presents the list of heroes with an `ngFor`.
Below the list is an input box and an *Add Hero* button where you can enter the names of new heroes
and add them to the database.
A [template reference variable](guide/template-syntax), `newHeroName`, accesses the
value of the input box in the `(click)` event binding.
When the user clicks the button, that value is passed to the component's `addHero` method and then
the event binding clears it to make it ready for a new hero name.

Below the button is an area for an error message.


{@a oninit}


{@a HeroListComponent}
### The *HeroListComponent* class
Here's the component class:

<code-example path="server-communication/src/app/toh/hero-list.component.ts" region="component">

</code-example>

Angular [injects](guide/dependency-injection) a `HeroService` into the constructor
and the component calls that service to fetch and save data.

The component **does not talk directly to the !{_Angular_Http} client**.
The component doesn't know or care how it gets the data.
It delegates to the `HeroService`.

This is a golden rule: **always delegate data access to a supporting service class**.

Although _at runtime_ the component requests heroes immediately after creation,
you **don't** call the service's `get` method in the component's constructor.
Instead, call it inside the `ngOnInit` [lifecycle hook](guide/lifecycle-hooks)
and rely on Angular to call `ngOnInit` when it instantiates this component.

~~~ {.l-sub-section}

This is a *best practice*.
Components are easier to test and debug when their constructors are simple, and all real work
(especially calling a remote server) is handled in a separate method.

~~~


The service's `getHeroes()` and `create()` methods return an `Observable` of hero data that the !{_Angular_Http} client fetched from the server.

Think of an `Observable` as a stream of events published by some source.
To listen for events in this stream, ***subscribe*** to the `Observable`.
These subscriptions specify the actions to take when the web request
produces a success event (with the hero data in the event payload) or a fail event (with the error in the payload).
With a basic understanding of the component, you're ready to look inside the `HeroService`.


{@a HeroService}

## Fetch data with _http.get()_

In many of the previous samples the app faked the interaction with the server by
returning mock heroes in a service like this one:

<code-example path="toh-4/src/app/hero.service.ts" region="just-get-heroes" linenums="false">

</code-example>

You can revise that `HeroService` to get the heroes from the server using the !{_Angular_Http} client service:

<code-example path="server-communication/src/app/toh/hero.service.ts" region="v1">

</code-example>

Notice that the !{_Angular_Http} client service is
[injected](guide/dependency-injection) into the `HeroService` constructor.

<code-example path="server-communication/src/app/toh/hero.service.ts" region="ctor">

</code-example>

Look closely at how to call `!{_priv}http.get`:

<code-example path="server-communication/src/app/toh/hero.service.ts" region="http-get" linenums="false">

</code-example>

You pass the resource URL to `get` and it calls the server which returns heroes.


~~~ {.l-sub-section}

The server returns heroes once you've set up the [in-memory web api](guide/server-communication#in-mem-web-api)
described in the appendix below.
Alternatively, you can temporarily target a JSON file by changing the endpoint URL:

<code-example path="server-communication/src/app/toh/hero.service.ts" region="endpoint-json" linenums="false">

</code-example>



~~~




{@a extract-data}
## Process the response object
Remember that the `getHeroes()` method used an `!{_priv}extractData()` helper method to map the `!{_priv}http.get` response object to heroes:

<code-example path="server-communication/src/app/toh/hero.service.ts" region="extract-data" linenums="false">

</code-example>

The `response` object doesn't hold the data in a form the app can use directly.
You must parse the response data into a JSON object.


{@a parse-to-json}
### Parse to JSON
The response data are in JSON string form.
The app must parse that string into JavaScript objects by calling `response.json()`.



~~~ {.l-sub-section}

This is not Angular's own design.
The Angular HTTP client follows the Fetch specification for the
[response object](https://fetch.spec.whatwg.org/#response-class) returned by the `Fetch` function.
That spec defines a `json()` method that parses the response body into a JavaScript object.


~~~



~~~ {.l-sub-section}

Don't expect the decoded JSON to be the heroes !{_array} directly.
This server always wraps JSON results in an object with a `data`
property. You have to unwrap it to get the heroes.
This is conventional web API behavior, driven by
[security concerns](https://www.owasp.org/index.php/OWASP_AJAX_Security_Guidelines#Always_return_JSON_with_an_Object_on_the_outside).


~~~



~~~ {.alert.is-important}

Make no assumptions about the server API.
Not all servers return an object with a `data` property.


~~~



{@a no-return-response-object}
### Do not return the response object
The `getHeroes()` method _could_ have returned the HTTP response but this wouldn't
follow best practices.
The point of a data service is to hide the server interaction details from consumers.
The component that calls the `HeroService` only wants heroes and is kept separate
from getting them, the code dealing with where they come from, and the response object.


{@a error-handling}
### Always handle errors

An important part of dealing with I/O is anticipating errors by preparing to catch them
and do something with them. One way to handle errors is to pass an error message
back to the component for presentation to the user,
but only if it says something that the user can understand and act upon.

This simple app conveys that idea, albeit imperfectly, in the way it handles a `getHeroes` error.


<code-example path="server-communication/src/app/toh/hero.service.ts" region="error-handling" linenums="false">

</code-example>


The `catch()` operator passes the error object from `http` to the `handleError()` method.
The `handleError` method transforms the error into a developer-friendly message, 
logs it to the console, and returns the message in a new, failed Observable via `Observable.throw`.


{@a subscribe}


{@a hero-list-component}

<h3>
    <b>  HeroListComponent  </b>   error handling
</h3>


Back in the `HeroListComponent`, in `!{_priv}heroService.getHeroes()`,
the `subscribe` function has a second function parameter to handle the error message.
It sets an `errorMessage` variable that's bound conditionally in the `HeroListComponent` template.


<code-example path="server-communication/src/app/toh/hero-list.component.ts" region="getHeroes" linenums="false">

</code-example>



~~~ {.l-sub-section}

Want to see it fail? In the `HeroService`, reset the api endpoint to a bad value. Afterward, remember to restore it.



~~~

<a id="create"></a>
<a id="update"></a>
<a id="post"></a>
## Send data to the server

So far you've seen how to retrieve data from a remote location using an HTTP service.
Now you'll add the ability to create new heroes and save them in the backend.

You'll write a method for the `HeroListComponent` to call, a `create()` method, that takes
just the name of a new hero and returns an `Observable` of `Hero`. It begins like this:


<code-example path="server-communication/src/app/toh/hero.service.ts" region="create-sig" linenums="false">

</code-example>

To implement it, you must know the server's API for creating heroes.

[This sample's data server](guide/server-communication#in-mem-web-api) follows typical REST guidelines.
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


<code-example path="server-communication/src/app/toh/hero.service.ts" linenums="false" title="src/app/toh/hero.service.ts (create)" region="create">

</code-example>



{@a headers}
### Headers

In the `headers` object, the `Content-Type` specifies that the body represents JSON.


{@a json-results}
### JSON results

As with `getHeroes()`, use the `!{_priv}extractData()` helper to [extract the data](guide/server-communication#extract-data)
from the response.

Back in the `HeroListComponent`, its `addHero()` method subscribes to the Observable returned by the service's `create()` method.
When the data arrive it pushes the new hero object into its `heroes` array for presentation to the user.

<code-example path="server-communication/src/app/toh/hero-list.component.ts" region="addHero" linenums="false">

</code-example>


<h2 id='cors'>
  Cross-Origin Requests: Wikipedia example
</h2>

You just learned how to make `XMLHttpRequests` using the !{_Angular_Http} service.
This is the most common approach to server communication, but it doesn't work in all scenarios.

For security reasons, web browsers block `XHR` calls to a remote server whose origin is different from the origin of the web page.
The *origin* is the combination of URI scheme, hostname, and port number.
This is called the [same-origin policy](https://en.wikipedia.org/wiki/Same-origin_policy).


~~~ {.l-sub-section}

Modern browsers do allow `XHR` requests to servers from a different origin if the server supports the
[CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) protocol.
If the server requires user credentials, enable them in the [request headers](guide/server-communication#headers).


~~~

Some servers do not support CORS but do support an older, read-only alternative called [JSONP](https://en.wikipedia.org/wiki/JSONP).
Wikipedia is one such server.

~~~ {.l-sub-section}

This [Stack Overflow answer](http://stackoverflow.com/questions/2067472/what-is-jsonp-all-about/2067584#2067584) covers many details of JSONP.

~~~



{@a search-wikipedia}
### Search Wikipedia

Here is a simple search that shows suggestions from Wikipedia as the user
types in a text box:

<figure class='image-display'>
  <img src='assets/images/devguide/server-communication/wiki-1.gif' alt="Wikipedia search app (v.1)" width="250">  </img>
</figure>


Wikipedia offers a modern `CORS` API and a legacy `JSONP` search API. This example uses the latter.
The Angular `Jsonp` service both extends the `!{_Http}` service for JSONP and restricts you to `GET` requests.
All other HTTP methods throw an error because `JSONP` is a read-only facility.

As always, wrap the interaction with an Angular data access client service inside a dedicated service, here called `WikipediaService`.


<code-example path="server-communication/src/app/wiki/wikipedia.service.ts">

</code-example>

The constructor expects Angular to inject its `Jsonp` service, which 
is available because `JsonpModule` is in the root `@NgModule` `imports` array
in `app.module.ts`.
<a id="query-parameters"></a>### Search parameters
The [Wikipedia "opensearch" API](https://www.mediawiki.org/wiki/API:Opensearch)
expects four parameters (key/value pairs) to arrive in the request URL's query string.
The keys are `search`, `action`, `format`, and `callback`.
The value of the `search` key is the user-supplied search term to find in Wikipedia.
The other three are the fixed values "opensearch", "json", and "JSONP_CALLBACK" respectively.

~~~ {.l-sub-section}

The `JSONP` technique requires that you pass a callback function name to the server in the query string: `callback=JSONP_CALLBACK`.
The server uses that name to build a JavaScript wrapper function in its response, which Angular ultimately calls to extract the data.
All of this happens under the hood.

~~~

If you're looking for articles with the word "Angular", you could construct the query string by hand and call `jsonp` like this:

<code-example path="server-communication/src/app/wiki/wikipedia.service.1.ts" region="query-string" linenums="false">

</code-example>

In more parameterized examples you could build the query string with the Angular `URLSearchParams` helper:

<code-example path="server-communication/src/app/wiki/wikipedia.service.ts" region="search-parameters" linenums="false">

</code-example>

This time you call `jsonp` with *two* arguments: the `wikiUrl` and an options object whose `search` property is the `params` object.

<code-example path="server-communication/src/app/wiki/wikipedia.service.ts" region="call-jsonp" linenums="false">

</code-example>

`Jsonp` flattens the `params` object into the same query string you saw earlier, sending the request 
to the server.
<a id="wikicomponent"></a>### The WikiComponent

Now that you have a service that can query the Wikipedia API,
turn your attention to the component (template and class) that takes user input and displays search results.

<code-example path="server-communication/src/app/wiki/wiki.component.ts">

</code-example>

The template presents an `<input>` element *search box* to gather search terms from the user,
and calls a `search(term)` method after each `keyup` event.

The component's `search(term)` method delegates to the `WikipediaService`, which returns an 
Observable !{_array} of string results (`Observable<string[]>`).
Instead of subscribing to the Observable inside the component, as in the `HeroListComponent`,
the app forwards the Observable result to the template (via `items`) where the `async` pipe 
in the `ngFor` handles the subscription. Read more about [async pipes](guide/pipes)
in the [Pipes](guide/pipes) page.

~~~ {.l-sub-section}

The [async pipe](guide/pipes) is a good choice in read-only components 
where the component has no need to interact with the data.

`HeroListComponent` can't use the pipe because `addHero()` pushes newly created heroes into the list.

~~~



{@a wasteful-app}
## A wasteful app

The Wikipedia search makes too many calls to the server.
It is inefficient and potentially expensive on mobile devices with limited data plans.

### 1. Wait for the user to stop typing
Presently, the code calls the server after every keystroke.
It should only make requests when the user *stops typing*.
Here's how it will work after refactoring:
<figure class='image-display'>
  <img src='assets/images/devguide/server-communication/wiki-2.gif' alt="Wikipedia search app (v.2)" width="250">  </img>
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

<a id="more-observables"></a>
## More fun with Observables

You could make changes to the `WikipediaService`, but for a better
user experience, create a copy of the `WikiComponent` instead and make it smarter,
with the help of some nifty Observable operators.

Here's the `WikiSmartComponent`, shown next to the original `WikiComponent`:


<code-tabs>

  <code-pane title="src/app/wiki/wiki-smart.component.ts" path="server-communication/src/app/wiki/wiki-smart.component.ts">

  </code-pane>


  <code-pane title="src/app/wiki/wiki.component.ts" path="server-communication/src/app/wiki/wiki.component.ts">

  </code-pane>


</code-tabs>

While the templates are virtually identical,
there's a lot more RxJS in the "smart" version, 
starting with `debounceTime`, `distinctUntilChanged`, and `switchMap` operators,
imported as [described above](guide/server-communication#rxjs-library).


{@a create-stream}
### Create a stream of search terms

The `WikiComponent` passes a new search term directly to the `WikipediaService` after every keystroke.

The `WikiSmartComponent` class turns the user's keystrokes into an Observable _stream of search terms_
with the help of a `Subject`, which you import from RxJS:

<code-example path="server-communication/src/app/wiki/wiki-smart.component.ts" region="import-subject" linenums="false">

</code-example>

The component creates a `searchTermStream` as a `Subject` of type `string`.
The `search()` method adds each new search box value to that stream via the subject's `next()` method.


<code-example path="server-communication/src/app/wiki/wiki-smart.component.ts" region="subject" linenums="false">

</code-example>



{@a listen-for-search-terms}
### Listen for search terms

The `WikiSmartComponent` listens to the *stream of search terms* and 
processes that stream _before_ calling the service.

<code-example path="server-communication/src/app/wiki/wiki-smart.component.ts" region="observable-operators" linenums="false">

</code-example>

* <a href="https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/debounce.md" target="_blank" title="debounce operator"><i>debounceTime</i></a>
waits for the user to stop typing for at least 300 milliseconds.

* <a href="https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/distinctuntilchanged.md" target="_blank" title="distinctUntilChanged operator"><i>distinctUntilChanged</i></a>
ensures that the service is called only when the new search term is different from the previous search term.

* The <a href="https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/flatmaplatest.md" target="_blank" title="switchMap operator"><i>switchMap</i></a>
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

See the [XSRF topic on the Security page](guide/security) for more information about XSRF and Angular's `XSRFStrategy` counter measures.


{@a override-default-request-options}

## Override default request headers (and other request options)

Request options (such as headers) are merged into the
[default _RequestOptions_](https://angular.io/docs/ts/latest/api/http/index/BaseRequestOptions-class.html "API: BaseRequestOptions") 
before the request is processed.
The `HttpModule` provides these default options via the `RequestOptions` token.

You can override these defaults to suit your application needs
by creating a custom sub-class of `RequestOptions`
that sets the default options for the application.

This sample creates a class that sets the default `Content-Type` header to JSON.
It exports a constant with the necessary `RequestOptions` provider to simplify registration in `AppModule`.


<code-example path="server-communication/src/app/default-request-options.service.ts" linenums="false">

</code-example>

Then it registers the provider in the root `AppModule`.

<code-example path="server-communication/src/app/app.module.ts" region="provide-default-request-options" linenums="false">

</code-example>



~~~ {.l-sub-section}

Remember to include this provider during setup when unit testing the app's HTTP services.

~~~

After this change, the `header` option setting in `HeroService.create()` is no longer necessary,


<code-example path="server-communication/src/app/toh/hero.service.ts" linenums="false" title="src/app/toh/hero.service.ts (create)" region="create">

</code-example>

You can confirm that `DefaultRequestOptions` is working by examing HTTP requests in the browser developer tools' network tab.
If you're short-circuiting the server call with something like the [_in-memory web api_](guide/server-communication#in-mem-web-api),
try commenting-out the `create` header option, 
set a breakpoint on the POST call, and step through the request processing
to verify the header is there.

Individual requests options, like this one, take precedence over the default `RequestOptions`.
It might be wise to keep the `create` request header setting for extra safety.


{@a in-mem-web-api}

## Appendix: Tour of Heroes _in-memory web api_

If the app only needed to retrieve data, you could get the heroes from a `heroes.json` file:

~~~ {.l-sub-section}

You wrap the heroes array in an object with a `data` property for the same reason that a data server does:
to mitigate the [security risk](http://stackoverflow.com/questions/3503102/what-are-top-level-json-arrays-and-why-are-they-a-security-risk)
posed by top-level JSON arrays.

~~~

You'd set the endpoint to the JSON file like this:

<code-example path="server-communication/src/app/toh/hero.service.ts" region="endpoint-json" linenums="false">

</code-example>

The *get heroes* scenario would work,
but since the app can't save changes to a JSON file, it needs a web API server.
Because there isn't a real server for this demo, 
it substitutes the Angular _in-memory web api_ simulator for the actual XHR backend service.


~~~ {.l-sub-section}

The in-memory web api is not part of Angular _proper_. 
It's an optional service in its own 
<a href="https://github.com/angular/in-memory-web-api" target="_blank" title="In-memory Web API"><i>angular-in-memory-web-api</i></a>
library installed with npm (see `package.json`).

See the
<a href="https://github.com/angular/in-memory-web-api/blob/master/README.md" target="_blank" title='In-memory Web API "README.md"'><i>README file</i></a>
for configuration options, default behaviors, and limitations.


~~~

The in-memory web API gets its data from !{_a_ca_class_with} a `createDb()`
method that returns a map whose keys are collection names and whose values
are !{_array}s of objects in those collections.

Here's the class for this sample, based on the JSON data:

<code-example path="server-communication/src/app/hero-data.ts" linenums="false">

</code-example>

Ensure that the `HeroService` endpoint refers to the web API:

<code-example path="server-communication/src/app/toh/hero.service.ts" region="endpoint" linenums="false">

</code-example>


Finally, redirect client HTTP requests to the in-memory web API by
adding the `InMemoryWebApiModule` to the `AppModule.imports` list.
At the same time, call its `forRoot()` configuration method with the `HeroData` class.

<code-example path="server-communication/src/app/app.module.ts" region="in-mem-web-api" linenums="false">

</code-example>

### How it works

Angular's `http` service delegates the client/server communication tasks
to a helper service called the `XHRBackend`.

Using standard Angular provider registration techniques, the `InMemoryWebApiModule`
replaces the default `XHRBackend` service with its own in-memory alternative.
At the same time, the `forRoot` method initializes the in-memory web API with the *seed data* from the mock hero dataset.

~~~ {.l-sub-section}

The `forRoot()` method name is a strong reminder that you should only call the `InMemoryWebApiModule` _once_,
while setting the metadata for the root `AppModule`. Don't call it again.

~~~

Here is the final, revised version of <span ngio-ex>src/app/app.module.ts</span>, demonstrating these steps.


<code-example path="server-communication/src/app/app.module.ts" linenums="false" title="src/app/app.module.ts (excerpt)">

</code-example>



~~~ {.alert.is-important}

Import the `InMemoryWebApiModule` _after_ the `HttpModule` to ensure that 
the `XHRBackend` provider of the `InMemoryWebApiModule` supersedes all others.

~~~

See the full source code in the <live-example></live-example>.