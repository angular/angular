@title
RxJS in Angular

@intro
Using Observables to manage asynchronous application events.

@description



**Observables** are a programming technique for handling asynchronous and event-based values produced over time.
The <a href="https://github.com/ReactiveX/rxjs" target="_blank" title="Reactive Extensions for Javascript (RxJS) library">
Reactive Extensions for Javascript (RxJS) library</a> is a popular, third-party, open source implementation of _Observables_.

Angular makes extensive use of _observables_ internally and numerous Angular APIs return an `Observable` result.
Many Angular developers create their own _observables_ to handle application events
and facilitate communication among decoupled parts of the application.

This guide touches briefly on what _observables_ are and how _RxJS_ works before concentrating on common uses cases in Angular applications
including an example that you can <live-example>run live in the browser</live-example>.


{@a definition}


### _Observable_ is just a function

At its core, an `Observable` is just a function representing an action that returns one or more events.
An action can be anything: "return a number", "make an HTTP request", "listen for keystrokes", or "navigate to another page".

The results of an action may be available immediately ("here's the number")
or at some point in the future ("the server responded", "the user hit a key").

The real power of `Observable`  comes from chaining them together with _**operators**_.
An _operator_ takes a source `Observable`, observes its emitted values, transforms them, and returns a new `Observable` of those transformed values.
{@a learn-observables}


### Learning about _Observables_

There are numerous ways to learn the concepts and details of _Observables_.
Here are a few external resources to get you started:

* <a href="https://medium.com/@benlesh/learning-observable-by-building-observable-d5da57405d87#.3lun8dyt7" target="_blank">Learning Observable By Building Observable</a>.
* <a href="https://www.youtube.com/watch?v=VLGCCpOWFFw" target="_blank">
Practical Guide to Observables in Angular with Rob Wormald (video)</a>.
* <a href="https://www.youtube.com/watch?v=3LKMwkuK0ZE" target="_blank">Thinking Reactively with Ben Lesh (video)</a>.
* <a href="http://reactivex.io/rxjs/" target="_blank">RxJS Official Documentation</a>.
* <a href="https://github.com/btroncone/learn-rxjs/blob/master/operators/complete.md" target="_blank">
RxJS Operators By Example</a>.

These links will lead you to many more presentations and videos to expand your knowledge.

This guide is more narrowly focused on using `Observable` in Angular applications.


{@a observables-vs-promises}


### _Observables_ and _Promises_ are different

JavaScript has many asynchronous APIs, including mouse moves, keystrokes, and timers.
You don't block the UI and wait for these events.
You attach a callback function to the event and let the event call your handler
whenever something happens.
Developers quickly understand that an `Observable` is a superior way to manage the flow of events coming from these high-volume sources.

But some asynchronous sources return at most _one value_.
When you make an HTTP request to the server to fetch or save data, you expect a single response.

The `Observable` and the `Promise` are both techniques for coping with asynchronous processes.

The similarity ends there, as the `Promise` and the `Observable` are more different then alike:

<style>
  td, th {vertical-align: top;}

</style>



<table width="100%">

  <col width="50%">

  </col>

  <col width="50%">

  </col>

  <tr>

    <th>
      Promise
    </th>

    <th>
      Observable
    </th>

  </tr>

  <tr>

    <td>


      A `Promise` resolves to a single result (or error).
    </td>

    <td>


      An `Observable` can emit any number of events. It may never stop emitting values.
    </td>

  </tr>

  <tr>

    <td>


      The source of the `Promise` executes immediately.
    </td>

    <td>


      The `Observable` may emit events immediately ("hot") or wait until the first subscription ("cold").
    </td>

  </tr>

  <tr>

    <td>


      The `then` method always executes its callback _asynchronously_.
    </td>

    <td>


      `Observable` methods and operators may execute _synchronously_ or _asynchronously_.
    </td>

  </tr>

  <tr>

    <td>


      You cannot _cancel_ or _retry_ the action.
    </td>

    <td>


      You can _cancel_ or _retry_ the action.
    </td>

  </tr>

  <tr>

    <td>


      You chain a sequence of promises with the `then` method.
    </td>

    <td>


      You chain observables with a variety of **operators**.
    </td>

  </tr>

  <tr>

    <td>


      A `Promise` returns the same result (or error) every time.

      Calling `then` a second time returns the same object as the first time.
      It does _not_ re-execute the source of the promised value.
      It does _not_ re-execute a `then` callback,
      not the last one nor any in a chain of `then` calls.

      In the language of _observables_ this is called "multicasting".
    </td>

    <td>


      An `Observable` re-executes each time you subscribe to it.

      If the `Observable` initiates the action, as `http.get` does, a second
      subscription performs that action again.
      Every operator in a chain of _observables_ re-executes its callback.
      This is called "single casting".

      You can choose to share the same values with all subscribers ("multicasting") instead
      with the help of a `Subject` or a "multicasting" operator such as
      `share`, `publish,` or `toPromise`. These operators use a `Subject` internally.
    </td>

  </tr>

  <tr>

    <td>


      `Promise` is native to JavaScript.
      You don't need to import a library although you may need a shim for older browsers.
    </td>

    <td>


      `Observable` is _not_ part of JavaScript and may never become a part of JavaScript.
      Today it requires a third party library such as RxJS and `import` statements for every _observable_ class and operator.
    </td>

  </tr>

