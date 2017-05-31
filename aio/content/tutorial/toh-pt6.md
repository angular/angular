# HTTP

In this page, you'll make the following improvements.

* Get the hero data from a server.
* Let users add, edit, and delete hero names.
* Save the changes to the server.

You'll teach the app to make corresponding HTTP calls to a remote server's web API.

When you're done with this page, the app should look like this <live-example></live-example>.

## Where you left off

In the [previous page](tutorial/toh-pt5), you learned to navigate between the dashboard and the fixed heroes list,
editing a selected hero along the way.
That's the starting point for this page.

## Keep the app transpiling and running
Enter the following command in the terminal window:

<code-example language="sh" class="code-shell">
  npm start
</code-example>

This command runs the TypeScript compiler in "watch mode", recompiling automatically when the code changes.
The command simultaneously launches the app in a browser and refreshes the browser when the code changes.

You can keep building the Tour of Heroes without pausing to recompile or refresh the browser.

## Providing HTTP Services

The `HttpModule` is not a core Angular module.
`HttpModule` is Angular's optional approach to web access. It exists as a separate add-on module called `@angular/http`
and is shipped in a separate script file as part of the Angular npm package.

You're ready to import from `@angular/http` because `systemjs.config` configured *SystemJS* to load that library when you need it.

## Register for HTTP services

The app will depend on the Angular `http` service, which itself depends on other supporting services.
The `HttpModule` from the `@angular/http` library holds providers for a complete set of HTTP services.

To allow access to these services from anywhere in the app,
add `HttpModule` to the `imports` list of the `AppModule`.

<code-example path="toh-pt6/src/app/app.module.ts" region="v1" title="src/app/app.module.ts (v1)"></code-example>

Notice that you also supply `HttpModule` as part of the *imports* array in root NgModule `AppModule`.

## Simulate the web API

We recommend registering app-wide services in the root
`AppModule` *providers*.

Until you have a web server that can handle requests for hero data,
the HTTP client will fetch and save data from
a mock service, the *in-memory web API*.

Update <code>src/app/app.module.ts</code> with this version, which uses the mock service:

<code-example path="toh-pt6/src/app/app.module.ts" region="v2" title="src/app/app.module.ts (v2)"></code-example>

Rather than require a real API server, this example simulates communication with the remote server by adding the
<a href="https://github.com/angular/in-memory-web-api" title="In-memory Web API">InMemoryWebApiModule</a>
to the module `imports`, effectively  replacing the `Http` client's XHR backend service with an in-memory alternative.

<code-example path="toh-pt6/src/app/app.module.ts" region="in-mem-web-api"></code-example>

The `forRoot()` configuration method takes an `InMemoryDataService` class
that primes the in-memory database.
Add the file `in-memory-data.service.ts` in `app` with the following content:

<code-example path="toh-pt6/src/app/in-memory-data.service.ts" region="init" title="src/app/in-memory-data.service.ts" linenums="false"></code-example>

This file replaces `mock-heroes.ts`, which is now safe to delete.
Added hero "Zero" to confirm that the data service can handle a hero with `id==0`.


