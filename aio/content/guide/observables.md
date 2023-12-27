<a id="using-observables-to-pass-values"></a>
# Using observables for streams of values

Observables are a technique for event handling, asynchronous programming, and handling multiple values emitted over time.

The observer pattern is a software design pattern in which an object, called the *subject*, maintains a list of its dependents, called *observers*, and notifies them automatically of state changes.
This pattern is similar \(but not identical\) to the [publish/subscribe](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) design pattern.

Angular apps tend to use the [RxJS library for Observables](https://rxjs.dev/). This overview covers just the basics of observables as implemented by that library.
## Basic usage and terms

Observables are declarative.  You define a function for publishing values &mdash; the *source* &mdash; but that function is not executed until a consumer subscribes to the observable by calling the observable's `subscribe` method.

This *subscriber* then receives notifications from the observable until it completes, emits an error, or the consumer unsubscribes.

An observable can deliver multiple values of any type &mdash; literals, messages, or events &mdash; depending on the context. A stream of keystrokes, an HTTP response, and the ticks of an interval timer are among the typical observable sources. The observable API applies consistently across all of these diverse sources.

An observable can emit one, many, or no values while subscribed. It can emit synchronously (emit the first value immediately) or asynchronously (emit values over time).

Because setup and teardown logic are both handled by the observable, your application code only needs to worry about subscribing to consume values and unsubscribing when done.

[RxJS *Operators*](guide/rx-library#operators) enable transformations of observable values. An *Operator* takes an observable source, manipulates the values from that source in some useful way, and returns a new observable of the transformed values. When you subscribe to that new observable, you get the results of the intermediate transformations.

This ability to progressively transform observable values - and even combine multiple observable sources into a consolidated observable - is one of the most powerful and appealing of RxJS features.

Accordingly, observables are used extensively within Angular applications and within Angular itself. 

<div class="alert is-helpful">

To be fair, RxJS has a steep learning curve and sometimes bewildering behavior. Use them judiciously.

</div>

## Observable

An observable is an object that can emit one or more values over time.

Here's a simple observable that will emit `1`, then `2`, then `3`, and then completes.

<code-example header="An observable emitting 3 integers" path="observables/src/subscribing.ts" region="observable"></code-example>

<div class="alert is-helpful">

The RxJS method, `of(...values)`, creates an `Observable` instance that synchronously delivers each of the values provided as arguments. 

</div>

### Naming conventions for observables

Notice the "&dollar;" on the end of the observable name. The "&dollar;" signifies that the variable is an observable "&dollar;tream" of values.

This is a widely adopted naming convention for observables. 

Not everyone likes it. Because Angular applications are written in TypeScript and code editors are good at revealing an object's type, you can usually tell  when a variable is an observable. Many feel the "&dollar;" suffix is unnecessary and potentially misleading.

On the other hand, the trailing "&dollar;" can help you quickly identify observables when scanning the code. Also, if you want a property to hold the most recent value emitted from an observable, it can be convenient to use the source observable's root name without the "&dollar;".

The Angular framework and tooling do not enforce this convention. Feel free to use it or not.

## Subscribing

An observable begins publishing values only when someone subscribes to it. That "1-2-3" observable won't emit any numbers until you subscribe by calling the observable's `subscribe()` method.

If you want to begin publishing but don't care about the values or when it completes, you can call subscribe with no arguments at all

<code-example header="Start publishing" path="observables/src/subscribing.ts" region="no-params"></code-example>

You're more likely interested in doing something with the values. Pass in a method - called a "next" handler - that does something every time the observable emits a value.

<code-example header="Subscribe to emitted values" path="observables/src/subscribing.ts" region="next-param"></code-example>

Passing a `next()` function into `subscribe` is a convenient syntax for this most typical case. If you also need to know when the observable emits an error or completes, you'll have to pass in an `Observer` instead.

## Defining observers

An observable has three types of notifications: "next", "error", and "complete".

An `Observer` is an object whose properties contain handlers for these notifications.

| Notification type | Details |
|:---               |:---     |
| `next`            | A handler for each delivered value. Called zero or more times after execution starts.                                                           |
| `error`           | A handler for an error notification. An error halts execution of the observable instance and unsubscribes.                                                       |
| `complete`        | A handler for the execution-complete notification. Do not expect `next` or `error` to be called again. Automatically unsubscribes. |

Here is an example of passing an observer object to `subscribe`:

<code-example header="Subscribe with full observer object" path="observables/src/subscribing.ts" region="object-param"></code-example>

<div class="alert is-helpful">

Alternatively, you can create the `Observer` object with functions named `next()`, `error()` and `complete()`. 

<code-example path="observables/src/subscribing.ts" region="object-with-fns"></code-example>

This works because JavaScript turns the function names into the property names.

</div>

All of the handler properties are optional.
If you omit a handler for one of these properties, the observer ignores notifications of that type.

## Error handling

Because observables can produce values asynchronously, try/catch will not effectively catch errors.
Instead, you handle errors by specifying an `error` function on the observer.

Producing an error also causes the observable to clean up subscriptions and stop producing values.

<code-example  path="observables/src/subscribing.ts" region="next-or-error"></code-example>

Error handling \(and specifically recovering from an error\) is [covered in more detail in a later section](guide/rx-library#error-handling).

## Creating observables

The RxJS library contains a number of functions for creating observables. Some of the most useful are [covered later](guide/rx-library#observable-creation-functions).

You can also use the `Observable` constructor to create an observable stream of any type.
The constructor takes as its argument the *subscriber function* to run when the observable's `subscribe()` method executes.

A subscriber function receives an `Observer` object, and can publish values to the observer's `next()`, `error`, and `complete` handlers.

For example, to create an observable equivalent to the `of(1, 2, 3)` above, you could write something like this:

<code-example header="Create observable with constructor" path="observables/src/creating.ts" region="subscriber"></code-example>

## Geolocation example

The following example demonstrates the concepts above by showing how to create and consume an observable that reports geolocation updates.

<code-example header="Observe geolocation updates" class="no-auto-link" path="observables/src/geolocation.ts"></code-example>

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2023-08-25