</table>


{@a operators}


### Operators: Import them and use them
Operators are pure functions that extend the Observable interface, allow you to perform an action against the Observable
and return a new Observable. An Observable comes with very few built-in operators and the rest of the operators are
added to the Observable on demand. There are multiple approaches to make these operators available for use.
One approach is to import the entire RxJS library.


<code-example path="rxjs/src/app/heroes-filtered.component.1.ts" linenums="false" title="src/app/heroes-filtered.component.ts (import-all)" region="import-all">

</code-example>



This is the **least recommended** method, as it brings in **all** the Observables operators,
even ones you never use. While convenient, this method is inefficient and can greatly impact the size of your application,
which is always a concern. This method is mainly reserved for prototyping and testing, where such concerns are less important.

The second method is to import operators selectively by patching the Observable prototype. With this method you chain
operators together, as each operator returns a new Observable. Below is an example of importing the `filter` and `do` operators.


<code-example path="rxjs/src/app/heroes-filtered.component.1.ts" linenums="false" title="src/app/heroes-filtered.component.ts (operator-import)" region="operator-import">

</code-example>

<div class="l-sub-section">

The `filter` operator filters elements produced by an Observable based on a predicate function that returns a boolean. This operator is commonly
used for flow control of Observable events that only match certain criteria.

</div>

<div class="l-sub-section">

The `do` operator provides the Observable value to perform a side-effect. The `do` operator does not require a return value, as it provides the source
Observable to the next operator in the chain. This operator is useful for debugging, including console logging the current value in the chain and running arbitrary
actions on the observable.

</div>

Had you not imported these operators before using them with the Observable returned by `getHeroes`, the Observable would throw an error. It would fail to perform these actions as the functions don't exist on the Observable prototype yet.

<div class="alert is-critical">

Its important to avoid incomplete operator imports. A common example is having multiple files that use Observable operators but not all files imports the operators they need. Depending on how and when the files are imported, some Observable operators that are needed may not be available on the Observable prototype. Be diligent in making sure *each* file that
needs a set of operators imports them all.

</div>

Another approach is to import the Observable operators directly and call them individually on the Observables. Let's
update the filtered heroes component to use direct imports.


<code-example path="rxjs/src/app/heroes-filtered.component.2.ts" linenums="false" title="src/app/heroes-filtered.component.ts (direct operator imports)">

</code-example>