<div class="alert is-helpful">

  The in-memory web API is only useful in the early stages of development and for demonstrations such as this Tour of Heroes.
  Don't worry about the details of this backend substitution; you can
  skip it when you have a real web API server.

  Read more about the in-memory web API in the
  [Appendix: Tour of Heroes in-memory web api](guide/http#in-mem-web-api)
  section of the [HTTP Client](guide/http#in-mem-web-api) page.

</div>

## Heroes and HTTP

In the current `HeroService` implementation, a Promise resolved with mock heroes is returned.

<code-example path="toh-pt4/src/app/hero.service.ts" region="get-heroes" title="src/app/hero.service.ts (old getHeroes)"></code-example>

This was implemented in anticipation of ultimately
fetching heroes with an HTTP client, which must be an asynchronous operation.

Now convert `getHeroes()` to use HTTP.

<code-example path="toh-pt6/src/app/hero.service.ts" region="getHeroes" title="src/app/hero.service.ts (updated getHeroes and new class members)"></code-example>

Update the import statements as follows:

<code-example path="toh-pt6/src/app/hero.service.ts" region="imports" title="src/app/hero.service.ts (updated imports)"></code-example>

Refresh the browser. The hero data should successfully load from the
mock server.

{@a http-promise}

### HTTP Promise

The Angular `http.get` returns an RxJS `Observable`.
*Observables* are a powerful way to manage asynchronous data flows.
You'll read about [Observables](tutorial/toh-pt6#observables) later in this page.

For now, you've converted the `Observable` to a `Promise` using the `toPromise` operator.

<code-example path="toh-pt6/src/app/hero.service.ts" region="to-promise"></code-example>

The Angular `Observable` doesn't have a `toPromise` operator out of the box.

There are many operators like `toPromise` that extend `Observable` with useful capabilities.
To use those capabilities, you have to add the operators themselves.
That's as easy as importing them from the RxJS library like this:

<code-example path="toh-pt6/src/app/hero.service.ts" region="rxjs"></code-example>


<div class="l-sub-section">

  You'll add more operators, and learn why you must do so, [later in this tutorial](tutorial/toh-pt6#rxjs-imports).

</div>


### Extracting the data in the *then* callback

In the *Promise*'s `then()` callback, you call the `json` method of the HTTP `Response` to extract the
data within the response.

<code-example path="toh-pt6/src/app/hero.service.ts" region="to-data"></code-example>

The response JSON has a single `data` property, which
holds the array of heroes that the caller wants.
So you grab that array and return it as the resolved Promise value.


<div class="alert is-important">

  Note the shape of the data that the server returns.
  This particular in-memory web API example returns an object with a `data` property.
  Your API might return something else. Adjust the code to match your web API.

</div>


The caller is unaware that you fetched the heroes from the (mock) server.
It receives a Promise of *heroes* just as it did before.

### Error Handling

At the end of `getHeroes()`, you `catch` server failures and pass them to an error handler.

<code-example path="toh-pt6/src/app/hero.service.ts" region="catch"></code-example>

This is a critical step.
You must anticipate HTTP failures, as they happen frequently for reasons beyond your control.

<code-example path="toh-pt6/src/app/hero.service.ts" region="handleError"></code-example>

This demo service logs the error to the console; in real life,
you would handle the error in code. For a demo, this works.

The code also includes an error to
the caller in a rejected promise, so that the caller can display a proper error message to the user.

### Get hero by id

When the `HeroDetailComponent` asks the `HeroService` to fetch a hero,
the `HeroService` currently fetches all heroes and
filters for the one with the matching `id`.
That's fine for a simulation, but it's wasteful to ask a real server for all heroes when you only want one.
Most web APIs support a _get-by-id_ request in the form `api/hero/:id` (such as `api/hero/11`).

Update the `HeroService.getHero()` method to make a _get-by-id_ request:

<code-example path="toh-pt6/src/app/hero.service.ts" region="getHero" title="src/app/hero.service.ts"></code-example>

This request is almost the same as `getHeroes()`.
The hero id in the URL identifies which hero the server should update.

Also, the `data` in the response is a single hero object rather than an array.

### Unchanged _getHeroes_ API

Although you made significant internal changes to `getHeroes()` and `getHero()`,
the public signatures didn't change.
You still return a Promise from both methods.
You won't have to update any of the components that call them.

Now it's time to add the ability to create and delete heroes.

## Updating hero details

Try editing a hero's name in the hero detail view.
As you type, the hero name is updated in the view heading.
But if you click the Back button, the changes are lost.

Updates weren't lost before. What changed?
When the app used a list of mock heroes, updates were applied directly to the
hero objects within the single, app-wide, shared list. Now that you're fetching data
from a server, if you want changes to persist, you must write them back to
the server.

### Add the ability to save hero details

At the end of the hero detail template, add a save button with a `click` event
binding that invokes a new component method named `save()`.

<code-example path="toh-pt6/src/app/hero-detail.component.html" region="save" title="src/app/hero-detail.component.html (save)"></code-example>

Add the following `save()` method, which persists hero name changes using the hero service
`update()` method and then navigates back to the previous view.

<code-example path="toh-pt6/src/app/hero-detail.component.ts" region="save" title="src/app/hero-detail.component.ts (save)"></code-example>

### Add a hero service _update()_ method

The overall structure of the `update()` method is similar to that of
`getHeroes()`, but it uses an HTTP `put()` to persist server-side changes.

<code-example path="toh-pt6/src/app/hero.service.ts" region="update" title="src/app/hero.service.ts (update)"></code-example>

To identify which hero the server should update, the hero `id` is encoded in
the URL. The `put()` body is the JSON string encoding of the hero, obtained by
calling `JSON.stringify`. The body content type
(`application/json`) is identified in the request header.

Refresh the browser, change a hero name, save your change,
and click the browser Back button. Changes should now persist.

## Add the ability to add heroes

To add a hero, the app needs the hero's name. You can use an `input`
element paired with an add button.

Insert the following into the heroes component HTML, just after
the heading:

<code-example path="toh-pt6/src/app/heroes.component.html" region="add" title="src/app/heroes.component.html (add)"></code-example>

In response to a click event, call the component's click handler and then
clear the input field so that it's ready for another name.

<code-example path="toh-pt6/src/app/heroes.component.ts" region="add" title="src/app/heroes.component.ts (add)"></code-example>

When the given name is non-blank, the handler delegates creation of the
named hero to the hero service, and then adds the new hero to the array.

Implement the `create()` method in the `HeroService` class.

<code-example path="toh-pt6/src/app/hero.service.ts" region="create" title="src/app/hero.service.ts (create)"></code-example>

Refresh the browser and create some heroes.

## Add the ability to delete a hero

Each hero in the heroes view should have a delete button.

Add the following button element to the heroes component HTML, after the hero
name in the repeated `<li>` element.

<code-example path="toh-pt6/src/app/heroes.component.html" region="delete"></code-example>

The `<li>` element should now look like this:

<code-example path="toh-pt6/src/app/heroes.component.html" region="li-element" title="src/app/heroes.component.html (li-element)"></code-example>

In addition to calling the component's `delete()` method, the delete button's
click handler code stops the propagation of the click event&mdash;you
don't want the `<li>` click handler to be triggered because doing so would
select the hero that the user will delete.

The logic of the `delete()` handler is a bit trickier:

<code-example path="toh-pt6/src/app/heroes.component.ts" region="delete" title="src/app/heroes.component.ts (delete)"></code-example>

Of course you delegate hero deletion to the hero service, but the component
is still responsible for updating the display: it removes the deleted hero
from the array and resets the selected hero, if necessary.

To place the delete button at the far right of the hero entry,
add this CSS:

<code-example path="toh-pt6/src/app/heroes.component.css" region="additions" title="src/app/heroes.component.css (additions)"></code-example>

### Hero service _delete()_ method

Add the hero service's `delete()` method, which uses the `delete()` HTTP method to remove the hero from the server:

<code-example path="toh-pt6/src/app/hero.service.ts" region="delete" title="src/app/hero.service.ts (delete)"></code-example>

Refresh the browser and try the new delete functionality.

## Observables

Each `Http` service method  returns an `Observable` of HTTP `Response` objects.

The `HeroService` converts that `Observable` into a `Promise` and returns the promise to the caller.
This section shows you how, when, and why to return the `Observable` directly.

### Background

An *Observable* is a stream of events that you can process with array-like operators.

Angular core has basic support for observables.
Developers augment that support with operators and extensions from the
<a href="http://reactivex.io/rxjs" target="_blank" title="RxJS">RxJS library</a>.
You'll see how shortly.

Recall that the `HeroService` chained the `toPromise` operator to the `Observable` result of `http.get()`.
That operator converted the `Observable` into a `Promise` and you passed that promise back to the caller.

Converting to a Promise is often a good choice. You typically ask `http.get()` to fetch a single chunk of data.
When you receive the data, you're done.
The calling component can easily consume a single result in the form of a Promise.

But requests aren't always done only once.
You may start one request,
cancel it, and make a different request before the server has responded to the first request.

A *request-cancel-new-request* sequence is difficult to implement with `Promise`s, but
easy with `Observable`s.

### Add the ability to search by name

You're going to add a *hero search* feature to the Tour of Heroes.
As the user types a name into a search box, you'll make repeated HTTP requests for heroes filtered by that name.

Start by creating `HeroSearchService` that sends search queries to the server's web API.

<code-example path="toh-pt6/src/app/hero-search.service.ts" title="src/app/hero-search.service.ts"></code-example>

The `http.get()` call in `HeroSearchService` is similar to the one
in the `HeroService`, although the URL now has a query string.

More importantly, you no longer call `toPromise()`.
Instead you return the *Observable* from the the `http.get()`,
after chaining it to another RxJS operator, <code>map()</code>,
to extract heroes from the response data.
RxJS operator chaining makes response processing easy and readable.
See the [discussion below about operators](tutorial/toh-pt6#rxjs-imports).</span>

### HeroSearchComponent

Create a `HeroSearchComponent` that calls the new `HeroSearchService`.

The component template is simple&mdash;just a text box and a list of matching search results.

<code-example path="toh-pt6/src/app/hero-search.component.html" title="src/app/hero-search.component.html"></code-example>

Also, add styles for the new component.

<code-example path="toh-pt6/src/app/hero-search.component.css" title="src/app/hero-search.component.css"></code-example>

As the user types in the search box, a *keyup* event binding calls the component's `search()`
method with the new search box value.

As expected, the `*ngFor` repeats hero objects from the component's `heroes` property.

But as you'll soon see, the `heroes` property is now an *Observable* of hero arrays, rather than just a hero array.
The `*ngFor` can't do anything with an `Observable` until you route it through the `async` pipe (`AsyncPipe`).
The `async` pipe subscribes to the `Observable` and produces the array of heroes to `*ngFor`.

Create the `HeroSearchComponent` class and metadata.

<code-example path="toh-pt6/src/app/hero-search.component.ts" title="src/app/hero-search.component.ts"></code-example>

#### Search terms

Focus on the `searchTerms`:

<code-example path="toh-pt6/src/app/hero-search.component.ts" region="searchTerms"></code-example>

A `Subject` is a producer of an _observable_ event stream;
`searchTerms` produces an `Observable` of strings, the filter criteria for the name search.

Each call to `search()` puts a new string into this subject's _observable_ stream by calling `next()`.

{@a ngoninit}

#### Initialize the *heroes* property (*ngOnInit*)

A `Subject` is also an `Observable`.
You can turn the stream
of search terms into a stream of `Hero` arrays and assign the result to the `heroes` property.

<code-example path="toh-pt6/src/app/hero-search.component.ts" region="search"></code-example>

Passing every user keystroke directly to the `HeroSearchService` would create an excessive amount of HTTP requests,
taxing server resources and burning through the cellular network data plan.

Instead, you can chain `Observable` operators that reduce the request flow to the string `Observable`.
You'll make fewer calls to the `HeroSearchService` and still get timely results. Here's how:

* `debounceTime(300)` waits until the flow of new string events pauses for 300 milliseconds
before passing along the latest string. You'll never make requests more frequently than 300ms.
* `distinctUntilChanged` ensures that a request is sent only if the filter text changed.
* `switchMap()` calls the search service for each search term that makes it through `debounce` and `distinctUntilChanged`.
It cancels and discards previous search observables, returning only the latest search service observable.


<div class="l-sub-section">

  With the [switchMap operator](http://www.learnrxjs.io/operators/transformation/switchmap.html)
  (formerly known as `flatMapLatest`),
  every qualifying key event can trigger an `http()` method call.
  Even with a 300ms pause between requests, you could have multiple HTTP requests in flight
  and they may not return in the order sent.

  `switchMap()` preserves the original request order while returning only the observable from the most recent `http` method call.
  Results from prior calls are canceled and discarded.

  If the search text is empty, the `http()` method call is also short circuited
  and an observable containing an empty array is returned.

  Note that until the service supports that feature, _canceling_ the `HeroSearchService` Observable
  doesn't actually abort a pending HTTP request.
  For now, unwanted results are discarded.

</div>


* `catch` intercepts a failed observable.
The simple example prints the error to the console; a real life app would do better.
Then to clear the search result, you return an observable containing an empty array.

{@a rxjs-imports}

### Import RxJS operators

Most RxJS operators are not included in Angular's base `Observable` implementation.
The base implementation includes only what Angular itself requires.

When you need more RxJS features, extend  `Observable` by *importing* the libraries in which they are defined.
Here are all the RxJS imports that _this_ component needs:

<code-example path="toh-pt6/src/app/hero-search.component.ts" region="rxjs-imports" title="src/app/hero-search.component.ts (rxjs imports)" linenums="false"></code-example>

The `import 'rxjs/add/...'` syntax may be unfamiliar.
It's missing the usual list of symbols between the braces: `{...}`.

You don't need the operator symbols themselves.
In each case, the mere act of importing the library
loads and executes the library's script file which, in turn, adds the operator to the `Observable` class.

### Add the search component to the dashboard

Add the hero search HTML element to the bottom of the `DashboardComponent` template.

<code-example path="toh-pt6/src/app/dashboard.component.html" title="src/app/dashboard.component.html" linenums="false"></code-example>

Finally, import `HeroSearchComponent` from
<code>hero-search.component.ts</code>
and add it to the `declarations` array.


<code-example path="toh-pt6/src/app/app.module.ts" region="search" title="src/app/app.module.ts (search)"></code-example>

Run the app again. In the Dashboard, enter some text in the search box.
If you enter characters that match any existing hero names, you'll see something like this.

<figure>
  <img src='generated/images/guide/toh/toh-hero-search.png' alt="Hero Search Component">
</figure>

## App structure and code

Review the sample source code in the <live-example></live-example> for this page.
Verify that you have the following structure:

<div class='filetree'>
  <div class='file'>angular-tour-of-heroes</div>
  <div class='children'>
    <div class='file'>src</div>
    <div class='children'>
      <div class='file'>app</div>
      <div class='children'>
        <div class='file'>app.component.ts</div>
        <div class='file'>app.component.css</div>
        <div class='file'>app.module.ts</div>
        <div class='file'>app-routing.module.ts</div>
        <div class='file'>dashboard.component.css</div>
        <div class='file'>dashboard.component.html</div>
        <div class='file'>dashboard.component.ts</div>
        <div class='file'>hero.ts</div>
        <div class='file'>hero-detail.component.css</div>
        <div class='file'>hero-detail.component.html</div>
        <div class='file'>hero-detail.component.ts</div>
        <div class='file'>hero-search.component.html (new)</div>
        <div class='file'>hero-search.component.css (new)</div>
        <div class='file'>hero-search.component.ts (new)</div>
        <div class='file'>hero-search.service.ts (new)</div>
        <div class='file'>hero.service.ts</div>
        <div class='file'>heroes.component.css</div>
        <div class='file'>heroes.component.html</div>
        <div class='file'>heroes.component.ts</div>
        <div class='file'>in-memory-data.service.ts (new)</div>
      </div>
      <div class='file'>main.ts</div>
      <div class='file'>index.html</div>
      <div class='file'>styles.css</div>
      <div class='file'>systemjs.config.js</div>
      <div class='file'>tsconfig.json</div>
    </div>
    <div class='file'>node_modules ...</div>
    <div class='file'>package.json</div>
  </div>
</div>

## Home Stretch

You're at the end of your journey, and you've accomplished a lot.
* You added the necessary dependencies to use HTTP in the app.
* You refactored `HeroService` to load heroes from a web API.
* You extended `HeroService` to support `post()`, `put()`, and `delete()` methods.
* You updated the components to allow adding, editing, and deleting of heroes.
* You configured an in-memory web API.
* You learned how to use Observables.

Here are the files you added or changed in this page.


<code-tabs>
  <code-pane title="app.comp...ts" path="toh-pt6/src/app/app.component.ts"></code-pane>
  <code-pane title="app.mod...ts" path="toh-pt6/src/app/app.module.ts"></code-pane>
  <code-pane title="heroes.comp...ts" path="toh-pt6/src/app/heroes.component.ts"></code-pane>
  <code-pane title="heroes.comp...html" path="toh-pt6/src/app/heroes.component.html"></code-pane>
  <code-pane title="heroes.comp...css" path="toh-pt6/src/app/heroes.component.css"></code-pane>
  <code-pane title="hero-detail.comp...ts" path="toh-pt6/src/app/hero-detail.component.ts"></code-pane>
  <code-pane title="hero-detail.comp...html" path="toh-pt6/src/app/hero-detail.component.html"></code-pane>
  <code-pane title="hero.service.ts" path="toh-pt6/src/app/hero.service.ts"></code-pane>
  <code-pane title="in-memory-data.service.ts" path="toh-pt6/src/app/in-memory-data.service.ts"></code-pane>
</code-tabs>

<code-tabs>
  <code-pane title="hero-search.service.ts" path="toh-pt6/src/app/hero-search.service.ts"></code-pane>
  <code-pane title="hero-search.component.ts" path="toh-pt6/src/app/hero-search.component.ts"></code-pane>
  <code-pane title="hero-search.component.html" path="toh-pt6/src/app/hero-search.component.html"></code-pane>
  <code-pane title="hero-search.component.css" path="toh-pt6/src/app/hero-search.component.css"></code-pane>
</code-tabs>

## Next step

That concludes the "Tour of Heroes" tutorial.
You're ready to learn more about Angular development in the fundamentals section,
starting with the [Architecture](guide/architecture "Architecture") guide.
