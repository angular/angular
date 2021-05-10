# Get data from a server

In this tutorial, you'll add the following data persistence features with help from
Angular's `HttpClient`.

* The `HeroService` gets hero data with HTTP requests.
* Users can add, edit, and delete heroes and save these changes over HTTP.
* Users can search for heroes by name.

<div class="alert is-helpful">

  For the sample application that this page describes, see the <live-example></live-example>.

</div>

## Enable HTTP services

`HttpClient` is Angular's mechanism for communicating with a remote server over HTTP.

Make `HttpClient` available everywhere in the application in two steps. First, add it to the root `AppModule` by importing it:

<code-example path="toh-pt6/src/app/app.module.ts" region="import-http-client" header="src/app/app.module.ts (HttpClientModule import)">
</code-example>

Next, still in the `AppModule`, add `HttpClientModule` to the `imports` array:

<code-example path="toh-pt6/src/app/app.module.ts" region="import-httpclientmodule" header="src/app/app.module.ts (imports array excerpt)">
</code-example>


## Simulate a data server

This tutorial sample mimics communication with a remote data server by using the
[In-memory Web API](https://github.com/angular/angular/tree/master/packages/misc/angular-in-memory-web-api "In-memory Web API") module.

After installing the module, the application will make requests to and receive responses from the `HttpClient`
without knowing that the *In-memory Web API* is intercepting those requests,
applying them to an in-memory data store, and returning simulated responses.

By using the In-memory Web API, you won't have to set up a server to learn about `HttpClient`.

<div class="alert is-important">

**Important:** the In-memory Web API module has nothing to do with HTTP in Angular.

If you're reading this tutorial to learn about `HttpClient`, you can [skip over](#import-heroes) this step.
If you're coding along with this tutorial, stay here and add the In-memory Web API now.

</div>

Install the In-memory Web API package from npm with the following command:

<code-example language="sh">
  npm install angular-in-memory-web-api --save
</code-example>

In the `AppModule`, import the `HttpClientInMemoryWebApiModule` and the `InMemoryDataService` class,
which you will create in a moment.

<code-example path="toh-pt6/src/app/app.module.ts" region="import-in-mem-stuff" header="src/app/app.module.ts (In-memory Web API imports)">
</code-example>

After the `HttpClientModule`, add the `HttpClientInMemoryWebApiModule`
to the `AppModule` `imports` array and configure it with the `InMemoryDataService`.

<code-example path="toh-pt6/src/app/app.module.ts" header="src/app/app.module.ts (imports array excerpt)" region="in-mem-web-api-imports">
</code-example>

The `forRoot()` configuration method takes an `InMemoryDataService` class
that primes the in-memory database.

Generate the class `src/app/in-memory-data.service.ts` with the following command:

<code-example language="sh">
  ng generate service InMemoryData
</code-example>

Replace the default contents of `in-memory-data.service.ts` with the following:

<code-example path="toh-pt6/src/app/in-memory-data.service.ts" region="init" header="src/app/in-memory-data.service.ts"></code-example>

The `in-memory-data.service.ts` file will take over the function of `mock-heroes.ts`.
However, don't delete `mock-heroes.ts` yet, as you still need it for a few more steps of this tutorial.

When the server is ready, you'll detach the In-memory Web API, and the application's requests will go through to the server.


{@a import-heroes}
## Heroes and HTTP

In the `HeroService`, import `HttpClient` and `HttpHeaders`:

<code-example path="toh-pt6/src/app/hero.service.ts" region="import-httpclient" header="src/app/hero.service.ts (import HTTP symbols)">
</code-example>

Still in the `HeroService`, inject `HttpClient` into the constructor in a private property called `http`.

<code-example path="toh-pt6/src/app/hero.service.ts" header="src/app/hero.service.ts" region="ctor" >
</code-example>

Notice that you keep injecting the `MessageService` but since you'll call it so frequently, wrap it in a private `log()` method:

<code-example path="toh-pt6/src/app/hero.service.ts" header="src/app/hero.service.ts" region="log" >
</code-example>

Define the `heroesUrl` of the form `:base/:collectionName` with the address of the heroes resource on the server.
 Here `base` is the resource to which requests are made,
 and `collectionName` is the heroes data object in the `in-memory-data-service.ts`.

<code-example path="toh-pt6/src/app/hero.service.ts" header="src/app/hero.service.ts" region="heroesUrl" >
</code-example>

### Get heroes with `HttpClient`

The current `HeroService.getHeroes()`
uses the RxJS `of()` function to return an array of mock heroes
as an `Observable<Hero[]>`.

<code-example path="toh-pt4/src/app/hero.service.ts" region="getHeroes-1" header="src/app/hero.service.ts (getHeroes with RxJs 'of()')">
</code-example>

Convert that method to use `HttpClient` as follows:

<code-example path="toh-pt6/src/app/hero.service.ts" header="src/app/hero.service.ts" region="getHeroes-1">
</code-example>

Refresh the browser. The hero data should successfully load from the
mock server.

You've swapped `of()` for `http.get()` and the application keeps working without any other changes
because both functions return an `Observable<Hero[]>`.

### `HttpClient` methods return one value

All `HttpClient` methods return an RxJS `Observable` of something.

HTTP is a request/response protocol.
You make a request, it returns a single response.

In general, an observable _can_ return multiple values over time.
An observable from `HttpClient` always emits a single value and then completes, never to emit again.

This particular `HttpClient.get()` call returns an `Observable<Hero[]>`; that is, "_an observable of hero arrays_". In practice, it will only return a single hero array.

### `HttpClient.get()` returns response data

`HttpClient.get()` returns the body of the response as an untyped JSON object by default.
Applying the optional type specifier, `<Hero[]>` , adds TypeScript capabilities, which reduce errors during compile time.

The server's data API determines the shape of the JSON data.
The _Tour of Heroes_ data API returns the hero data as an array.

<div class="alert is-helpful">

Other APIs may bury the data that you want within an object.
You might have to dig that data out by processing the `Observable` result
with the RxJS `map()` operator.

Although not discussed here, there's an example of `map()` in the `getHeroNo404()`
method included in the sample source code.

</div>

### Error handling

Things go wrong, especially when you're getting data from a remote server.
The `HeroService.getHeroes()` method should catch errors and do something appropriate.

To catch errors, you **"pipe" the observable** result from `http.get()` through an RxJS `catchError()` operator.

Import the `catchError` symbol from `rxjs/operators`, along with some other operators you'll need later.

<code-example path="toh-pt6/src/app/hero.service.ts" header="src/app/hero.service.ts" region="import-rxjs-operators">
</code-example>

Now extend the observable result with the `pipe()` method and
give it a `catchError()` operator.

<code-example path="toh-pt6/src/app/hero.service.ts" region="getHeroes-2" header="src/app/hero.service.ts">
</code-example>

The `catchError()` operator intercepts an **`Observable` that failed**.
The operator then passes the error to the error handling function.

The following `handleError()` method reports the error and then returns an
innocuous result so that the application keeps working.

#### `handleError`

The following `handleError()` will be shared by many `HeroService` methods
so it's generalized to meet their different needs.

Instead of handling the error directly, it returns an error handler function to `catchError` that it
has configured with both the name of the operation that failed and a safe return value.

<code-example path="toh-pt6/src/app/hero.service.ts" header="src/app/hero.service.ts" region="handleError">
</code-example>

After reporting the error to the console, the handler constructs
a user friendly message and returns a safe value to the application so the application can keep working.

Because each service method returns a different kind of `Observable` result,
`handleError()` takes a type parameter so it can return the safe value as the type that the application expects.

### Tap into the Observable

The `HeroService` methods will **tap** into the flow of observable values
and send a message, using the `log()` method, to the message area at the bottom of the page.

They'll do that with the RxJS `tap()` operator,
which looks at the observable values, does something with those values,
and passes them along.
The `tap()` call back doesn't touch the values themselves.

Here is the final version of `getHeroes()` with the `tap()` that logs the operation.

<code-example path="toh-pt6/src/app/hero.service.ts" header="src/app/hero.service.ts"  region="getHeroes" >
</code-example>

### Get hero by id

Most web APIs support a _get by id_ request in the form `:baseURL/:id`.

Here, the _base URL_ is the `heroesURL` defined in the [Heroes and HTTP](tutorial/toh-pt6#heroes-and-http) section (`api/heroes`) and _id_ is
the number of the hero that you want to retrieve. For example, `api/heroes/11`.

Update the `HeroService` `getHero()` method with the following to make that request:

<code-example path="toh-pt6/src/app/hero.service.ts" region="getHero" header="src/app/hero.service.ts"></code-example>

There are three significant differences from  `getHeroes()`:

* `getHero()` constructs a request URL with the desired hero's id.
* The server should respond with a single hero rather than an array of heroes.
* `getHero()` returns an `Observable<Hero>` ("_an observable of Hero objects_")
 rather than an observable of hero _arrays_ .

## Update heroes

Edit a hero's name in the hero detail view.
As you type, the hero name updates the heading at the top of the page.
But when you click the "go back button", the changes are lost.

If you want changes to persist, you must write them back to
the server.

At the end of the hero detail template, add a save button with a `click` event
binding that invokes a new component method named `save()`.

<code-example path="toh-pt6/src/app/hero-detail/hero-detail.component.html" region="save" header="src/app/hero-detail/hero-detail.component.html (save)"></code-example>

In the `HeroDetail` component class, add the following `save()` method, which persists hero name changes using the hero service
`updateHero()` method and then navigates back to the previous view.

<code-example path="toh-pt6/src/app/hero-detail/hero-detail.component.ts" region="save" header="src/app/hero-detail/hero-detail.component.ts (save)"></code-example>

#### Add `HeroService.updateHero()`

The overall structure of the `updateHero()` method is similar to that of
`getHeroes()`, but it uses `http.put()` to persist the changed hero
on the server. Add the following to the `HeroService`.

<code-example path="toh-pt6/src/app/hero.service.ts" region="updateHero" header="src/app/hero.service.ts (update)">
</code-example>

The `HttpClient.put()` method takes three parameters:
* the URL
* the data to update (the modified hero in this case)
* options

The URL is unchanged. The heroes web API knows which hero to update by looking at the hero's `id`.

The heroes web API expects a special header in HTTP save requests.
That header is in the `httpOptions` constant defined in the `HeroService`. Add the following to the `HeroService` class.

<code-example path="toh-pt6/src/app/hero.service.ts" region="http-options" header="src/app/hero.service.ts">
</code-example>

Refresh the browser, change a hero name and save your change. The `save()`
method in `HeroDetailComponent` navigates to the previous view.
The hero now appears in the list with the changed name.


## Add a new hero

To add a hero, this application only needs the hero's name. You can use an `<input>`
element paired with an add button.

Insert the following into the `HeroesComponent` template, after
the heading:

<code-example path="toh-pt6/src/app/heroes/heroes.component.html" region="add" header="src/app/heroes/heroes.component.html (add)"></code-example>

In response to a click event, call the component's click handler, `add()`, and then
clear the input field so that it's ready for another name. Add the following to the
`HeroesComponent` class:

<code-example path="toh-pt6/src/app/heroes/heroes.component.ts" region="add" header="src/app/heroes/heroes.component.ts (add)"></code-example>

When the given name is non-blank, the handler creates a `Hero`-like object
from the name (it's only missing the `id`) and passes it to the services `addHero()` method.

When `addHero()` saves successfully, the `subscribe()` callback
receives the new hero and pushes it into to the `heroes` list for display.

Add the following `addHero()` method to the `HeroService` class.

<code-example path="toh-pt6/src/app/hero.service.ts" region="addHero" header="src/app/hero.service.ts (addHero)"></code-example>

`addHero()` differs from `updateHero()` in two ways:

* It calls `HttpClient.post()` instead of `put()`.
* It expects the server to generate an id for the new hero,
which it returns in the `Observable<Hero>` to the caller.

Refresh the browser and add some heroes.

## Delete a hero

Each hero in the heroes list should have a delete button.

Add the following button element to the `HeroesComponent` template, after the hero
name in the repeated `<li>` element.

<code-example path="toh-pt6/src/app/heroes/heroes.component.html" header="src/app/heroes/heroes.component.html" region="delete"></code-example>

The HTML for the list of heroes should look like this:

<code-example path="toh-pt6/src/app/heroes/heroes.component.html" region="list" header="src/app/heroes/heroes.component.html (list of heroes)"></code-example>

To position the delete button at the far right of the hero entry,
add some CSS to the `heroes.component.css`. You'll find that CSS
in the [final review code](#heroescomponent) below.

Add the `delete()` handler to the component class.

<code-example path="toh-pt6/src/app/heroes/heroes.component.ts" region="delete" header="src/app/heroes/heroes.component.ts (delete)"></code-example>

Although the component delegates hero deletion to the `HeroService`,
it remains responsible for updating its own list of heroes.
The component's `delete()` method immediately removes the _hero-to-delete_ from that list,
anticipating that the `HeroService` will succeed on the server.

There's really nothing for the component to do with the `Observable` returned by
`heroService.delete()` **but it must subscribe anyway**.

<div class="alert is-important">

  If you neglect to `subscribe()`, the service will not send the delete request to the server.
  As a rule, an `Observable` _does nothing_ until something subscribes.

  Confirm this for yourself by temporarily removing the `subscribe()`,
  clicking "Dashboard", then clicking "Heroes".
  You'll see the full list of heroes again.

</div>

Next, add a `deleteHero()` method to `HeroService` like this.

<code-example path="toh-pt6/src/app/hero.service.ts" region="deleteHero" header="src/app/hero.service.ts (delete)"></code-example>

Note the following key points:

* `deleteHero()` calls `HttpClient.delete()`.
* The URL is the heroes resource URL plus the `id` of the hero to delete.
* You don't send data as you did with `put()` and `post()`.
* You still send the `httpOptions`.

Refresh the browser and try the new delete functionality.

## Search by name

In this last exercise, you learn to chain `Observable` operators together
so you can minimize the number of similar HTTP requests
and consume network bandwidth economically.

You will add a heroes search feature to the Dashboard.
As the user types a name into a search box,
you'll make repeated HTTP requests for heroes filtered by that name.
Your goal is to issue only as many requests as necessary.

#### `HeroService.searchHeroes()`

Start by adding a `searchHeroes()` method to the `HeroService`.

<code-example path="toh-pt6/src/app/hero.service.ts" region="searchHeroes" header="src/app/hero.service.ts">
</code-example>

The method returns immediately with an empty array if there is no search term.
The rest of it closely resembles `getHeroes()`, the only significant difference being
the URL, which includes a query string with the search term.

### Add search to the Dashboard

Open the `DashboardComponent` template and
add the hero search element, `<app-hero-search>`, to the bottom of the markup.

<code-example path="toh-pt6/src/app/dashboard/dashboard.component.html" header="src/app/dashboard/dashboard.component.html"></code-example>

This template looks a lot like the `*ngFor` repeater in the `HeroesComponent` template.

For this to work, the next step is to add a component with a selector that matches `<app-hero-search>`.


### Create `HeroSearchComponent`

Create a `HeroSearchComponent` with the CLI.

<code-example language="sh">
  ng generate component hero-search
</code-example>

The CLI generates the three `HeroSearchComponent` files and adds the component to the `AppModule` declarations.

Replace the generated `HeroSearchComponent` template with an `<input>` and a list of matching search results, as follows.

<code-example path="toh-pt6/src/app/hero-search/hero-search.component.html" header="src/app/hero-search/hero-search.component.html"></code-example>

Add private CSS styles to `hero-search.component.css`
as listed in the [final code review](#herosearchcomponent) below.

As the user types in the search box, an input event binding calls the
component's `search()` method with the new search box value.

{@a asyncpipe}

### `AsyncPipe`

The `*ngFor` repeats hero objects. Notice that the `*ngFor` iterates over a list called `heroes$`, not `heroes`. The `$` is a convention that indicates `heroes$` is an `Observable`, not an array.


<code-example path="toh-pt6/src/app/hero-search/hero-search.component.html" header="src/app/hero-search/hero-search.component.html" region="async"></code-example>

Since `*ngFor` can't do anything with an `Observable`, use the
pipe character (`|`) followed by `async`. This identifies Angular's `AsyncPipe` and subscribes to an `Observable` automatically so you won't have to
do so in the component class.

### Edit the `HeroSearchComponent` class

Replace the generated `HeroSearchComponent` class and metadata as follows.

<code-example path="toh-pt6/src/app/hero-search/hero-search.component.ts" header="src/app/hero-search/hero-search.component.ts"></code-example>

Notice the declaration of `heroes$` as an `Observable`:

<code-example path="toh-pt6/src/app/hero-search/hero-search.component.ts" header="src/app/hero-search/hero-search.component.ts" region="heroes-stream">
</code-example>

You'll set it in [`ngOnInit()`](#search-pipe).
Before you do, focus on the definition of `searchTerms`.

### The `searchTerms` RxJS subject

The `searchTerms` property is an RxJS `Subject`.

<code-example path="toh-pt6/src/app/hero-search/hero-search.component.ts" header="src/app/hero-search/hero-search.component.ts" region="searchTerms"></code-example>

A `Subject` is both a source of observable values and an `Observable` itself.
You can subscribe to a `Subject` as you would any `Observable`.

You can also push values into that `Observable` by calling its `next(value)` method
as the `search()` method does.

The event binding to the textbox's `input` event calls the `search()` method.

<code-example path="toh-pt6/src/app/hero-search/hero-search.component.html" header="src/app/hero-search/hero-search.component.html" region="input"></code-example>

Every time the user types in the textbox, the binding calls `search()` with the textbox value, a "search term".
The `searchTerms` becomes an `Observable` emitting a steady stream of search terms.

{@a search-pipe}

### Chaining RxJS operators

Passing a new search term directly to the `searchHeroes()` after every user keystroke would create an excessive amount of HTTP requests,
taxing server resources and burning through data plans.

Instead, the `ngOnInit()` method pipes the `searchTerms` observable through a sequence of RxJS operators that reduce the number of calls to the `searchHeroes()`,
ultimately returning an observable of timely hero search results (each a `Hero[]`).

Here's a closer look at the code.

<code-example path="toh-pt6/src/app/hero-search/hero-search.component.ts" header="src/app/hero-search/hero-search.component.ts" region="search">
</code-example>

Each operator works as follows:

* `debounceTime(300)` waits until the flow of new string events pauses for 300 milliseconds
before passing along the latest string. You'll never make requests more frequently than 300ms.

* `distinctUntilChanged()` ensures that a request is sent only if the filter text changed.

* `switchMap()` calls the search service for each search term that makes it through `debounce()` and `distinctUntilChanged()`.
It cancels and discards previous search observables, returning only the latest search service observable.


<div class="alert is-helpful">

  With the [switchMap operator](https://www.learnrxjs.io/learn-rxjs/operators/transformation/switchmap),
  every qualifying key event can trigger an `HttpClient.get()` method call.
  Even with a 300ms pause between requests, you could have multiple HTTP requests in flight
  and they may not return in the order sent.

  `switchMap()` preserves the original request order while returning only the observable from the most recent HTTP method call.
  Results from prior calls are canceled and discarded.

  Note that canceling a previous `searchHeroes()` Observable
  doesn't actually abort a pending HTTP request.
  Unwanted results are discarded before they reach your application code.

</div>

Remember that the component _class_ does not subscribe to the `heroes$` _observable_.
That's the job of the [`AsyncPipe`](#asyncpipe) in the template.

#### Try it

Run the application again. In the *Dashboard*, enter some text in the search box.
If you enter characters that match any existing hero names, you'll see something like this.

<div class="lightbox">
  <img src='generated/images/guide/toh/toh-hero-search.gif' alt="Hero Search field with the letters 'm' and 'a' along with four search results that match the query displayed in a list beneath the search input">
</div>

## Final code review

Here are the code files discussed on this page (all in the `src/app/` folder).

{@a heroservice}
{@a inmemorydataservice}
{@a appmodule}
#### `HeroService`, `InMemoryDataService`, `AppModule`

<code-tabs>
  <code-pane
    header="hero.service.ts"
    path="toh-pt6/src/app/hero.service.ts">
  </code-pane>
  <code-pane
    header="in-memory-data.service.ts"
    path="toh-pt6/src/app/in-memory-data.service.ts">
  </code-pane>
  <code-pane
    header="app.module.ts"
    path="toh-pt6/src/app/app.module.ts">
  </code-pane>
</code-tabs>

{@a heroescomponent}
#### `HeroesComponent`

<code-tabs>
  <code-pane
    header="heroes/heroes.component.html"
    path="toh-pt6/src/app/heroes/heroes.component.html">
  </code-pane>
  <code-pane
    header="heroes/heroes.component.ts"
    path="toh-pt6/src/app/heroes/heroes.component.ts">
  </code-pane>
  <code-pane
    header="heroes/heroes.component.css"
    path="toh-pt6/src/app/heroes/heroes.component.css">
  </code-pane>
</code-tabs>

{@a herodetailcomponent}
#### `HeroDetailComponent`

<code-tabs>
  <code-pane
    header="hero-detail/hero-detail.component.html"
    path="toh-pt6/src/app/hero-detail/hero-detail.component.html">
  </code-pane>
  <code-pane
    header="hero-detail/hero-detail.component.ts"
    path="toh-pt6/src/app/hero-detail/hero-detail.component.ts">
  </code-pane>
</code-tabs>

{@a dashboardcomponent}
#### `DashboardComponent`

<code-tabs>
  <code-pane
    header="src/app/dashboard/dashboard.component.html"
    path="toh-pt6/src/app/dashboard/dashboard.component.html">
  </code-pane>
</code-tabs>

{@a herosearchcomponent}
#### `HeroSearchComponent`

<code-tabs>
  <code-pane
    header="hero-search/hero-search.component.html"
    path="toh-pt6/src/app/hero-search/hero-search.component.html">
  </code-pane>
  <code-pane
    header="hero-search/hero-search.component.ts"
    path="toh-pt6/src/app/hero-search/hero-search.component.ts">
  </code-pane>
  <code-pane
    header="hero-search/hero-search.component.css"
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
