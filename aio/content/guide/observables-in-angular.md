# Using observables for asynchronous operations in Angular

The Angular API makes use of observables as an interface to handle a variety of common asynchronous operations. For example:

* The [AsyncPipe](#async-pipe "Handling observables from an async pipe") subscribes to an observable or promise and returns the latest value it has emitted.

* The [HTTP service](#http "Handling observables from an HTTP call") uses observables to handle AJAX requests and responses.

* The [Router](#router "Handling observables from router events") and [Reactive Forms](#forms "Handling observables from reactive form events") services use observables to listen for and respond to user-input events.

In addition to working with the Angular APIs that create or consume observables, you can use them to implement your own asynchronous features. For example:

* Observables are suitable for the implementation of [type-ahead suggestions](#type-ahead "Using observables for type-ahead").

* Observables can ease implementation of [exponential backoff and retry](#exp-backoff "Using observables for exponential backoff").

* You can define [custom events](#event-handling "Transmitting data between components") that send observable output data from a child to a parent component.


{@a async-pipe}

## Handling observables from an async pipe

The [AsyncPipe](api/common/AsyncPipe "API reference") subscribes to an observable or promise and returns the latest value it has emitted. When a new value is emitted, the pipe marks the component to be checked for changes.

The following example binds the `time` observable to the component's view. The observable continuously updates the view with the current time.

<code-example path="observables-in-angular/src/main.ts" header="Using async pipe" region="pipe"></code-example>

{@a http}

## Handling observables from HTTP calls

Angular’s `HttpClient` returns observables from HTTP method calls. For instance, `http.get(‘/api’)` returns an observable. This provides several advantages over promise-based HTTP APIs:

* Observables allow response data to be combined, filtered, and transformed through the composition of simple operators.
* HTTP requests are cancellable through the `unsubscribe()` method.
* Requests can be configured to get progress event updates.
* Failed requests can be retried easily.

{@a router}

## Handling observables from router events

[`Router.events`](api/router/Router#events "API reference") provides events as observables. You can use the `filter()` operator from RxJS to look for events of interest, and subscribe to them in order to make decisions based on the sequence of events in the navigation process. Here's an example:

<code-example path="observables-in-angular/src/main.ts" header="Router events" region="router"></code-example>

The [ActivatedRoute](api/router/ActivatedRoute "API reference") is an injected router service that makes use of observables to deliver information about a route path and parameters. For example, in the following code, `ActivatedRoute.url` contains an observable that reports the route path or paths.

<code-example path="observables-in-angular/src/main.ts" header="ActivatedRoute" region="activated_route"></code-example>

{@a forms}

## Handling observables from reactive forms

Reactive forms have properties that expose observables to monitor form control values. The [`FormControl`](api/forms/FormControl "API reference") properties `valueChanges` and `statusChanges` contain observables that emit change events. Subscribing to an observable form-control property is a way of triggering application logic within the component class. For example:

<code-example path="observables-in-angular/src/main.ts" header="Reactive forms" region="forms"></code-example>

{@a type-ahead}

## Using observables for type-ahead suggestions

Typically, to provide suggestions for completion of input strings, you need to do a series of separate tasks:

* Listen for data from an input.
* Trim whitespace from the input string and ensure it is of a minimum length.
* Debounce changes to the input value, so you can wait for a break in keystrokes rather than fire API requests for every keystroke.
* Don’t send a request if the value stays the same; for instance, if the user rapidly hits a character, then a backspace.
* Cancel outstanding AJAX requests if their results will be invalidated by a change in the input text.

Implementing this logic manually can be quite complex.
With observables, you can use a straightforward series of RxJS operators, as in the following example.

<code-example path="practical-observable-usage/src/typeahead.ts" header="Typeahead"></code-example>

{@a exp-backoff}

## Using observables for exponential backoff

Exponential backoff is a technique in which you retry an API request after failure, increasing the time in between retries after each consecutive failure, with a maximum number of retries before the request is considered to have failed.

This can be quite complex to implement with promises and other methods of tracking AJAX calls.
The following example shows how using observables can be more straightforward.

<code-example path="practical-observable-usage/src/backoff.ts" header="Exponential backoff"></code-example>


{@a event-handling}
## Transmitting data between components

Angular uses the `EventEmitter` class when publishing values from a component through the [`@Output()` decorator](guide/inputs-outputs#how-to-use-output "Example of using the decorator").
The `EventEmitter` class extends [RxJS `Subject`](https://rxjs.dev/api/index/class/Subject "RxJS reference"), adding an `emit()` method so it can send arbitrary values.
When you call `emit()`, it passes the emitted value to the `next()` method of any subscribed observer.

A good example of usage can be found in the [EventEmitter](api/core/EventEmitter "API reference") documentation. The following example component listens for open and close events:

`<zippy (open)="onOpen($event)" (close)="onClose($event)"></zippy>`

The following code defines the component:

<code-example path="observables-in-angular/src/main.ts" header="EventEmitter" region="eventemitter"></code-example>
