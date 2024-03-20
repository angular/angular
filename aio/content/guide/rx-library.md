# The RxJS library

Reactive programming is an asynchronous programming paradigm concerned with data streams and the propagation of change \([Wikipedia](https://en.wikipedia.org/wiki/Reactive_programming)\).
RxJS \(Reactive Extensions for JavaScript\) is a library for reactive programming using observables that makes it easier to compose asynchronous or callback-based code.
See the [RxJS Docs](https://rxjs.dev/guide/overview).

RxJS provides an implementation of the `Observable` type, which is needed until the type becomes part of the language and until browsers support it.
The library also provides utility functions for creating and working with observables.
These utility functions can be used for:

*   Converting existing code for async operations into observables
*   Iterating through the values in a stream
*   Mapping values to different types
*   Filtering streams
*   Composing multiple streams

## Observable creation functions

RxJS offers a number of functions that can be used to create new observables.

These functions can simplify the process of creating observables from things such as events, timers, and promises.
For example:

<code-example header="Create an observable from a promise" path="rx-library/src/simple-creation.1.ts" region="promise"></code-example>

<code-example header="Create an observable from a counter" path="rx-library/src/simple-creation.2.ts" region="interval"></code-example>

<code-example header="Create an observable from an event" path="rx-library/src/simple-creation.3.ts" region="event"></code-example>

<code-example header="Create an observable that creates an AJAX request" path="rx-library/src/simple-creation.ts" region="ajax"></code-example>

### Subject 

An RxJS [`Subject`](https://rxjs.dev/guide/subject) is a popular way to create and control an observable of your own design.

A `Subject` is a special kind of `Observable`. It is special in two important respects:
1. You can push values into that `Observable` by calling its `next(value)` method.
2. It is a ["multicast"](https://rxjs.dev/guide/glossary-and-semantics#multicast) observable, which means all subscribers of a `Subject` instance receive the same values from that instance.

These aspects of `Subject` make it easy to create a [loosely coupled](https://en.wikipedia.org/wiki/Loose_coupling) message service. One part of the application can send messages through the service; other parts of the application can listen to those messages; none of the parts know about each other.

<a id="message-service"></a>

Here is a `MessageService` example:
<code-example header="MessageService" path="rx-library/src/app/message.service.ts"></code-example>

Key features:
* The `Subject` is *private*. Consumers of the service access the `Subject` through a controlled public API.
* The `messages$` property exposes the `Subject`'s *observable* aspect-only; a consumer cannot push values into the `Subject` through this observable.
* Dedicated methods (`addError` and `addWarning`) tightly manage how service consumers add values to the hidden `Subject`.
* `Subject` values are always of the `Message` type; consumers of the `messages$` observable can rely on the shape of those values.

[See below](#loosely-coupled-apps) how you can use such a service to build a loosely coupled application.

## Operators

[Operators](https://rxjs.dev/guide/operators) enable transformations of observable values. An operator is a function that takes an observable source and configuration options, manipulates the values from that source in some useful way, and returns a new observable of the transformed values. 

You can chain operators in a sequence to produce a custom observable tailored to your needs. When you subscribe to that new observable, you get the results of the intermediate transformations.

RxJS offers numerous built in operators for common use cases such as `map()`, `filter()`, `concat()`, and `mergeMap()`.

Here is a example that uses the `map` operator to square a sequence of integers:

<code-example header="Map operator" path="rx-library/src/operators.ts"></code-example>

Notice that you pass the `map` operator to the observable's `pipe` method. This is called "piping" the source observable through the operator.

You can chain multiple operators together by adding them as parameters to the `pipe` call. The following example first `filters` for the odd integers and then squares their values in the `map`. The resulting observable emits the squares of the odd integers from the source.

<code-example header="Observable.pipe function" path="rx-library/src/operators.2.ts"></code-example>

<div class="alert is-helpful">

You can create your own custom operator with the `pipe` method to encapsulate a re-usable chain of operators. The following example creates a `squareOddValues` operator and then pipes the source integers through it.

<code-example header="Standalone pipe function" path="rx-library/src/operators.1.ts"></code-example>

</div>

Think of a sequence of operators as a recipe for the final observable &mdash; as a set of instructions for producing the values you're interested in.

Remember that, by itself, the recipe doesn't do anything;
you need to call `subscribe()` to produce a result through the recipe.

<a id="loosely-coupled-apps"></a>
### Loosely coupled transformations

RxJS operators facilitate development of [loosely coupled](https://en.wikipedia.org/wiki/Loose_coupling) applications.
One part of the application can add values to an observable without knowing how the observable will be consumed or by whom.

Another part of the application can pipe operators onto that observable to transform its values into a shape it finds useful.

The `MessageService` example [described earlier](#message-service) demonstrates these points. The `AppComponent` presents the user with buttons to add messages, either of the error or warning type. The button click handlers send those messages to the service. 

<code-example header="AppComponent (excerpt)" path="rx-library/src/app/app.component.ts" region="add-messages"></code-example>

Neither the `AppComponent` nor the service know what will happen to those messages.

Elsewhere, the `MessageComponent` filters and maps the messages into separate `string` observables, one for errors and another for warnings.

<code-example header="MessageComponent (excerpt)" path="rx-library/src/app/message.component.ts" region="observables"></code-example>

The component goes on to display these observables to the user.

This ability to manipulate streams of asynchronous data in a loosely coupled way is perhaps the best use case for RxJS in your application.

<div class="alert is-helpful">

To see this messaging example in action, try <live-example name="rx-library"></live-example>.

</div>

### Common operators

RxJS provides many operators, but only a handful are used frequently.

| Area           | Operators                                                                 |
|:---            |:---                                                                       |
| Creation       |  `from`, `fromEvent`, `of`                                                |
| Combination    | `combineLatest`, `concat`, `merge`, `startWith` , `withLatestFrom`, `zip` |
| Filtering      | `debounceTime`, `distinctUntilChanged`, `filter`, `take`, `takeUntil`     |
| Transformation | `bufferTime`, `concatMap`, `map`, `mergeMap`, `scan`, `switchMap`         |
| Utility        | `startWith`, `tap`                                                        |
| Multicasting   | `shareReplay`                                                             |

For a complete list of operators and usage samples, visit the [RxJS API Documentation](https://rxjs.dev/api).

## Error handling

In addition to the `error()` handler that you provide on subscription, RxJS provides the `catchError` operator that lets you handle known errors in the observable recipe.

For instance, suppose you have an observable that makes an API request and maps the response from the server.

If the server returns an error or the value doesn't exist, an error is produced.
If you catch this error with the `catchError` operator and return an observable of a default value, your stream continues to process values rather than erroring out.

Here's an example:

<code-example header="catchError operator" path="rx-library/src/error-handling.ts"></code-example>

### Multiple Subscribers

Most observables are "***unicast***", which means that each new subscriber gets its own execution of that observable. Whatever is driving the source observable starts over again for the added subscriber.

The  RxJS `interval()` function in the following example produces a *unicast* observable that emits an integer every half second. 
<code-example header="unicast" path="rx-library/src/app/uni-multi-cast.component.ts" region="unicast-observable"></code-example>

Each new subscriber receives a fresh round of integers starting from zero.

>**Unicast Subscriber(s)**:<br>
>Unicast Subscriber #1 received 9<br>
>Unicast Subscriber #2 received 5<br>
>Unicast Subscriber #3 received 0

Most observables are *unicast* like `interval`. 
For example, the observable returned from Angular's [`HttpClient.get()`](guide/understanding-communicating-with-http) is *unicast*. It makes a fresh call to the server every time you subscribe to it. 

That *may* be what you intend.
But sometimes you want the same source of values to be shared with everyone who subscribes. For example, once you have asked `HttpClient.get()` to return some configuration, you probably don't want to make another request to the server the next time you subscribe; you want the same configuration that you got last time. 

You want that `HttpClient.get` observable to behave like a "***multicast***" observable.

A `Subject`, such as the one in the `MessageService`, is a *multicast* observable by design. Its subscribers always get the same, latest message.

We need to do something special to turn the *unicast* observables from `interval` and `HttpClient` into *multicast* observables. A typical solution is to add the [`shareReplay()`](https://rxjs.dev/api/index/function/shareReplay) operator to the pipe; add it to the end if you have a list of operators.

Here is `interval` again, this time with `shareReplay`:

<code-example header="multicast with shareReplay" path="rx-library/src/app/uni-multi-cast.component.ts" region="shareReplay-observable"></code-example>

<div class="alert is-helpful">

  The `bufferSize=1` option means that new subscribers receive the latest value (the buffered value) emitted previously by the observable.

  The `refCount=false` option means that if *everyone unsubscribes* and then someone new subscribes, that new subscriber gets the last emitted value.

  If `refCount` is `true`, when everyone unsubscribes and then someone new subscribes, that new subscriber initiates a fresh execution of the source observable. The `interval` example will restart from zero.
  
</div>

Each new subscriber receives the same integer last emitted by the observable.

>**Multicast ShareReplay Subscriber(s)**:<br>
>ShareReplay Subscriber #1 received 9<br>
>ShareReplay Subscriber #2 received 9<br>
>ShareReplay Subscriber #3 received 9

<div class="alert is-helpful">

To see the unicast / multicast comparison in action, try <live-example name="rx-library"></live-example>.

</div>

### Retry failed observable

Where the `catchError` operator provides a simple path of recovery, the `retry` operator lets you retry a failed request.

Use the `retry` operator before the `catchError` operator.
It resubscribes to the original source observable, which can then re-run the full sequence of actions that resulted in the error.
If this includes an HTTP request, it will retry that HTTP request.

The following converts the previous example to retry the request before catching the error:

<code-example header="retry operator" path="rx-library/src/retry-on-error.ts"></code-example>

<div class="alert is-helpful">

Do not retry **authentication** requests, since these should only be initiated by user action.
We don't want to lock out user accounts with repeated login requests that the user has not initiated.

</div>

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2023-08-25