This approach has no side-effects as you're not patching the Observable prototype. It also is
more conducive to [tree-shaking](https://en.wikipedia.org/wiki/Dead_code_elimination) versus patching the Observable prototype, where tree-shaking measures
cannot be applied. You're also only importing what you need where you need it, but this approach doesn't give you the option to chain operators together.


<div class="l-sub-section">

If you are building a third-party Angular library, this would be the recommended approach as you don't want your library to produce any side-effects
to the Observable for consumers of your library.

</div>



The recommended approach is to import all the operators in the file _where you use them_. Yes, this may lead to
duplicate imports of operators in multiple files, but more importantly this ensures that the operators
that are needed are provided by that file. This becomes especially important with lazy loading, where
certain feature areas may only make use of certain operators. Importing the operators this way ensures
the operators are available regardless of where and when you use them.


{@a operator-info}


### Finding the right operator

There are several web resources that can help you find the right operator.
* <a href="http://reactivex.io/documentation/operators.html#tree" target="_blank">
Operator decision tree</a> to chose operator by use case.

* "<a href="http://xgrommx.github.io/rx-book/content/which_operator_do_i_use/index.html" target="_blank">Which Operator do I use?</a>"" (RxJS v4. specific).

These references describe the operators in RxJS v.4.
Some of the operators have been dropped, renamed, or changed in v.5.
You may need to refer to "<a href="https://github.com/benlesh/RxJS/blob/master/MIGRATION.md#operators-renamed-or-removed" target="_blank">Migrating from RxJS 4 to 5</a>".

See <a href="https://github.com/btroncone/learn-rxjs/blob/master/operators/complete.md" target="_blank">
RxJS 5 Operators By Example</a> to understand what an operator does.


{@a managing-subscriptions}


### Managing Subscriptions

Observables like any other instance use resources and those resources add to the overall weight of your application over time. Observables
provide a `Subscription` for each `Subscriber` of the Observable that comes with a way to _unsubscribe_ or clean up any resources used
while listening for values produced by the Observable. We'll look at a simple example of how to unsubscribe from and Observable once
its no longer needed.

We'll create a component named `HeroCounterComponent` that will do a simple task of increasing a total of heroes. We'll simulate
that this hero counter is running as long as the component is active in the view. Once the component is destroyed, we no longer
want to listen for any changes coming from the Observable counter.


<code-example path="rxjs/src/app/hero-counter.component.1.ts" linenums="false" title="src/app/hero-counter.component.ts (counter-unsubscribe)" region="counter-unsubscribe">

</code-example>



Since you know Angular has lifecycle hooks, we can use the `ngOnDestroy` lifecycle hook to unsubscribe from this Observable counter
and clean up its resources.


<code-example path="rxjs/src/app/hero-counter.component.1.ts" linenums="false" title="src/app/hero-counter.component.ts (ngOnDestroy-unsubscribe)" region="ngOnDestroy-unsubscribe">

</code-example>



Disposing of a single subscription when your component is destroyed is very manageable, but as you use more Observables, managing
multiple subscriptions can get unwieldy. There is a better approach to managing subscriptions. Observables have `operators`
that complete observable streams. One such operator is the the `takeUntil` operator, that listens for one or more supplied Observables
to complete, then notifies the source Observable to complete also.

Let's update our hero counter example to use the `takeUntil` operator. We import the operator to add it to the observable prototype.


<code-example path="rxjs/src/app/hero-counter.component.ts" linenums="false" title="src/app/hero-counter.component.ts (takeUntil-operator)" region="takeUntil-operator">

</code-example>

Since we need an Observable that emits a value, we use a `Subject`.


<code-example path="rxjs/src/app/hero-counter.component.ts" linenums="false" title="src/app/hero-counter.component.ts (import-subject)" region="import-subject">

</code-example>

<div class="l-sub-section">

A `Subject` is a special type of Observable that allows `multicasting`. Subjects use `multiscasting`, by keeping a list of registered observers and notifying
all observers each time a new value is emitted. This is different from a standard `Observable` which creates a new independent execution for each subscribed observer.

</div>



You'll need to create an `onDestroy$` observable using the Subject.


<code-example path="rxjs/src/app/hero-counter.component.ts" linenums="false" title="src/app/hero-counter.component.ts (onDestroy-subject)" region="onDestroy-subject">

</code-example>



Now we apply the `takeUntil` operator to our Observable and once the `onDestroy$` Observable completes,
the counter Observable will complete and will no longer produce any values. This approach scales and a single observable triggers completion across multiple subscriptions.


<code-example path="rxjs/src/app/hero-counter.component.ts" linenums="false" title="src/app/hero-counter.component.ts (excerpt)">

</code-example>



{@a async-pipe}


### Async Pipe

You manage Observables imperatively through manually subscribing and unsubscribing when ready to clean up their used resource. Observable subscriptions
are also managed declaratively in component templates using the `Async Pipe`. This lets us use Observables with less boilerplate and that's a good thing.
The `Async Pipe` creates a subscription to the observable each time it is updated, tracks reference changes to the Observable's emitted value and cleans up subscriptions
when the component is destroyed, protecting against memory leaks.

Let's create another component that displays a list of heroes using these two options. Our component will retrieve a list of
Heroes from our `HeroService` and subscribe to set them to a variable in the component.


<code-example path="rxjs/src/app/hero-list.component.1.ts" linenums="false" title="src/app/hero-list.component.ts (subscribe)">

</code-example>


As you can see, we called and subscribed to the `getHeroes` function in our HeroService which returned an Observable provided
by the HTTP client and the `ngFor` directive is set up to display the heroes. In the `subscribe` function we assign the returned heroes to the heroes variable.
Here you are only assigning the `heroes` value to bind it to our template. The `Async Pipe` lets us skip the manual subscription,
as it will handle this for you. The updated template is below.


<code-example path="rxjs/src/app/hero-list.component.2.ts" linenums="false" title="src/app/hero-list.component.ts (async pipe)" region="async-pipe">

</code-example>


You will also update the `heroes` variable and name it `heroes$`, with the **$** denoting that its an Observable value. Its also
necessary to update the type from `Hero[]` to `Observable<Hero[]>` since the Observable is being passed directly to the template.


<code-example path="rxjs/src/app/hero-list.component.2.ts" linenums="false" title="src/app/hero-list.component.ts (observable heroes)" region="observable-heroes">

</code-example>


When your component is rendered, the async pipe will subscribe to the Observable to listen for emitted values. Once the values
are produced it will bind those values to the same `ngFor` directive. If you were to initiate another sequence of heroes
the pipe would handle updated the retrieved values along with destroying the Observable subscription once the component is destroyed.

{@a sharing-unwrapped-observable}


### Sharing observable reference

As stated previously, the `Async Pipe` creates a **new** subscription each time it is provided an Observable. The pipe unwraps the Observable and provides its
value to the template. This has a potential pitfall we want to avoid, which is creating multiple subscriptions for one resource. Let's look at a `HeroDetailComponent`
that uses the `Async Pipe` to retrieve a hero's details:

<code-example path="rxjs/src/app/hero-detail.component.1.ts" linenums="false" title="src/app/hero-detail.component.ts (async pipes)">

</code-example>

<div class="l-sub-section">

The `mergeMap` operator maps each value to a new Observable, and merges all the inner Observables. Once merged, the resulting value is emitted as an Observable result.

</div>

Looking at the template, you'll see the `Async Pipe` used 3 times. We also are using the `safe-navigation operator` on each hero attributes since its resolved asynchronously. This is not ideal as we are making 3 **separate** network requests to fetch the hero's details. Imagine if the hero had 10 different attributes we wanted to display? We don't want 10 requests. We only want to make one request to fetch the hero, and pass that data to the template. Using the **ngIfAs** syntax, you only use the async pipe once and assign its result to a template variable. Let's update the template using __ngIfAs__ statement to assign the result of the `hero$` Observable to the `hero` variable and update the hero name and hero id references.

<code-example path="rxjs/src/app/hero-detail.component.ts" linenums="false" title="src/app/hero-detail.component.ts (async pipe as template variable)" region="ngIfAs">

</code-example>

We still use the async pipe, but use it cleanly and more efficiently.

{@a sharing-data}


### Sharing data with a stream

As you build out your Angular application, you will start sharing data between multiple components. These components may span across multiple routes
or application views in your application hierarchy. This allows you to centralize where that data comes from and allow multiple recipients of
that data to handle it according to their needs. With Observables, you can push changes to this data and notify all of the subscribers so they can react
to it.

You will need a simple message bus provided by a service to aggregate events to share across multiple components. The name of your service will be
aptly named `EventAggregatorService`. Since you want your Observable subscribes to all get the "latest" value from the stream, you'll use a `BehaviorSubject`.


<div class="l-sub-section">

A `BehaviorSubject` is a special type of Observable that has a memory of the current value or the last value produced, so each new subscriber of this Observable
will get its current value immediately. It also lets you specify and initial or `seed` value that will be the first value produced when the Observable is subscribed to.

</div>


You'll import the `Injectable` decorator from `@angular/core` and the `BehaviorSubject` from the RxJS library to use it in the service.


<code-example path="rxjs/src/app/event-aggregator.service.ts" linenums="false" title="src/app/event-aggregator.service.ts (event interface)" region="imports">

</code-example>



The `scan` operator uses an accumulator function to collect the current value of the Observable and join it with the newly provided value. You use this
operator to provide an Observable of the accumulated values over time.

You'll need an interface to provide consumers with to add messages to the event log.


<code-example path="rxjs/src/app/event-aggregator.service.ts" linenums="false" title="src/app/event-aggregator.service.ts (event interface)" region="event-interface">

</code-example>



Next, you'll create your service. Since a `BehaviorSubject` keeps the latest value for subscribers, you'll provide it with an initial value also.
There is the `add` method for adding additional events to the log. Each time a new event is added, the subscribers will be notified of the newest value
pushed to the stream. The `scan` operator is collecting each newly pushed events and accumulating it with the current set of events in the array.


<code-example path="rxjs/src/app/event-aggregator.service.ts" linenums="false" title="src/app/event-aggregator.service.ts (excerpt)">

</code-example>



Now that you have a central place to collect events, you inject the `EventAggregatorService` throughout your application. In order to display
the message log, you'll create a simple message component to display the aggregated events. You use the `Async Pipe` here also to wire up the
stream to the template.


<code-example path="rxjs/src/app/message-log.component.ts" linenums="false" title="src/app/message-log.component.ts (message log component)">

</code-example>



As with other services, you'll import the `EventAggregatorService` and `MessageLogComponent` and add it to the `AppModule` providers and declarations
arrays respectively.


To see your message bus in action, you'll import and inject the `EventAggregatorService` in the `AppComponent` and add an event when the Application
starts and add the `message-log` component to the `AppComponent` template.


<code-example path="rxjs/src/app/app.component.1.ts" linenums="false" title="src/app/app.component.ts (message log)" region="message-log">

</code-example>



{@a error-handling}


### Error handling
As often as you strive for perfect conditions, errors will happen. Servers go down, invalid data is sent and other issues cause errors to happen
when processing data. While you do your best to prevent these errors, its also wise to be ready for them when they do happen. The scenario
this is most likely to happen in is when you're making data requests to an external API. This is a common task done with the Angular HTTP client.
The HTTP client provides methods that return requests as Observables, which in turn can handle errors. Let's simulate a failed request in your in the `HeroService`.


<code-example path="rxjs/src/app/hero.service.2.ts" linenums="false" title="src/app/hero.service.ts (failed heroes)" region="getHeroes-failed">

</code-example>



This is what the `HeroListComponent` currently looks like with no error handling and the simulated error.


<code-example path="rxjs/src/app/hero-list.component.3.ts" linenums="false" title="src/app/hero-list.component.ts (failed heroes)">

</code-example>



With this current setup, you have no way to recover and that's less than ideal. So let's add some error handling with the `catch` operator. You need
to import the `catch` operator. The `catch` operator will continue the observable sequence even after an exception occurs. Since you know that each
Observable operator returns a new Observable, and you use this to return an empty array or even a new Observable HTTP request.

You'll also import the `of` operator, which you use to create an Observable sequence from a list of arguments. In this case, you're returning an empty array
of `Heroes` when an error occurs.


<code-example path="rxjs/src/app/hero.service.2.ts" linenums="false" title="src/app/hero.service.ts (catch and return)">

</code-example>


Now we have a path of recovery. When the `getHeroes` request is made and fails, an error notification is produced, which will be handled
in the `catch` operation. This error handling is simplified, so returning an Observable with an empty array will suffice.


{@a retry}


### Retry Failed Observable

This is a simple path of recovery, but we can go further. What if you also wanted to _retry_ a failed request? With Observables, this is as easy as adding a new operator,
aptly named `retry`. If you've ever done this with a Promise, its definitely not a painless operation.

Of course you'll need to import the operator first.


<code-example path="rxjs/src/app/hero.service.3.ts" linenums="false" title="src/app/hero.service.ts (retry operator)" region="retry-import">

</code-example>


Add the `retry` operator to the Observable sequence. The retry operator takes an argument of the number of times you want to retry the sequence before completing.


<code-example path="rxjs/src/app/hero.service.3.ts" linenums="false" title="src/app/hero.service.ts (excerpt)">

</code-example>

The `retry` operator will re-subscribe to the source Observable, in this case is the Observable returned by the `http.get` method. Instead of failing on the
first error produced by the Observable, now the request will be attempted 3 times before giving up and going into the error sequence.

<div class="l-sub-section">

As a general rule, you don't use the `retry` operator on all types of requests. Requests such as authentication wouldn't be retried as those requests should
be initiated by user action. We don't want to lock out user accounts with repeated login requests uninitiated by our users.

</div>

## Testing

So you've learned about using Observables, sharing data, error handling and more, but there is another piece to this picture, which is testing. Testing Observables
in Angular is similar to many other testing methods. You arrange the data or stream you need, you act on the intended target, and assert against the expected result. Let's look at how you would test the examples provided earlier in the chapter.

You can run a <live-example plnkr="tests" embedded-style>live example of the tests provided below</live-example>.

{@a testing-stream-data}

### Testing Observable Services

First, let's look at the [sharing data with a stream](#sharing-data-with-a-stream) example. You want to verify the functionality of the service including its initial state, and that new entries are added into the stream each time the `add` method is used. If you're familiar with Angular's `TestBed`, this is a normal setup. You use the `TestBed` to setup the configure a testing module include the necessary providers, and use the `TestBed.get()` method to get a new instance of the `EventAggregatorService` before each test run.

<code-example path="rxjs/src/app/event-aggregator.service.spec.ts" linenums="false" title="src/app/event-aggregator.service.spec.ts (TestBed setup)" region="testing-1">

</code-example>

Now let's test the initial state of the Observable provided by your service through the `events$` property. You already know that retrieving data from an Observable involves _subscribing_ to it, and that's what you'll do in the test. Since you're using a `BehaviorSubject`, an Observable with a memory of its last value, you can subscribe to it. When the service is initially created, the `events$` stream is set to an empty array and that's what you'll validate against.

<code-example path="rxjs/src/app/event-aggregator.service.spec.ts" linenums="false" title="src/app/event-aggregator.service.spec.ts (initial value)" region="testing-2">

</code-example>

Since each test gets a new instance of the `EventAggregatorService`, you get a new instance of the `events$` BehaviorSubject and just as expected, the initial value is an empty array. You also want to validate that items can be pushed into the stream, so next you'll test the `add()` method and check its results.

<code-example path="rxjs/src/app/event-aggregator.service.spec.ts" linenums="false" title="src/app/event-aggregator.service.spec.ts (adding items)" region="testing-3">

</code-example>

This test requires a bit more setup, as you need to provide the `AppEvent` you want to push into the stream, calling the `add()` method to add a new item into the aggregated event stream, and _subscribing_ to the stream. The first argument in the `subscribe` callback will provide you with the latest data from your `BehaviorSubject`, which you assert against to verify the stream is producing what it should.

### Testing Component Streams

Along with testing services, you'll need to test data provided through Observables to your components. The [hero detail](#sharing-unwrapped-observable) component uses 2 Observables, the first retrieving route parameters from the `Router`, and then returning hero details through an Observable from the `Hero Service`. Since you're only testing the component itself, mocking out the `ActivatedRoute` and `HeroService` services will be sufficient. For the test setup, you'll create mocks of the mentioned services to provide replacement observables for the test.


<code-example path="rxjs/src/app/hero-detail.component.spec.ts" linenums="false" title="src/app/hero-detail.component.spec.ts (test setup)" region="testing-setup">

</code-example>


Looking at the test setup, the `MockActivateRoute` looks similar to the `ActivatedRoute` service used to provide the route parameters. The biggest difference is that the
`params` property provides a new instance of a `BehaviorSubject`. Since the `Router` provides the route parameters as an Observable, you want to mimic that behavior
without bringing in all the dependencies of the `ActivatedRoute`. The same goes for the `MockHeroService` implementation. The `HeroService` returns and Observable of the `Http` request made, but you are keeping the test shallow intentionally in this case. Now that the component is setup for testing, you can use the mock services to provide values during testing.

<code-example path="rxjs/src/app/hero-detail.component.spec.ts" linenums="false" title="src/app/hero-detail.component.spec.ts (test hero service)" region="testing-service-call">

</code-example>


First, you want to test that `HeroService.getHero()` method is called when receiving route parameters. You don't need to call the actual `getHero()` method, so you'll use a [spy](https://jasmine.github.io/2.0/introduction.html#section-Spies) as replacement for its implementation. For the spy you return an `Observable.of(hero)`, that will immediately resolve the to the mock `Hero` defined in the setup. When you call `route.params.next()`, it sends a new value of `{ id: 1 }` to the Observable, and the `mergeMap` operator will map the result of the route parameters to your stub `Hero` Observable. Since the component template is using the `AsyncPipe`, when you use the `fixture.detectChanges()` method to trigger change detection, the `AsyncPipe` will subscribe to the `Observables` provided during the test, which in turn calls the `HeroService.getHero()` function. Lastly, we can assert that the method was successfully called.

You also want to verify that the component is rendering the Observable correctly.

<code-example path="rxjs/src/app/hero-detail.component.spec.ts" linenums="false" title="src/app/hero-detail.component.spec.ts (test component template)" region="testing-component-template">

</code-example>

The test setup is similar to the previous test, but now you're inspecting the rendered component's contents to verify that the `Observable`s provided are display correctly.
You want to verify that the `Hero` with and `ID` of `1`, is subscribed to by the component using the `AsyncPipe` and displays the hero details.

### Marble Testing


RxJS also has a special [DSL](https://en.wikipedia.org/wiki/Domain-specific_language) for testing Observables using "Marble tests". Marble testing allows you to test Observable sequences visually using [marble notation](https://github.com/ReactiveX/rxjs/blob/master/doc/writing-marble-tests.md#marble-syntax) to represent events happening over time. Marble testing is very powerful in that you compose events using the string-based marble syntax, it creates the Observables, whether they be `Hot` or `Cold` and can assert those Observables against the expected results in a given sequence. Let's look at the syntax for marble diagrams.

<table width="100%">

  <col width="25%">

  </col>

  <col width="75%">

  </col>

  <tr>

    <th>
      Notation
    </th>

    <th>
      Description
    </th>

  </tr>

  <tr>

    <td>

      `-`

    </td>

    <td>

      Each dash is a _frame_ used to simulate a passage of _time_. Each dash represents 10 "frames" of time. Since `Observable`s can be asynchronous,
      when testing time-based sequences, frames are similar to using the `tick` function in Angular's testing framework.

    </td>

  </tr>

  <tr>

    <td>

      `|`

    </td>

    <td>

      The pipe represents the `complete` notification from an Observable. This is the same as the Observable producer calling the `.complete()` method.

    </td>

  </tr>  

  <tr>

    <td>

      `#`

    </td>

    <td>

      The pipe represents an `error` notification from an Observable. This is the same as the Observable producer calling the `.error()` method.

    </td>

  </tr>

  <tr>

    <td>

      `a` or any character

    </td>

    <td>

      All other characters represents a value being produced by an Observable. This is the same as the Observable producer calling the `.next()` method with a provided value.

    </td>

  </tr>  

  <tr>

    <td>

      `()` or grouping

    </td>

    <td>

      Parenthesis are used to group events together in the _same frame_. Values and completion or error are grouped together using parenthesis.

    </td>

  </tr>  

  <tr>

    <td>

      `^` or subscription point

    </td>

    <td>

      Only used when testing *Hot* Observables, the caret represents the point at which the observable was subscribed to. This also represents the "zero frame", where all frames before the `^` will be negative.

    </td>

  </tr>   

  <tr>

    <td>

      `!` or unsubscription point

    </td>

    <td>

      Only used when testing *Subscriptions*, the exclamation represents the point at which the observable was unsubscribed from.

    </td>

  </tr>     

</table>

You can learn more about marble tests below:

* [Writing Marble Tests](https://github.com/ReactiveX/rxjs/blob/master/doc/writing-marble-tests.md)  
* [Intro to RxJS Marble Testing](https://egghead.io/lessons/rxjs-introduction-to-rxjs-marble-testing)
* [Testing Race Condition Using RxJS Marbles](https://blog.nrwl.io/rxjs-advanced-techniques-testing-race-conditions-using-rxjs-marbles-53e7e789fba5)  

Underneath, marble tests use a `TestScheduler` to enable testing of asynchronous events in a synchronous way. RxJS provides marble testing as part of its internal testing framework, and those tools can be used external to the RxJS library. For the purposes of this guide, you can take advantage of an existing library called that packages up the marble testing framework and integrates it with the `Jasmine` test runner, aptly named [jasmine-marbles](https://github.com/synapse-wireless-labs/jasmine-marbles).

You can run a <live-example plnkr="tests" embedded-style>live example of the tests provided below</live-example>.

Let's test the `HeroService` using marble testing.

<code-example path="rxjs/src/app/hero.service.spec.ts" linenums="false" title="src/app/hero.service.spec.ts (marble testing setup)" region="marble-testing-setup">

</code-example>

The testing setup is similar to a normal testing setup. Since you're unit testing and isolating the `HeroService` from outside dependencies, you mock out the `Http` service with the `get()` method using a jasmine spy. Since the `HeroService` only has one dependency, you could have skipped using the `TestBed` to inject dependencies, but as a convenience you'll use it to setup the providers and get instances of them.

<div class="l-sub-section">

The `jasmine-marbles` package initializes the `TestScheduler` before each test, adds a custom Jasmine matcher `toBeObservable` for test assertions and resets the `TestScheduler` after each test, all of which are transparent when running tests.

</div>

The `http.get()` method returns a _cold_ Observable, which does make the network request and produce a value until its subscribed to. You want to simulate this in a test, and the `cold` function is used to return a _cold_ Observable. Using the marble syntax, you can write a test to verify this behavior.

<code-example path="rxjs/src/app/hero.service.spec.ts" linenums="false" title="src/app/hero.service.spec.ts (retrieve hero test)" region="retrieve-hero-test">

</code-example>

Looking at the test, you'll notice a few things. The `data` variable is used to provide the return value, which is a mock object with a `json()` method to return a mock `Hero`. The `response$` set up the `cold` Observable using the marble diagram, which waits two frames, delivers the value `a` and then completes with the `|` character. You also substitute actual values for the characters in the marble diagram, using an object as the second argument in the `cold()` method. The object contains the `a` property, and its value being the `data` variable. Now you can see how marble diagrams shine. You can visually see and represent the sequence of events under test. The `expected$` is also a marble diagram of how you expect the Observable sequence to play out.

The `toBeObservable` assertion method uses the `TestScheduler` to unwrap both marble diagram Observables and convert them to strings. The strings are then compared the for equality.

<div class="l-sub-section">

There is also a `hot` method for testing _Hot_ Observables, which are Observables that produce events even before they are subscribed to. The signature is the same as the `cold()` method.

</div>

Earlier in the chapter, you learned about the `retry` operator and how it retries a failed Observable a given number of times before returning an error. You can also verify the behavior of a sequence of retries. Let's simulate a failed request using the `HeroService.getHeroes()` method and a successful response after a retry using a marble diagram.

<code-example path="rxjs/src/app/hero.service.spec.ts" linenums="false" title="src/app/hero.service.spec.ts (getHeroes success on retry)" region="retry-heroes-success">

</code-example>

To simulate an error response, you still use the same syntax, but use the `#` character to denote an error being returned. The third parameter in the `cold` method is the replacement value for the error in the marble diagram. Since the `retry` operator re-subscribes to the _source_ Observable, you need to provide a new Observable for each retry. The `expected$` marble diagram reflects that even though you received an error during the sequence, it was never propagated up and after the second set of frames, the heroes were returned.

<div class="l-sub-section">

The `defer` Observable is an `Observable` factory, waiting until the `Observable` is subscribed to, calling the provided function and returning a _new_ instance of the `Observable` each for each subscriber.

</div>

Testing that an error is returned after exhausting the number retries is also a strength of testing with marble diagrams.

<code-example path="rxjs/src/app/hero.service.spec.ts" linenums="false" title="src/app/hero.service.spec.ts (getHeroes failure)" region="retry-heroes-failure">

</code-example>

Instead of returning a successful response, the `response$` returns an error until all retry attempts have been made, and then the error is passed up the Observable chain. The `expected$` marble diagram, shows a set of frames for each retry attempt and ends with a grouped error and completion event. You can also assert the number of calls made in total.
