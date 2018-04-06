# HTTP

In this tutorial, you'll add the following data persistence features with help from
Angular's `HttpClient`.

* The `HeroService` gets hero data with HTTP requests.
* Users can add, edit, and delete heroes and save these changes over HTTP.
* Users can search for heroes by name.

When you're done with this page, the app should look like this <live-example></live-example>.

## Enable HTTP services

`HttpClient` is Angular's mechanism for communicating with a remote server over HTTP. 

To make `HttpClient` available everywhere in the app,

* open the root `AppModule`, 
* import the `HttpClientModule` symbol from `@angular/common/http`,
* add it to the `@NgModule.imports` array.

## Simulate a data server

This tutorial sample _mimics_ communication with a remote data server by using the
[_In-memory Web API_](https://github.com/angular/in-memory-web-api "In-memory Web API") module.

After installing the module, the app will make requests to and receive responses from the `HttpClient`
without knowing that the *In-memory Web API* is intercepting those requests,
applying them to an in-memory data store, and returning simulated responses.

This facility is a great convenience for the tutorial.
You won't have to set up a server to learn about `HttpClient`.

It may also be convenient in the early stages of your own app development when
the server's web api is ill-defined or not yet implemented.

<div class="alert is-important">

**Important:** the *In-memory Web API* module has nothing to do with HTTP in Angular.

If you're just _reading_ this tutorial to learn about `HttpClient`, you can [skip over](#import-heroes) this step.
If you're _coding along_ with this tutorial, stay here and add the *In-memory Web API* now.

</div>

Install the *In-memory Web API* package from _npm_

<code-example language="sh" class="code-shell">
  npm install angular-in-memory-web-api --save
</code-example>

Import the `InMemoryWebApiModule` and the `InMemoryDataService` class, 
which you will create in a moment.

<code-example 
  path="toh-pt6/src/app/app.module.ts" 
  region="import-in-mem-stuff" 
  title="src/app/app.module.ts (In-memory Web API imports)">
</code-example>

Add the `InMemoryWebApiModule` to the `@NgModule.imports` array&mdash;
_after importing the `HttpClient`_,
&mdash;while configuring it with the `InMemoryDataService`.

<code-example   
  path="toh-pt6/src/app/app.module.ts" 
  region="in-mem-web-api-imports">
</code-example>

The `forRoot()` configuration method takes an `InMemoryDataService` class
that primes the in-memory database.

The _Tour of Heroes_ sample creates such a class 
`src/app/in-memory-data.service.ts` which has the following content:

<code-example path="toh-pt6/src/app/in-memory-data.service.ts" region="init" title="src/app/in-memory-data.service.ts" linenums="false"></code-example>

This file replaces `mock-heroes.ts`, which is now safe to delete.

When your server is ready, detach the *In-memory Web API*, and the app's requests will go through to the server.

Now back to the `HttpClient` story.

{@a import-heroes}
## Heroes and HTTP

Import some HTTP symbols that you'll need:

<code-example
  path="toh-pt6/src/app/hero.service.ts" 
  region="import-httpclient" 
  title="src/app/hero.service.ts (import HTTP symbols)">
</code-example>

Inject `HttpClient` into the constructor in a private property called `http`.

<code-example 
  path="toh-pt6/src/app/hero.service.ts" 
  region="ctor" >
</code-example>

Keep injecting the `MessageService`. You'll call it so frequently that
you'll wrap it in private `log` method.

<code-example 
  path="toh-pt6/src/app/hero.service.ts" 
  region="log" >
</code-example>

Define the `heroesUrl` with the address of the heroes resource on the server.

<code-example 
  path="toh-pt6/src/app/hero.service.ts" 
  region="heroesUrl" >
</code-example>

### Get heroes with _HttpClient_

The current `HeroService.getHeroes()` 
uses the RxJS `of()` function to return an array of mock heroes
as an `Observable<Hero[]>`.

<code-example 
  path="toh-pt4/src/app/hero.service.ts" 
  region="getHeroes-1" 
  title="src/app/hero.service.ts (getHeroes with RxJs 'of()')">
</code-example>

Convert that method to use `HttpClient`
<code-example 
  path="toh-pt6/src/app/hero.service.ts" 
  region="getHeroes-1">
</code-example>

Refresh the browser. The hero data should successfully load from the
mock server.

You've swapped `of` for `http.get` and the app keeps working without any other changes
because both functions return an `Observable<Hero[]>`.

### Http methods return one value

All `HttpClient` methods return an RxJS `Observable` of something.

HTTP is a request/response protocol. 
You make a request, it returns a single response.

In general, an observable _can_ return multiple values over time.
An observable from `HttpClient` always emits a single value and then completes, never to emit again.

This particular `HttpClient.get` call returns an `Observable<Hero[]>`, literally "_an observable of hero arrays_". In practice, it will only return a single hero array.

### _HttpClient.get_ returns response data

`HttpClient.get` returns the _body_ of the response as an untyped JSON object by default.
Applying the optional type specifier, `<Hero[]>` , gives you a typed result object.

The shape of the JSON data is determined by the server's data API.
The _Tour of Heroes_ data API returns the hero data as an array.

<div class="l-sub-section">

Other APIs may bury the data that you want within an object.
You might have to dig that data out by processing the `Observable` result
with the RxJS `map` operator.

Although not discussed here, there's an example of `map` in the `getHeroNo404()`
method included in the sample source code.

</div>

### Error handling

Things go wrong, especially when you're getting data from a remote server.
The `HeroService.getHeroes()` method should catch errors and do something appropriate.

To catch errors, you **"pipe" the observable** result from `http.get()` through an RxJS `catchError()` operator.

Import the `catchError` symbol from `rxjs/operators`, along with some other operators you'll need later.

<code-example 
  path="toh-pt6/src/app/hero.service.ts" 
  region="import-rxjs-operators">
</code-example>

Now extend the observable result with the `.pipe()` method and
give it a `catchError()` operator.

<code-example 
  path="toh-pt6/src/app/hero.service.ts" 
  region="getHeroes-2" >
</code-example>

The `catchError()` operator intercepts an **`Observable` that failed**.
It passes the error an _error handler_ that can do what it wants with the error.

The following `handleError()` method reports the error and then returns an
innocuous result so that the application keeps working.

#### _handleError_

The following `errorHandler()` will be shared by many `HeroService` methods
so it's generalized to meet their different needs.

Instead of handling the error directly, it returns an _error handler_ function to `catchError` that it 
has configured with both the name of the operation that failed and a safe return value.

<code-example 
  path="toh-pt6/src/app/hero.service.ts" 
  region="handleError">
</code-example>

After reporting the error to console, the handler constructs
a user friendly message and returns a safe value to the app so it can keep working.

Because each service method returns a different kind of `Observable` result,
`errorHandler()` takes a type parameter so it can return the safe value as the type that the app expects.

### Tap into the _Observable_

The `HeroService` methods will **tap** into the flow of observable values
and send a message (via `log()`) to the message area at the bottom of the page.

They'll do that with the RxJS `tap` operator,
which _looks_ at the observable values, does _something_ with those values,
and passes them along.
The `tap` call back doesn't touch the values themselves.

Here is the final version of `getHeroes` with the `tap` that logs the operation.

<code-example 
  path="toh-pt6/src/app/hero.service.ts" 
  region="getHeroes" >
</code-example>

### Get hero by id

Most web APIs support a _get by id_ request in the form `api/hero/:id` 
(such as `api/hero/11`).
Add a `HeroService.getHero()` method to make that request:

<code-example path="toh-pt6/src/app/hero.service.ts" region="getHero" title="src/app/hero.service.ts"></code-example>

There are three significant differences from  `getHeroes()`.

* it constructs a request URL with the desired hero's id.
* the server should respond with a single hero rather than an array of heroes.
* therefore, `getHero` returns an `Observable<Hero>` ("_an observable of Hero objects_")
 rather than an observable of hero _arrays_ .

## Update heroes

Editing a hero's name in the _hero detail_ view.
As you type, the hero name updates the heading at the top of the page.
But when you click the "go back button", the changes are lost.

If you want changes to persist, you must write them back to
the server.

At the end of the hero detail template, add a save button with a `click` event
binding that invokes a new component method named `save()`.

<code-example path="toh-pt6/src/app/hero-detail/hero-detail.component.html" region="save" title="src/app/hero-detail/hero-detail.component.html (save)"></code-example>

Add the following `save()` method, which persists hero name changes using the hero service
`updateHero()` method and then navigates back to the previous view.

<code-example path="toh-pt6/src/app/hero-detail/hero-detail.component.ts" region="save" title="src/app/hero-detail/hero-detail.component.ts (save)"></code-example>

#### Add _HeroService.updateHero()_

The overall structure of the `updateHero()` method is similar to that of
`getHeroes()`, but it uses `http.put()` to persist the changed hero
on the server.

<code-example 
  path="toh-pt6/src/app/hero.service.ts" 
  region="updateHero" 
  title="src/app/hero.service.ts (update)">
</code-example>

The `HttpClient.put()` method takes three parameters
* the URL
* the data to update (the modified hero in this case)
* options

The URL is unchanged. The heroes web API knows which hero to update by looking at the hero's `id`.

The heroes web API expects a special header in HTTP save requests.
That header is in the `httpOptions` constant defined in the `HeroService`.

<code-example 
  path="toh-pt6/src/app/hero.service.ts" 
  region="http-options">
</code-example>

Refresh the browser, change a hero name, save your change,
and click the "go back" button. 
The hero now appears in the list with the changed name.

## Add a new hero

To add a hero, this app only needs the hero's name. You can use an `input`
element paired with an add button.

Insert the following into the `HeroesComponent` template, just after
the heading:

<code-example path="toh-pt6/src/app/heroes/heroes.component.html" region="add" title="src/app/heroes/heroes.component.html (add)"></code-example>

In response to a click event, call the component's click handler and then
clear the input field so that it's ready for another name.

<code-example path="toh-pt6/src/app/heroes/heroes.component.ts" region="add" title="src/app/heroes/heroes.component.ts (add)"></code-example>

When the given name is non-blank, the handler creates a `Hero`-like object
from the name (it's only missing the `id`) and passes it to the services `addHero()` method.

When `addHero` saves successfully, the `subscribe` callback
receives the new hero and pushes it into to the `heroes` list for display.

You'll write `HeroService.addHero` in the next section.

#### Add _HeroService.addHero()_

Add the following `addHero()` method to the `HeroService` class.

<code-example path="toh-pt6/src/app/hero.service.ts" region="addHero" title="src/app/hero.service.ts (addHero)"></code-example>

`HeroService.addHero()` differs from `updateHero` in two ways.

* it calls `HttpClient.post()` instead of `put()`.
* it expects the server to generates an id for the new hero, 
which it returns in the `Observable<Hero>` to the caller.

Refresh the browser and add some heroes.

## Delete a hero

Each hero in the heroes list should have a delete button.

Add the following button element to the `HeroesComponent` template, after the hero
name in the repeated `<li>` element.

<code-example path="toh-pt6/src/app/heroes/heroes.component.html" region="delete"></code-example>

The HTML for the list of heroes should look like this:

<code-example path="toh-pt6/src/app/heroes/heroes.component.html" region="list" title="src/app/heroes/heroes.component.html (list of heroes)"></code-example>

To position the delete button at the far right of the hero entry,
add some CSS to the `heroes.component.css`.  You'll find that CSS
in the [final review code](#heroescomponent) below.

Add the `delete()` handler to the component.

<code-example path="toh-pt6/src/app/heroes/heroes.component.ts" region="delete" title="src/app/heroes/heroes.component.ts (delete)"></code-example>

Although the component delegates hero deletion to the `HeroService`,
it remains responsible for updating its own list of heroes.
The component's `delete()` method immediately removes the _hero-to-delete_ from that list,
anticipating that the `HeroService` will succeed on the server.

There's really nothing for the component to do with the `Observable` returned by
`heroService.delete()`. **It must subscribe anyway**.

<div class="alert is-important">

  If you neglect to `subscribe()`, the service will not send the delete request to the server!
  As a rule, an `Observable` _does nothing_ until something subscribes!
  
  Confirm this for yourself by temporarily removing the `subscribe()`,
  clicking "Dashboard", then clicking "Heroes".
  You'll see the full list of heroes again.

</div>

#### Add _HeroService.deleteHero()_

Add a `deleteHero()` method to `HeroService` like this.

<code-example path="toh-pt6/src/app/hero.service.ts" region="deleteHero" title="src/app/hero.service.ts (delete)"></code-example>

Note that

* it calls `HttpClient.delete`.
* the URL is the heroes resource URL plus the `id` of the hero to delete
* you don't send data as you did with `put` and `post`.
* you still send the `httpOptions`.

Refresh the browser and try the new delete functionality.

## Search by name

In this last exercise, you learn to chain `Observable` operators together
so you can minimize the number of similar HTTP requests
and consume network bandwidth economically.

You will add a *heroes search* feature to the *Dashboard*.
As the user types a name into a search box, 
you'll make repeated HTTP requests for heroes filtered by that name.
Your goal is to issue only as many requests as necessary.

#### _HeroService.searchHeroes_

Start by adding a `searchHeroes` method to the `HeroService`.

<code-example 
  path="toh-pt6/src/app/hero.service.ts" 
  region="searchHeroes"
  title="src/app/hero.service.ts">
</code-example>

The method returns immediately with an empty array if there is no search term.
The rest of it closely resembles `getHeroes()`.
The only significant difference is the URL, 
which includes a query string with the search term.

### Add search to the Dashboard

Open the `DashboardComponent` _template_ and
Add the hero search element, `<app-hero-search>`, to the bottom of the `DashboardComponent` template.

<code-example 
  path="toh-pt6/src/app/dashboard/dashboard.component.html" title="src/app/dashboard/dashboard.component.html" linenums="false">
</code-example>

This template looks a lot like the `*ngFor` repeater in the `HeroesComponent` template.

Unfortunately, adding this element breaks the app.
Angular can't find a component with a selector that matches `<app-hero-search>`.

The `HeroSearchComponent` doesn't exist yet. Fix that.

### Create _HeroSearchComponent_

Create a `HeroSearchComponent` with the CLI.

<code-example language="sh" class="code-shell">
  ng generate component hero-search
</code-example>

The CLI generates the three `HeroSearchComponent` and adds the component to the `AppModule' declarations

Replace the generated `HeroSearchComponent` _template_ with a text box and a list of matching search results like this.

<code-example path="toh-pt6/src/app/hero-search/hero-search.component.html" title="src/app/hero-search/hero-search.component.html"></code-example>

Add private CSS styles to `hero-search.component.css`
as listed in the [final code review](#herosearchcomponent) below.

As the user types in the search box, a *keyup* event binding calls the component's `search()`
method with the new search box value.

{@a asyncpipe}

### _AsyncPipe_

As expected, the `*ngFor` repeats hero objects.

Look closely and you'll see that the `*ngFor` iterates over a list called `heroes$`, not `heroes`.

<code-example path="toh-pt6/src/app/hero-search/hero-search.component.html" region="async"></code-example>

The `$` is a convention that indicates `heroes$` is an `Observable`, not an array.

The `*ngFor` can't do anything with an `Observable`.
But there's also a pipe character (`|`) followed by `async`,
which identifies Angular's `AsyncPipe`.

The `AsyncPipe` subscribes to an `Observable` automatically so you won't have to
do so in the component class.

### Fix the _HeroSearchComponent_ class

Replace the generated `HeroSearchComponent` class and metadata as follows.

<code-example path="toh-pt6/src/app/hero-search/hero-search.component.ts" title="src/app/hero-search/hero-search.component.ts"></code-example>

Notice the declaration of `heroes$` as an `Observable`
<code-example 
  path="toh-pt6/src/app/hero-search/hero-search.component.ts" 
  region="heroes-stream">
</code-example>

You'll set it in [`ngOnInit()`](#search-pipe). 
Before you do, focus on the definition of `searchTerms`.

### The _searchTerms_ RxJS subject

The `searchTerms` property is declared as an RxJS `Subject`.

<code-example path="toh-pt6/src/app/hero-search/hero-search.component.ts" region="searchTerms"></code-example>

A `Subject` is both a source of _observable_ values and an `Observable` itself.
You can subscribe to a `Subject` as you would any `Observable`.

You can also push values into that `Observable` by calling its `next(value)` method
as the `search()` method does.

The `search()` method is called via an _event binding_ to the
textbox's `keystroke` event.

<code-example path="toh-pt6/src/app/hero-search/hero-search.component.html" region="input"></code-example>

Every time the user types in the textbox, the binding calls `search()` with the textbox value, a "search term". 
The `searchTerms` becomes an `Observable` emitting a steady stream of search terms.

{@a search-pipe}

### Chaining RxJS operators

Passing a new search term directly to the `searchHeroes()` after every user keystroke would create an excessive amount of HTTP requests,
taxing server resources and burning through the cellular network data plan.

Instead, the `ngOnInit()` method pipes the `searchTerms` observable through a sequence of RxJS operators that reduce the number of calls to the `searchHeroes()`,
ultimately returning an observable of timely hero search results (each a `Hero[]`).

Here's the code.

<code-example 
  path="toh-pt6/src/app/hero-search/hero-search.component.ts" 
  region="search">
</code-example>



* `debounceTime(300)` waits until the flow of new string events pauses for 300 milliseconds
before passing along the latest string. You'll never make requests more frequently than 300ms.


* `distinctUntilChanged()` ensures that a request is sent only if the filter text changed.


* `switchMap()` calls the search service for each search term that makes it through `debounce` and `distinctUntilChanged`.
It cancels and discards previous search observables, returning only the latest search service observable.


<div class="l-sub-section">

  With the [switchMap operator](http://www.learnrxjs.io/operators/transformation/switchmap.html),
  every qualifying key event can trigger an `HttpClient.get()` method call.
  Even with a 300ms pause between requests, you could have multiple HTTP requests in flight
  and they may not return in the order sent.

  `switchMap()` preserves the original request order while returning only the observable from the most recent HTTP method call.
  Results from prior calls are canceled and discarded.

  Note that _canceling_ a previous `searchHeroes()` _Observable_
  doesn't actually abort a pending HTTP request.
  Unwanted results are simply discarded before they reach your application code.

</div>

Remember that the component _class_ does not subscribe to the `heroes$` _observable_.
That's the job of the [`AsyncPipe`](#asyncpipe) in the template.

#### Try it

Run the app again. In the *Dashboard*, enter some text in the search box.
If you enter characters that match any existing hero names, you'll see something like this.

<figure>
  <img src='generated/images/guide/toh/toh-hero-search.png' alt="Hero Search Component">
</figure>

## Final code review

Your app should look like this <live-example></live-example>.

Here are the code files discussed on this page (all in the `src/app/` folder).

{@a heroservice}
{@a inmemorydataservice}
{@a appmodule}
#### _HeroService_, _InMemoryDataService_, _AppModule_

<code-tabs>
  <code-pane 
    title="hero.service.ts" 
    path="toh-pt6/src/app/hero.service.ts">
  </code-pane>
  <code-pane 
    title="in-memory-data.service.ts"
    path="toh-pt6/src/app/in-memory-data.service.ts">
  </code-pane>
  <code-pane 
    title="app.module.ts" 
    path="toh-pt6/src/app/app.module.ts">
  </code-pane>
</code-tabs>

{@a heroescomponent}
#### _HeroesComponent_

<code-tabs>
  <code-pane 
    title="heroes/heroes.component.html" 
    path="toh-pt6/src/app/heroes/heroes.component.html">
  </code-pane>
  <code-pane 
    title="heroes/heroes.component.ts" 
    path="toh-pt6/src/app/heroes/heroes.component.ts">
  </code-pane>
  <code-pane 
    title="heroes/heroes.component.css" 
    path="toh-pt6/src/app/heroes/heroes.component.css">
  </code-pane>
</code-tabs>

{@a herodetailcomponent}
#### _HeroDetailComponent_

<code-tabs>
  <code-pane 
    title="hero-detail/hero-detail.component.html"
    path="toh-pt6/src/app/hero-detail/hero-detail.component.html">
  </code-pane>
  <code-pane 
    title="hero-detail/hero-detail.component.ts" 
    path="toh-pt6/src/app/hero-detail/hero-detail.component.ts">
  </code-pane>
</code-tabs>

{@a herosearchcomponent}
#### _HeroSearchComponent_

<code-tabs>
  <code-pane 
    title="hero-search/hero-search.component.html"
    path="toh-pt6/src/app/hero-search/hero-search.component.html">
  </code-pane>
  <code-pane 
    title="hero-search/hero-search.component.ts"
    path="toh-pt6/src/app/hero-search/hero-search.component.ts">
  </code-pane>
  <code-pane 
    title="hero-search/hero-search.component.css"
    path="toh-pt6/src/app/hero-search/hero-search.component.css">
  </code-pane>
</code-tabs>

## Summary

You're at the end of your journey, and you've accomplished a lot.
* You added the necessary dependencies to use HTTP in the app.
* You refactored `HeroService` to load heroes from a web API.
* You extended `HeroService` to support `post()`, `put()`, and `delete()` methods.
* You updated the components to allow adding, editing, and deleting of heroes.
* You configured an in-memory web API.
* You learned how to use observables.

This concludes the "Tour of Heroes" tutorial.
You're ready to learn more about Angular development in the fundamentals section,
starting with the [Architecture](guide/architecture "Architecture") guide.
