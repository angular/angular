# Get data from a server

This tutorial adds the following data persistence features with help from Angular's `HttpClient`.

*   The `HeroService` gets hero data with HTTP requests
*   Users can add, edit, and delete heroes and save these changes over HTTP
*   Users can search for heroes by name

<div class="alert is-helpful">

For the sample application that this page describes, see the <live-example></live-example>.

</div>

## Enable HTTP services

`HttpClient` is Angular's mechanism for communicating with a remote server over HTTP.

Make `HttpClient` available everywhere in the application in two steps.
First, add it to the root `AppModule` by importing it:

<code-example header="src/app/app.module.ts (HttpClientModule import)" path="toh-pt6/src/app/app.module.ts" region="import-http-client"></code-example>

Next, still in the `AppModule`, add `HttpClientModule` to the `imports` array:

<code-example header="src/app/app.module.ts (imports array excerpt)" path="toh-pt6/src/app/app.module.ts" region="import-httpclientmodule"></code-example>

## Simulate a data server

This tutorial sample mimics communication with a remote data server by using the [In-memory Web API](https://github.com/angular/angular/tree/main/packages/misc/angular-in-memory-web-api "In-memory Web API") module.

After installing the module, the application makes requests to and receive responses from the `HttpClient`. The application doesn't know that the *In-memory Web API* is intercepting those requests, applying them to an in-memory data store, and returning simulated responses.

By using the In-memory Web API, you won't have to set up a server to learn about `HttpClient`.

<div class="alert is-important">

**IMPORTANT**: <br />
The In-memory Web API module has nothing to do with HTTP in Angular.

If you're reading this tutorial to learn about `HttpClient`, you can [skip over](#import-heroes) this step.
If you're coding along with this tutorial, stay here and add the In-memory Web API now.

</div>

Install the In-memory Web API package from npm with the following command:

<code-example format="shell" language="shell">

npm install angular-in-memory-web-api --save

</code-example>

In the `AppModule`, import the `HttpClientInMemoryWebApiModule` and the `InMemoryDataService` class, which you create next.

<code-example header="src/app/app.module.ts (In-memory Web API imports)" path="toh-pt6/src/app/app.module.ts" region="import-in-mem-stuff"></code-example>

After the `HttpClientModule`, add the `HttpClientInMemoryWebApiModule` to the `AppModule` `imports` array and configure it with the `InMemoryDataService`.

<code-example header="src/app/app.module.ts (imports array excerpt)" path="toh-pt6/src/app/app.module.ts" region="in-mem-web-api-imports"></code-example>

The `forRoot()` configuration method takes an `InMemoryDataService` class that primes the in-memory database.

Generate the class `src/app/in-memory-data.service.ts` with the following command:

<code-example format="shell" language="shell">

ng generate service InMemoryData

</code-example>

Replace the default contents of `in-memory-data.service.ts` with the following:

<code-example header="src/app/in-memory-data.service.ts" path="toh-pt6/src/app/in-memory-data.service.ts" region="init"></code-example>

The `in-memory-data.service.ts` file takes over the function of `mock-heroes.ts`.
Don't delete `mock-heroes.ts` yet. You still need it for a few more steps of this tutorial.

After the server is ready, detach the In-memory Web API so the application's requests can go through to the server.

<a id="import-heroes"></a>

## Heroes and HTTP

In the `HeroService`, import `HttpClient` and `HttpHeaders`:

<code-example header="src/app/hero.service.ts (import HTTP symbols)" path="toh-pt6/src/app/hero.service.ts" region="import-httpclient"></code-example>

Still in the `HeroService`, inject `HttpClient` into the constructor in a private property called `http`.

<code-example path="toh-pt6/src/app/hero.service.ts" header="src/app/hero.service.ts" region="ctor" ></code-example>

Notice that you keep injecting the `MessageService` but since your application calls it so frequently, wrap it in a private `log()` method:

<code-example path="toh-pt6/src/app/hero.service.ts" header="src/app/hero.service.ts" region="log" ></code-example>

Define the `heroesUrl` of the form `:base/:collectionName` with the address of the heroes resource on the server.
Here `base` is the resource to which requests are made, and `collectionName` is the heroes data object in the `in-memory-data-service.ts`.

<code-example path="toh-pt6/src/app/hero.service.ts" header="src/app/hero.service.ts" region="heroesUrl" ></code-example>

### Get heroes with `HttpClient`

The current `HeroService.getHeroes()` uses the RxJS `of()` function to return an array of mock heroes as an `Observable<Hero[]>`.

<code-example header="src/app/hero.service.ts (getHeroes with RxJs 'of()')" path="toh-pt4/src/app/hero.service.ts" region="getHeroes-1"></code-example>

Convert that method to use `HttpClient` as follows:

<code-example header="src/app/hero.service.ts" path="toh-pt6/src/app/hero.service.ts" region="getHeroes-1"></code-example>

Refresh the browser.
The hero data should successfully load from the mock server.

You've swapped `of()` for `http.get()` and the application keeps working without any other changes
because both functions return an `Observable<Hero[]>`.

### `HttpClient` methods return one value

All `HttpClient` methods return an RxJS `Observable` of something.

HTTP is a request/response protocol.
You make a request, it returns a single response.

In general, an observable *can* return more than one value over time.
An observable from `HttpClient` always emits a single value and then completes, never to emit again.

This particular call to `HttpClient.get()` returns an `Observable<Hero[]>`, which is *an observable of hero arrays*.
In practice, it only returns a single hero array.

### `HttpClient.get()` returns response data

`HttpClient.get()` returns the body of the response as an untyped JSON object by default.
Applying the optional type specifier, `<Hero[]>` , adds TypeScript capabilities, which reduce errors during compile time.

The server's data API determines the shape of the JSON data.
The *Tour of Heroes* data API returns the hero data as an array.

<div class="alert is-helpful">

Other APIs may bury the data that you want within an object.
You might have to dig that data out by processing the `Observable` result with the RxJS `map()` operator.

Although not discussed here, there's an example of `map()` in the `getHeroNo404()` method included in the sample source code.

</div>

### Error handling

Things go wrong, especially when you're getting data from a remote server.
The `HeroService.getHeroes()` method should catch errors and do something appropriate.

To catch errors, you **"pipe" the observable** result from `http.get()` through an RxJS `catchError()` operator.

Import the `catchError` symbol from `rxjs/operators`, along with some other operators to use later.

<code-example header="src/app/hero.service.ts" path="toh-pt6/src/app/hero.service.ts" region="import-rxjs-operators"></code-example>

Now extend the observable result with the `pipe()` method and give it a `catchError()` operator.

<code-example header="src/app/hero.service.ts" path="toh-pt6/src/app/hero.service.ts" region="getHeroes-2"></code-example>

The `catchError()` operator intercepts an **`Observable` that failed**.
The operator then passes the error to the error handling function.

The following `handleError()` method reports the error and then returns an innocuous result so that the application keeps working.

#### `handleError`

The following `handleError()` can be shared by many `HeroService` methods so it's generalized to meet their different needs.

Instead of handling the error directly, it returns an error handler function to `catchError`. This function is configured with both the name of the operation that failed and a safe return value.

<code-example header="src/app/hero.service.ts" path="toh-pt6/src/app/hero.service.ts" region="handleError"></code-example>

After reporting the error to the console, the handler constructs a friendly message and returns a safe value so the application can keep working.

Because each service method returns a different kind of `Observable` result, `handleError()` takes a type parameter to return the safe value as the type that the application expects.

### Tap into the Observable

The `getHero()` method taps into the flow of observable values and sends a message, using the `log()` method, to the message area at the bottom of the page.

The RxJS `tap()` operator enables this ability by looking at the observable values, doing something with those values, and passing them along.
The `tap()` callback doesn't access the values themselves.

Here is the final version of `getHeroes()` with the `tap()` that logs the operation.

<code-example path="toh-pt6/src/app/hero.service.ts" header="src/app/hero.service.ts"  region="getHeroes" ></code-example>

### Get hero by id

Most web APIs support a *get by id* request in the form `:baseURL/:id`.

Here, the *base URL* is the `heroesURL` defined in the [Heroes and HTTP](tutorial/tour-of-heroes/toh-pt6#heroes-and-http) section in `api/heroes` and *id* is the number of the hero that you want to retrieve.
For example, `api/heroes/11`.

Update the `HeroService` `getHero()` method with the following to make that request:

<code-example header="src/app/hero.service.ts" path="toh-pt6/src/app/hero.service.ts" region="getHero"></code-example>

`getHero()` has three significant differences from  `getHeroes()`:

*   `getHero()` constructs a request URL with the desired hero's id
*   The server should respond with a single hero rather than an array of heroes
*   `getHero()` returns an `Observable<Hero>`, which is an observable of `Hero` *objects* rather than an observable of `Hero` *arrays*.

## Update heroes

<!-- markdownlint-disable MD001 -->

Edit a hero's name in the hero detail view.
As you type, the hero name updates the heading at the top of the page, yet
when you click **Go back**, your changes are lost.

If you want changes to persist, you must write them back to the server.

At the end of the hero detail template, add a save button with a `click` event binding that invokes a new component method named `save()`.

<code-example header="src/app/hero-detail/hero-detail.component.html (save)" path="toh-pt6/src/app/hero-detail/hero-detail.component.html" region="save"></code-example>

In the `HeroDetail` component class, add the following `save()` method, which persists hero name changes using the hero service `updateHero()` method and then navigates back to the previous view.

<code-example header="src/app/hero-detail/hero-detail.component.ts (save)" path="toh-pt6/src/app/hero-detail/hero-detail.component.ts" region="save"></code-example>

#### Add `HeroService.updateHero()`

The structure of the `updateHero()` method is like that of `getHeroes()`, but it uses `http.put()` to persist the changed hero on the server.
Add the following to the `HeroService`.

<code-example header="src/app/hero.service.ts (update)" path="toh-pt6/src/app/hero.service.ts" region="updateHero"></code-example>

The `HttpClient.put()` method takes three parameters:

*   The URL
*   The data to update, which is the modified hero in this case
*   Options

The URL is unchanged.
The heroes web API knows which hero to update by looking at the hero's `id`.

The heroes web API expects a special header in HTTP save requests.
That header is in the `httpOptions` constant defined in the `HeroService`.
Add the following to the `HeroService` class.

<code-example header="src/app/hero.service.ts" path="toh-pt6/src/app/hero.service.ts" region="http-options"></code-example>

Refresh the browser, change a hero name and save your change.
The `save()` method in `HeroDetailComponent` navigates to the previous view.
The hero now appears in the list with the changed name.

## Add a new hero

To add a hero, this application only needs the hero's name.
You can use an `<input>` element paired with an add button.

Insert the following into the `HeroesComponent` template, after the heading:

<code-example header="src/app/heroes/heroes.component.html (add)" path="toh-pt6/src/app/heroes/heroes.component.html" region="add"></code-example>

In response to a click event, call the component's click handler, `add()`, and then clear the input field so that it's ready for another name.
Add the following to the `HeroesComponent` class:

<code-example header="src/app/heroes/heroes.component.ts (add)" path="toh-pt6/src/app/heroes/heroes.component.ts" region="add"></code-example>

When the given name isn't blank, the handler creates an object based on the hero's name.
The handler passes the object name to the service's `addHero()` method.

When `addHero()` creates a new object, the `subscribe()` callback receives the new hero and pushes it into to the `heroes` list for display.

Add the following `addHero()` method to the `HeroService` class.

<code-example header="src/app/hero.service.ts (addHero)" path="toh-pt6/src/app/hero.service.ts" region="addHero"></code-example>

`addHero()` differs from `updateHero()` in two ways:

*   It calls `HttpClient.post()` instead of `put()`
*   It expects the server to create an id for the new hero, which it returns in the `Observable<Hero>` to the caller

Refresh the browser and add some heroes.

## Delete a hero

Each hero in the heroes list should have a delete button.

Add the following button element to the `HeroesComponent` template, after the hero name in the repeated `<li>` element.

<code-example header="src/app/heroes/heroes.component.html" path="toh-pt6/src/app/heroes/heroes.component.html" region="delete"></code-example>

The HTML for the list of heroes should look like this:

<code-example header="src/app/heroes/heroes.component.html (list of heroes)" path="toh-pt6/src/app/heroes/heroes.component.html" region="list"></code-example>

To position the delete button at the far right of the hero entry, add some CSS from the [final review code](#heroescomponent) to the `heroes.component.css`.

Add the `delete()` handler to the component class.

<code-example header="src/app/heroes/heroes.component.ts (delete)" path="toh-pt6/src/app/heroes/heroes.component.ts" region="delete"></code-example>

Although the component delegates hero deletion to the `HeroService`, it remains responsible for updating its own list of heroes.
The component's `delete()` method immediately removes the *hero-to-delete* from that list, anticipating that the `HeroService` succeeds on the server.

There's really nothing for the component to do with the `Observable` returned by `heroService.deleteHero()` **but it must subscribe anyway**.

Next, add a `deleteHero()` method to `HeroService` like this.

<code-example header="src/app/hero.service.ts (delete)" path="toh-pt6/src/app/hero.service.ts" region="deleteHero"></code-example>

Notice the following key points:

*   `deleteHero()` calls `HttpClient.delete()`
*   The URL is the heroes resource URL plus the `id` of the hero to delete
*   You don't send data as you did with `put()` and `post()`
*   You still send the `httpOptions`

Refresh the browser and try the new delete capability.

<div class="alert is-important">

If you neglect to `subscribe()`, the service can't send the delete request to the server.
As a rule, an `Observable` *does nothing* until something subscribes.

Confirm this for yourself by temporarily removing the `subscribe()`, clicking **Dashboard**, then clicking **Heroes**.
This shows the full list of heroes again.

</div>

## Search by name

In this last exercise, you learn to chain `Observable` operators together so you can reduce the number of similar HTTP requests to consume network bandwidth economically.

### Add a heroes search feature to the Dashboard

As the user types a name into a search box, your application makes repeated HTTP requests for heroes filtered by that name.
Your goal is to issue only as many requests as necessary.

#### `HeroService.searchHeroes()`

Start by adding a `searchHeroes()` method to the `HeroService`.

<code-example header="src/app/hero.service.ts" path="toh-pt6/src/app/hero.service.ts" region="searchHeroes"></code-example>

The method returns immediately with an empty array if there is no search term.
The rest of it closely resembles `getHeroes()`, the only significant difference being the URL, which includes a query string with the search term.

### Add search to the dashboard

Open the `DashboardComponent` template and
add the hero search element, `<app-hero-search>`, to the bottom of the markup.

<code-example header="src/app/dashboard/dashboard.component.html" path="toh-pt6/src/app/dashboard/dashboard.component.html"></code-example>

This template looks a lot like the `*ngFor` repeater in the `HeroesComponent` template.

For this to work, the next step is to add a component with a selector that matches `<app-hero-search>`.

### Create `HeroSearchComponent`

Run `ng generate` to create a `HeroSearchComponent`.

<code-example format="shell" language="shell">

ng generate component hero-search

</code-example>

`ng generate` creates the three `HeroSearchComponent` files and adds the component to the `AppModule` declarations.

Replace the `HeroSearchComponent` template with an `<input>` and a list of matching search results, as follows.

<code-example header="src/app/hero-search/hero-search.component.html" path="toh-pt6/src/app/hero-search/hero-search.component.html"></code-example>

Add private CSS styles to `hero-search.component.css` as listed in the [final code review](#herosearchcomponent) below.

As the user types in the search box, an input event binding calls the component's `search()` method with the new search box value.

<a id="asyncpipe"></a>

### `AsyncPipe`

The `*ngFor` repeats hero objects.
Notice that the `*ngFor` iterates over a list called `heroes$`, not `heroes`.
The `$` is a convention that indicates `heroes$` is an `Observable`, not an array.

<code-example header="src/app/hero-search/hero-search.component.html" path="toh-pt6/src/app/hero-search/hero-search.component.html" region="async"></code-example>

Since `*ngFor` can't do anything with an `Observable`, use the pipe `|` character followed by `async`.
This identifies Angular's `AsyncPipe` and subscribes to an `Observable` automatically so you won't have to do so in the component class.

### Edit the `HeroSearchComponent` class

Replace the `HeroSearchComponent` class and metadata as follows.

<code-example header="src/app/hero-search/hero-search.component.ts" path="toh-pt6/src/app/hero-search/hero-search.component.ts"></code-example>

Notice the declaration of `heroes$` as an `Observable`:

<code-example header="src/app/hero-search/hero-search.component.ts" path="toh-pt6/src/app/hero-search/hero-search.component.ts" region="heroes-stream"></code-example>

Set this in [`ngOnInit()`](#search-pipe).
Before you do, focus on the definition of `searchTerms`.

### The `searchTerms` RxJS subject

The `searchTerms` property is an RxJS `Subject`.

<code-example header="src/app/hero-search/hero-search.component.ts" path="toh-pt6/src/app/hero-search/hero-search.component.ts" region="searchTerms"></code-example>

A `Subject` is both a source of observable values and an `Observable` itself.
You can subscribe to a `Subject` as you would any `Observable`.

You can also push values into that `Observable` by calling its `next(value)` method as the `search()` method does.

The event binding to the text box's `input` event calls the `search()` method.

<code-example header="src/app/hero-search/hero-search.component.html" path="toh-pt6/src/app/hero-search/hero-search.component.html" region="input"></code-example>

Every time the user types in the text box, the binding calls `search()` with the text box value as a *search term*.
The `searchTerms` becomes an `Observable` emitting a steady stream of search terms.

<a id="search-pipe"></a>

### Chaining RxJS operators

Passing a new search term directly to the `searchHeroes()` after every user keystroke creates excessive HTTP requests, which taxes server resources and burns through data plans.

Instead, the `ngOnInit()` method pipes the `searchTerms` observable through a sequence of RxJS operators that reduce the number of calls to the `searchHeroes()`. Ultimately, this returns an observable of timely hero search results where each one is a `Hero[]`.

Here's a closer look at the code.

<code-example header="src/app/hero-search/hero-search.component.ts" path="toh-pt6/src/app/hero-search/hero-search.component.ts" region="search"></code-example>

Each operator works as follows:

*   `debounceTime(300)` waits until the flow of new string events pauses for 300 milliseconds before passing along the latest string.
   Requests aren't likely to happen more frequently than 300&nbsp;ms.

*   `distinctUntilChanged()` ensures that a request is sent only if the filter text changed.

*   `switchMap()` calls the search service for each search term that makes it through `debounce()` and `distinctUntilChanged()`.
    It cancels and discards previous search observables, returning only the latest search service observable.

<div class="alert is-helpful">

With the [`switchMap` operator](https://www.learnrxjs.io/learn-rxjs/operators/transformation/switchmap), every qualifying key event can trigger an `HttpClient.get()` method call.
Even with a 300&nbsp;ms pause between requests, you could have many HTTP requests in flight and they may not return in the order sent.

`switchMap()` preserves the original request order while returning only the observable from the most recent HTTP method call.
Results from prior calls are canceled and discarded.

<div class="alert is-helpful">

Canceling a previous `searchHeroes()` Observable doesn't actually cancel a pending HTTP request.
Unwanted results are discarded before they reach your application code.

</div>

</div>

Remember that the component *class* doesn't subscribe to the `heroes$` *observable*.
That's the job of the [`AsyncPipe`](#asyncpipe) in the template.

#### Try it

Run the application again.
In the *Dashboard*, enter some text in the search box.
Enter characters that match any existing hero names, and look for something like this.

<div class="lightbox">

<img alt="Hero Search field with the letters 'm' and 'a' along with four search results that match the query displayed in a list beneath the search input" src="generated/images/guide/toh/toh-hero-search.gif">

</div>

## Final code review

Here are the code files discussed on this page. They're found in the `src/app/` directory.

<a id="heroservice"></a>
<a id="inmemorydataservice"></a>

<a id="appmodule"></a>

### `HeroService`, `InMemoryDataService`, `AppModule`

<code-tabs>
    <code-pane header="hero.service.ts" path="toh-pt6/src/app/hero.service.ts"></code-pane>
    <code-pane header="in-memory-data.service.ts" path="toh-pt6/src/app/in-memory-data.service.ts"></code-pane>
    <code-pane header="app.module.ts" path="toh-pt6/src/app/app.module.ts"></code-pane>
</code-tabs>

<a id="heroescomponent"></a>

### `HeroesComponent`

<code-tabs>
    <code-pane header="heroes/heroes.component.html" path="toh-pt6/src/app/heroes/heroes.component.html"></code-pane>
    <code-pane header="heroes/heroes.component.ts" path="toh-pt6/src/app/heroes/heroes.component.ts"></code-pane>
    <code-pane header="heroes/heroes.component.css" path="toh-pt6/src/app/heroes/heroes.component.css"></code-pane>
</code-tabs>

<a id="herodetailcomponent"></a>

### `HeroDetailComponent`

<code-tabs>
    <code-pane header="hero-detail/hero-detail.component.html" path="toh-pt6/src/app/hero-detail/hero-detail.component.html"></code-pane>
    <code-pane header="hero-detail/hero-detail.component.ts" path="toh-pt6/src/app/hero-detail/hero-detail.component.ts"></code-pane>
    <code-pane header="hero-detail/hero-detail.component.css" path="toh-pt6/src/app/hero-detail/hero-detail.component.css"></code-pane>
</code-tabs>

<a id="dashboardcomponent"></a>

### `DashboardComponent`

<code-tabs>
    <code-pane header="dashboard/dashboard.component.html" path="toh-pt6/src/app/dashboard/dashboard.component.html"></code-pane>
    <code-pane header="dashboard/dashboard.component.ts" path="toh-pt6/src/app/dashboard/dashboard.component.ts"></code-pane>
    <code-pane header="dashboard/dashboard.component.css" path="toh-pt6/src/app/dashboard/dashboard.component.css"></code-pane>
</code-tabs>

<a id="herosearchcomponent"></a>

### `HeroSearchComponent`

<code-tabs>
    <code-pane header="hero-search/hero-search.component.html" path="toh-pt6/src/app/hero-search/hero-search.component.html"></code-pane>
    <code-pane header="hero-search/hero-search.component.ts" path="toh-pt6/src/app/hero-search/hero-search.component.ts"></code-pane>
    <code-pane header="hero-search/hero-search.component.css" path="toh-pt6/src/app/hero-search/hero-search.component.css"></code-pane>
</code-tabs>

## Summary

You're at the end of your journey, and you've accomplished a lot.

*   You added the necessary dependencies to use HTTP in the application
*   You refactored `HeroService` to load heroes from a web API
*   You extended `HeroService` to support `post()`, `put()`, and `delete()` methods
*   You updated the components to allow adding, editing, and deleting of heroes
*   You configured an in-memory web API
*   You learned how to use observables

This concludes the "Tour of Heroes" tutorial.
You're ready to learn more about Angular development in the fundamentals section, starting with the [Architecture](guide/architecture "Architecture") guide.

@reviewed 2022-02-28
