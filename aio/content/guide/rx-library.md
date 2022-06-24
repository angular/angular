# The RxJS library

Reactive programming is an asynchronous programming paradigm concerned with data streams and the propagation of change \([Wikipedia](https://en.wikipedia.org/wiki/Reactive_programming)\).
RxJS \(Reactive Extensions for JavaScript\) is a library for reactive programming using observables that makes it easier to compose asynchronous or callback-based code.
See \([RxJS Docs](https://rxjs.dev/guide/overview)\).

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

## Operators

Operators are functions that build on the observables foundation to enable sophisticated manipulation of collections.
For example, RxJS defines operators such as `map()`, `filter()`, `concat()`, and `flatMap()`.

Operators take configuration options, and they return a function that takes a source observable.
When executing this returned function, the operator observes the source observable's emitted values, transforms them, and returns a new observable of those transformed values.
Here is a simple example:

<code-example header="Map operator" path="rx-library/src/operators.ts"></code-example>

You can use *pipes* to link operators together.
Pipes let you combine multiple functions into a single function.
The `pipe()` function takes as its arguments the functions you want to combine, and returns a new function that, when executed, runs the composed functions in sequence.

A set of operators applied to an observable is a recipe &mdash;that is, a set of instructions for producing the values you're interested in.
By itself, the recipe doesn't do anything.
You need to call `subscribe()` to produce a result through the recipe.

Here's an example:

<code-example header="Standalone pipe function" path="rx-library/src/operators.1.ts"></code-example>

The `pipe()` function is also a method on the RxJS `Observable`, so you use this shorter form to define the same operation:

<code-example header="Observable.pipe function" path="rx-library/src/operators.2.ts"></code-example>

### Common operators

RxJS provides many operators, but only a handful are used frequently.
For a list of operators and usage samples, visit the [RxJS API Documentation](https://rxjs.dev/api).

<div class="alert is-helpful">

**NOTE**: <br />
For Angular applications, we prefer combining operators with pipes, rather than chaining.
Chaining is used in many RxJS examples.

</div>

| Area           | Operators                                                                 |
|:---            |:---                                                                       |
| Creation       |  `from`, `fromEvent`, `of`                                                |
| Combination    | `combineLatest`, `concat`, `merge`, `startWith` , `withLatestFrom`, `zip` |
| Filtering      | `debounceTime`, `distinctUntilChanged`, `filter`, `take`, `takeUntil`     |
| Transformation | `bufferTime`, `concatMap`, `map`, `mergeMap`, `scan`, `switchMap`         |
| Utility        | `tap`                                                                     |
| Multicasting   | `share`                                                                   |

## Error handling

In addition to the `error()` handler that you provide on subscription, RxJS provides the `catchError` operator that lets you handle known errors in the observable recipe.

For instance, suppose you have an observable that makes an API request and maps to the response from the server.
If the server returns an error or the value doesn't exist, an error is produced.
If you catch this error and supply a default value, your stream continues to process values rather than erroring out.

Here's an example of using the `catchError` operator to do this:

<code-example header="catchError operator" path="rx-library/src/error-handling.ts"></code-example>

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

## Naming conventions for observables

Because Angular applications are mostly written in TypeScript, you will typically know when a variable is an observable.
Although the Angular framework does not enforce a naming convention for observables, you will often see observables named with a trailing "&dollar;" sign.

This can be useful when scanning through code and looking for observable values.
Also, if you want a property to store the most recent value from an observable, it can be convenient to use the same name with or without the "&dollar;".

For example:

<code-example header="Naming observables" path="rx-library/src/naming-convention.ts"></code-example>

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-02-28
