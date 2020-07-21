# Using observables to pass values

The Angular API makes frequent use of observables, and applications commonly use them for event handling and asynchronous programming. Some parts of the Angular API expect or return values in observables, and you can use them in your own code to pass messages between parts of your application.

Angular makes use of and extends Reactive Extensions for JavaScript (RxJS), a library for [reactive programming](https://en.wikipedia.org/wiki/Reactive_programming "Wikipedia").
RxJS provides an implementation of the `Observable` type, which makes it easier to compose asynchronous or callback-based code in TypeScript applications. The library also provides many useful [operators and utility functions](#rx-library "Using RxJS functions and operators") for working with observables.

## How observables work

Observables get their name from the observer _pattern_. In this pattern, an object maintains a list of its dependents, called *observers*, and notifies them automatically of state changes.
This pattern is similar to the [publish/subscribe](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern "Wikipedia") design pattern.

Observables are declarative&mdash;that is, you define a function for publishing values, but it is not executed until a consumer subscribes to it.
The subscribed consumer then receives notifications until the function completes or errors out, or until they unsubscribe.

An observable can deliver multiple values of any type&mdash;literals, messages, or events, depending on the context.
Consumers can receive observable values synchronously or asynchronously.
You subscribe to an observable to consume values, and unsubscribe when the execution completes or you no longer need to listen for new values.

Because of these advantages, observables are used extensively within Angular, and are recommended for app development as well.

## Basic usage and terms

As a publisher, you create an `Observable` instance that defines a *subscriber* function. This is the function that is executed when a consumer calls the `subscribe()` method. The subscriber function defines how to obtain or generate values or messages to be published.

To execute the observable you have created and begin receiving notifications, you call its `subscribe()` method, passing an *observer*. This is a JavaScript object that defines the handlers for the notifications you receive. The `subscribe()` call returns a `Subscription` object that has an `unsubscribe()` method, which you call to stop receiving notifications.

Here's an example that demonstrates the basic usage model by showing how an observable could be used to provide geolocation updates.

<code-example class="no-auto-link" path="observables/src/geolocation.ts" header="Observe geolocation updates"></code-example>

## Defining observers

A handler for receiving observable notifications implements the `Observer` interface. It is an object that defines callback methods to handle the three types of notifications that an observable can send:

| Notification type | Description |
|:---------|:-------------------------------------------|
| `next`  | Required. A handler for each delivered value. Called zero or more times after execution starts.|
| `error` | Optional. A handler for an error notification. An error halts execution of the observable instance.|
| `complete` | Optional. A handler for the execution-complete notification. Delayed values can continue to be delivered to the next handler after execution is complete.|

An observer object can define any combination of these handlers. If you don't supply a handler for a notification type, the observer ignores notifications of that type.

## Subscribing to observables

An `Observable` instance begins publishing values only when you subscribe to it.
You subscribe by calling the `subscribe()` method of the observable instance, passing an observer object to receive the notifications.

The following example creates and subscribes to a basic observable, with an observer that logs the received message to the console.

<div class="alert is-helpful">

For demonstration purposes, this example creates the observable using an [RxJS creation function](#observable-creation-functions "Read more about creation functions").
The `of(...items)` function returns an Observable instance that synchronously delivers the values provided as arguments.

You can also use a constructor to create new instances of `Observable`, as shown in the section [Creating observables](#creating-observables).
</div>

<code-example
  path="observables/src/subscribing.ts"
  region="observer"
  header="Subscribe using observer"></code-example>

As an alternative to passing in an observer object, the `subscribe()` method can accept inline callback function definitions for `next`, `error`, and `complete` handlers, in that order. For example, the following `subscribe()` call is the same as the one that specifies the predefined observer:

<code-example path="observables/src/subscribing.ts" region="sub_fn" header="Subscribe with positional arguments"></code-example>

The `next()` handler can receive information such as message strings, or event objects, numeric values, or structures, depending on context.
An observable can produce any type of value, and publishes those values as a stream.

## Creating observables

Use the `Observable` constructor to create an observable stream of any type. The constructor takes as its argument the subscriber function to run when the observable’s `subscribe()` method executes. A subscriber function receives an `Observer` object, and can publish values to the observer's `next()` method.

For example, to create an observable equivalent to the `of(1, 2, 3)` above, you could do something like this:

<code-example path="observables/src/creating.ts" region="subscriber" header="Create observable with constructor"></code-example>

You can create an observable that publishes events. In the following example, the subscriber function is defined inline.

<code-example path="observables/src/creating.ts" region="fromevent" header="Create with custom fromEvent function"></code-example>

You can use this function to create an observable that publishes keydown events, as follows:

<code-example path="observables/src/creating.ts" region="fromevent_use" header="Use custom fromEvent function"></code-example>

## Multicasting  values to multiple subscribers

*Multicasting* is the practice of broadcasting emitted values from a single observable execution to a list of multiple subscribers.

A typical observable creates a new, independent execution for each subscribed observer.
When an observer subscribes, the observable creates and runs a producer instance that delivers values to that observer.
When a second observer subscribes, the observable creates and runs a new producer instance that delivers values to that second observer in a separate execution.

Sometimes, instead of starting an independent execution for each subscriber, you want each subscription to get the same values&mdash;even if values have already started emitting.
For example, you might want to create an observable of clicks on a document object.
With a multicasting observable, you don't register multiple listeners on the document, but instead re-use the first listener and send values out to each subscriber.

Consider the following example that counts from 1 to 3, with a one-second delay after each number emitted.

<code-example path="observables/src/multicasting.ts" region="delay_sequence" header="Create a delayed sequence"></code-example>

When creating the observable, you should determine how you want to use that observable and whether you want to multicast its values.
If you subscribe twice, notice that there are two separate streams, each emitting values every second.

<code-example path="observables/src/multicasting.ts" region="subscribe_twice" header="Two subscriptions"></code-example>

The following code changes the observable to use multicasting instead:

<code-example path="observables/src/multicasting.ts" region="multicast_sequence" header="Create a multicast subscriber"></code-example>

### Multicast with the _Subject_ class

RxJS provides the [`Subject` class](https://rxjs.dev/guide/subject "RxJS API reference") that simplifies the process of multicasting.

<code-example path="observables/src/multicasting-subject.ts" region="multicast_subject" header="Use a Subject for multicasting"></code-example>

## Error handling

An observable can produce values (calling the `next` callback), or it can complete, calling either the `complete` or `error` callback. It can also do none of these things, producing only side effects.

Because observables emit errors asynchronously, the try/catch construction does not effectively catch errors. Instead, you generally handle errors by specifying an `error` callback on the observer.
Producing an error also causes the observable to clean up subscriptions and stop producing values.

<code-example>
myObservable.subscribe({
  next(num) { console.log('Next num: ' + num)},
  error(err) { console.log('Received an error: ' + err)}
});
</code-example>

In addition to the `error()` handler that you provide on subscription, the RxJS library provides the [`catchError` operator](https://rxjs.dev/api/operators/catchError "RxJS API reference") that lets you handle known errors in the observable code.

For instance, suppose you have an observable that makes an API request and maps to the response from the server. If the server returns an error or the value doesn’t exist, an error is produced. If you catch this error and supply a default value, your stream continues to process values rather than erroring out.

The following example demonstrates the `catchError` operator:

<code-example path="rx-library/src/error-handling.ts" header="catchError operator"></code-example>

### Retrying a failed observable

Where the `catchError` operator provides a simple path of recovery, the [`retry` operator](https://rxjs.dev/api/operators/retry "RxJS API reference") lets you retry a failed request.

Use the `retry` operator before the `catchError` operator. It resubscribes to the original source observable, which can then re-run the full sequence of actions that resulted in the error. If this includes an HTTP request, it will retry that HTTP request.

The following code converts the previous example to retry the request before catching the error:

<code-example path="rx-library/src/retry-on-error.ts" header="retry operator"></code-example>

<div class="alert is-important">

   Do not retry **authentication** requests, since only users should initiate this action. You don't want to lock out user accounts with repeated login requests that the user has not initiated.

</div>

<!-- This could go at the beginning of practical-observable-usage.md -->

{@a rx-library}

## Creating and working with observables

The  [RxJS](https://rxjs.dev/guide/overview "RxJS documentation") library, which provides the basic `Observable` type, also provides utility functions for creating and working with observables.
You can import these from the `rxjs` library in your Angular application, and use them to accomplish the following kinds of tasks:

* Convert existing code for async operations into observables
* Iterate through the values in a stream
* Map values to different types
* Filter streams
* Compose multiple streams

### Observable creation functions

RxJS offers a number of functions that you can use to create new observables. These functions help you create observables from things such as events, timers, promises, and so on. For example:


<code-example path="rx-library/src/simple-creation.ts" region="promise" header="Create an observable from a promise"></code-example>

<code-example path="rx-library/src/simple-creation.ts" region="interval" header="Create an observable from a counter"></code-example>

<code-example path="rx-library/src/simple-creation.ts" region="event" header="Create an observable from an event"></code-example>

<code-example path="rx-library/src/simple-creation.ts" region="ajax" header="Create an observable that creates an AJAX request"></code-example>

### Operators

Operators are functions that allow you to manipulate the values that observables return.
For example, RxJS defines operators such as `map()`, `filter()`, `concat()`, and `mergeMap()`.

Operators take configuration options, and they return a function that takes a source observable.
When executing this returned function, the operator observes the source observable’s emitted values, transforms them, and returns a new observable of those transformed values.
For example:

<code-example path="rx-library/src/operators.ts" header="Map operator"></code-example>

You can use _pipes_ to link operators together. Pipes let you combine multiple functions into a single function.
The `pipe()` function takes as its arguments the functions you want to combine, and returns a new function that, when executed, runs the composed functions in sequence.

<div class="alert is-helpful">

 For Angular applications, it is recommended that you combine operators with pipes (rather than _chaining_, which is used in many RxJS examples).

</div>

A set of operators applied to an observable is a set of instructions for producing the values you’re interested in.
The operators require input from the execution of an observable.
You need to call `subscribe()` to execute the observable and produce a result from the operators.

Here’s an example:

<code-example path="rx-library/src/operators.1.ts" header="Standalone pipe function"></code-example>

The `pipe()` function is also a method on the RxJS `Observable`, which means you can use this shorter form to define the same operation:

<code-example path="rx-library/src/operators.2.ts" header="Observable.pipe function"></code-example>

### Common operators

RxJS provides many operators. The following are commonly used in Angular applications:


| Area | Operators |
| :------------| :----------|
| Creation |  `from`,`fromEvent`, `of` |
| Combination | `combineLatest`, `concat`, `merge`, `startWith` , `withLatestFrom`, `zip` |
| Filtering | `debounceTime`, `distinctUntilChanged`, `filter`, `take`, `takeUntil` |
| Transformation | `bufferTime`, `concatMap`, `map`, `mergeMap`, `scan`, `switchMap` |
| Utility | `tap` |
| Multicasting | `share` |

For a full list of operators and usage samples, visit the [RxJS API documentation](https://rxjs.dev/api).


## Naming conventions for observables

Angular applications are mostly written in TypeScript, which makes it easier to know when a variable is an observable.
However, a common naming convention for observables is to add a `$` to the variable name; for example, `response$`.
Remember that the Angular framework does not enforce this convention.

Using this naming convention can help you when you are scanning through code and looking for observable values, or when you want to associate an observable with a property that stores its returned values.
For example:

<code-example path="rx-library/src/naming-convention.ts" header="Naming observables"></code-example>