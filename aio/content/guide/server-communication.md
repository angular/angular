@title
HTTP Client

@intro
Use an HTTP Client to talk to a remote server.

@description
[HTTP](https://tools.ietf.org/html/rfc2616) is the primary protocol for browser/server communication.
The [`WebSocket`](https://tools.ietf.org/html/rfc6455) protocol is another important communication technology;
it isn't covered in this page.Modern browsers support two HTTP-based APIs:
[XMLHttpRequest (XHR)](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) and
[JSONP](https://en.wikipedia.org/wiki/JSONP). A few browsers also support
[Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

The !{_Angular_http_library} simplifies application programming with the **XHR** and **JSONP** APIs.
# Contents
* [Demos](#demos)
* [Providing HTTP Services](#http-providers)
* [The Tour of Heroes *HTTP* client demo](#http-client)
  - [The `HeroListComponent` class](#HeroListComponent)
* [Fetch data with `http.get()`](#fetch-data)
<li if-docs="ts"> [RxJS library](#rxjs-library)
  <ul>
    <li> [Enable RxJS operators](#enable-rxjs-operators)</li>
  </ul>
</li>
* [Process the response object](#extract-data)
  - [Parse to `JSON`](#parse-to-json)
  - [Do not return the response object](#no-return-response-object)
  - [Always handle errors](#error-handling)
  - [`HeroListComponent` error handling](#hero-list-component)
* [Send data to the server](#update)
  - [Headers](#headers)
  - [JSON results](#json-results)

<ul><li if-docs="ts"> [Fall back to promises](#promises)</ul>

* [Cross-Origin Requests: Wikipedia example](#cors)
<ul if-docs="ts">
  <li> [Search Wikipedia](#search-wikipedia)</li>
  <li> [Search parameters](#search-parameters)</li>
  <li> [The WikiComponent](#wikicomponent)</li>
</ul>
* [A wasteful app](#wasteful-app)
<li if-docs="ts"> [More fun with Observables](#more-observables)
    <ul>
      <li> [Create a stream of search terms](#create-stream)</li>
      <li> [Listen for search terms](#listen-for-search-terms)</li>
    </ul>
</li>
* [Guarding against Cross-Site Request Forgery](#xsrf)
* [Override default request headers (and other request options)](#override-default-request-options)
* [Appendix: Tour of Heroes _in-memory web api_](#in-mem-web-api)

A <live-example>live example</live-example> illustrates these topics.


{@a demos}

# Demos

This page describes server communication with the help of the following demos:
The root `AppComponent` orchestrates these demos:

{@example 'server-communication/ts/src/app/app.component.ts'}


# Providing HTTP services

First, configure the application to use server communication facilities.

The !{_Angular_Http} client communicates with the server using a familiar HTTP request/response protocol.
The `!{_Http}` client is one of a family of services in the !{_Angular_http_library}.
Before you can use the `!{_Http}` client, you need to register it as a service provider with the dependency injection system.

Read about providers in the [Dependency Injection](dependency-injection.html) page.
Register providers by importing other NgModules to the root NgModule in `app.module.ts`.


{@example 'server-communication/ts/src/app/app.module.1.ts'}


The `HttpModule` is necessary for making HTTP calls.
Though the `JsonpModule` isn't necessary for plain HTTP,
there is a JSONP demo later in this page.
Loading its module now saves time.
## The Tour of Heroes HTTP client demo

The first demo is a mini-version of the [tutorial](../tutorial)'s "Tour of Heroes" (ToH) application.
This version gets some heroes from the server, displays them in a list, lets the user add new heroes, and saves them to the server.
The app uses the !{_Angular_Http} client to communicate via `XMLHttpRequest (XHR)`.

It works like this:
<figure class='image-display'>
  <img src='assets/images/devguide/server-communication/http-toh.gif' alt="ToH mini app" width="250">  </img>
</figure>

This demo has a single component, the `HeroListComponent`.  Here's its template:

{@example 'server-communication/ts/src/app/toh/hero-list.component.html'}

It presents the list of heroes with an `ngFor`.
Below the list is an input box and an *Add Hero* button where you can enter the names of new heroes
and add them to the database.
A [template reference variable](template-syntax.html#ref-vars), `newHeroName`, accesses the
value of the input box in the `(click)` event binding.
When the user clicks the button, that value passes to the component's `addHero` method and then
the event binding clears it to make it ready for a new hero name.

Below the button is an area for an error message.


{@a oninit}


{@a HeroListComponent}
### The *HeroListComponent* class
Here's the component class:

{@example 'server-communication/ts/src/app/toh/hero-list.component.ts' region='component'}

Angular [injects](dependency-injection.html) a `HeroService` into the constructor
and the component calls that service to fetch and save data.

The component **does not talk directly to the !{_Angular_Http} client**.
The component doesn't know or care how it gets the data.
It delegates to the `HeroService`.

This is a golden rule: **always delegate data access to a supporting service class**.

Although _at runtime_ the component requests heroes immediately after creation,
you **don't** call the service's `get` method in the component's constructor.
Instead, call it inside the `ngOnInit` [lifecycle hook](lifecycle-hooks.html)
and rely on Angular to call `ngOnInit` when it instantiates this component.
This is a *best practice*.
Components are easier to test and debug when their constructors are simple, and all real work
(especially calling a remote server) is handled in a separate method.With a basic understanding of the component, you're ready to look inside the `HeroService`.


{@a HeroService}

## Fetch data with _http.get()_

In many of the previous samples the app faked the interaction with the server by
returning mock heroes in a service like this one:

{@example 'toh-4/ts/src/app/hero.service.ts' region='just-get-heroes'}

You can revise that `HeroService` to get the heroes from the server using the !{_Angular_Http} client service:

{@example 'server-communication/ts/src/app/toh/hero.service.ts' region='v1'}

Notice that the !{_Angular_Http} client service is
[injected](dependency-injection.html) into the `HeroService` constructor.

{@example 'server-communication/ts/src/app/toh/hero.service.ts' region='ctor'}

Look closely at how to call `!{_priv}http.get`:

{@example 'server-communication/ts/src/app/toh/hero.service.ts' region='http-get'}

You pass the resource URL to `get` and it calls the server which returns heroes.

The server returns heroes once you've set up the [in-memory web api](#in-mem-web-api)
described in the appendix below.
Alternatively, you can temporarily target a JSON file by changing the endpoint URL:

{@example 'server-communication/ts/src/app/toh/hero.service.ts' region='endpoint-json'}




{@a extract-data}
## Process the response object
Remember that the `getHeroes()` method used an `!{_priv}extractData()` helper method to map the `!{_priv}http.get` response object to heroes:

{@example 'server-communication/ts/src/app/toh/hero.service.ts' region='extract-data'}

The `response` object doesn't hold the data in a form the app can use directly.
You must parse the response data into a JSON object.


{@a parse-to-json}
### Parse to JSON
Don't expect the decoded JSON to be the heroes !{_array} directly.
This server always wraps JSON results in an object with a `data`
property. You have to unwrap it to get the heroes.
This is conventional web API behavior, driven by
[security concerns](https://www.owasp.org/index.php/OWASP_AJAX_Security_Guidelines#Always_return_JSON_with_an_Object_on_the_outside).


~~~ {.alert.is-important}

Make no assumptions about the server API.
Not all servers return an object with a `data` property.


~~~



{@a no-return-response-object}
### Do not return the response object
The `getHeroes()` method _could_ have returned the HTTP response but this wouldn't
be a best practice.
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


{@example 'server-communication/ts/src/app/toh/hero.service.ts' region='error-handling'}



{@a subscribe}


{@a hero-list-component}

<h3>
    <b>  HeroListComponent  </b>   error handling
</h3>



{@example 'server-communication/ts/src/app/toh/hero-list.component.ts' region='getHeroes'}


Want to see it fail? In the `HeroService`, reset the api endpoint to a bad value. Afterward, remember to restore it.

<a id="update"></a>
<a id="post"></a>
## Send data to the server

So far you've seen how to retrieve data from a remote location using an HTTP service.
Now you'll add the ability to create new heroes and save them in the backend.

You'll write a method for the `HeroListComponent` to call, an `addHero()` method, that takes
just the name of a new hero and returns an `Observable` of `Hero`. It begins like this:


{@example 'server-communication/ts/src/app/toh/hero.service.ts' region='addhero-sig'}

To implement it, you must know the server's API for creating heroes.

[This sample's data server](#in-mem-web-api) follows typical REST guidelines.
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

Now that you know how the API works, implement `addHero()` as follows:


{@example 'server-communication/ts/src/app/toh/hero.service.ts' region='addhero'}



{@a headers}
### Headers

In the `headers` object, the `Content-Type` specifies that the body represents JSON.


{@a json-results}
### JSON results

As with `getHeroes()`, use the `!{_priv}extractData()` helper to [extract the data](#extract-data)
from the response.


{@example 'server-communication/ts/src/app/toh/hero-list.component.ts' region='addHero'}


<h2 id='cors'>
  Cross-Origin Requests: Wikipedia example
</h2>

You just learned how to make `XMLHttpRequests` using the !{_Angular_Http} service.
This is the most common approach for server communication, but it doesn't work in all scenarios.

For security reasons, web browsers block `XHR` calls to a remote server whose origin is different from the origin of the web page.
The *origin* is the combination of URI scheme, hostname, and port number.
This is called the [same-origin policy](https://en.wikipedia.org/wiki/Same-origin_policy).

Modern browsers do allow `XHR` requests to servers from a different origin if the server supports the
[CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) protocol.
If the server requires user credentials, enable them in the [request headers](#headers).
Some servers do not support CORS but do support an older, read-only alternative called [JSONP](https://en.wikipedia.org/wiki/JSONP).
Wikipedia is one such server.
This [Stack Overflow answer](http://stackoverflow.com/questions/2067472/what-is-jsonp-all-about/2067584#2067584) covers many details of JSONP.

{@a search-wikipedia}
### Search Wikipedia

Here is a simple search that shows suggestions from Wikipedia as the user
types in a text box:

<figure class='image-display'>
  <img src='assets/images/devguide/server-communication/wiki-1.gif' alt="Wikipedia search app (v.1)" width="250">  </img>
</figure>



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

See the [XSRF topic on the Security page](security.html#xsrf) for more information about XSRF and Angular's `XSRFStrategy` counter measures.


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


{@example 'server-communication/ts/src/app/default-request-options.service.ts'}

Then it registers the provider in the root `AppModule`.

{@example 'server-communication/ts/src/app/app.module.ts' region='provide-default-request-options'}


Remember to include this provider during setup when unit testing the app's HTTP services.After this change, the `header` option setting in `HeroService.addHero()` is no longer necessary,


{@example 'server-communication/ts/src/app/toh/hero.service.ts' region='addhero'}

You can confirm that `DefaultRequestOptions` is working by examing HTTP requests in the browser developer tools' network tab.
If you're short-circuiting the server call with something like the [_in-memory web api_](#in-mem-web-api),
try commenting-out the `addHero` header option, 
set a breakpoint on the POST call, and step through the request processing
to verify the header is there.

Individual requests options, like this one, take precedence over the default `RequestOptions`.
It might be wise to keep the `addHero` request header setting for extra safety.


{@a in-mem-web-api}

## Appendix: Tour of Heroes _in-memory web api_

If the app only needed to retrieve data, you could get the heroes from a `heroes.json` file:
You wrap the heroes array in an object with a `data` property for the same reason that a data server does:
to mitigate the [security risk](http://stackoverflow.com/questions/3503102/what-are-top-level-json-arrays-and-why-are-they-a-security-risk)
posed by top-level JSON arrays.You'd set the endpoint to the JSON file like this:

{@example 'server-communication/ts/src/app/toh/hero.service.ts' region='endpoint-json'}

The *get heroes* scenario would work,
but since the app can't save changes to a JSON file, it needs a web API server.
Because there isn't a real server for this demo, 
it substitutes the Angular _in-memory web api_ simulator for the actual XHR backend service.

The in-memory web api is not part of Angular _proper_. 
It's an optional service in its own 
<a href="https://github.com/angular/in-memory-web-api" target="_blank" title="In-memory Web API"><i>angular-in-memory-web-api</i></a>
library installed with npm (see `package.json`).

See the
<a href="https://github.com/angular/in-memory-web-api/blob/master/README.md" target="_blank" title='In-memory Web API "README.md"'><i>README file</i></a>
for configuration options, default behaviors, and limitations.
The in-memory web API gets its data from !{_a_ca_class_with} a `createDb()`
method that returns a map whose keys are collection names and whose values
are !{_array}s of objects in those collections.

Here's the class for this sample, based on the JSON data:

{@example 'server-communication/ts/src/app/hero-data.ts'}

Ensure that the `HeroService` endpoint refers to the web API:

{@example 'server-communication/ts/src/app/toh/hero.service.ts' region='endpoint'}

Here is the final, revised version of <span ngio-ex>src/app/app.module.ts</span>, demonstrating these steps.


~~~ {.alert.is-important}

Import the `InMemoryWebApiModule` _after_ the `HttpModule` to ensure that 
the `XHRBackend` provider of the `InMemoryWebApiModule` supersedes all others.

~~~

See the full source code in the <live-example></live-example>.