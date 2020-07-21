# The RxJS library

 The  [RxJS](https://rxjs.dev/guide/overview "RxJS documentation") library, which provides the basic `Observable` type, also provides utility functions for creating and working with observables.
 You can import these from the `rxjs` library in your Angular application, and use them to accomplish the following tasks:

* Convert existing code for async operations into observables
* Iterate through the values in a stream
* Map values to different types
* Filter streams
* Compose multiple streams

## Observable creation functions

RxJS offers a number of functions that can be used to create new observables. These functions can simplify the process of creating observables from things such as events, timers, promises, and so on. For example:


<code-example path="rx-library/src/simple-creation.ts" region="promise" header="Create an observable from a promise"></code-example>

<code-example path="rx-library/src/simple-creation.ts" region="interval" header="Create an observable from a counter"></code-example>

<code-example path="rx-library/src/simple-creation.ts" region="event" header="Create an observable from an event"></code-example>

<code-example path="rx-library/src/simple-creation.ts" region="ajax" header="Create an observable that creates an AJAX request"></code-example>

## Operators

Operators are functions that build on the observables foundation to enable sophisticated manipulation of collections. For example, RxJS defines operators such as `map()`, `filter()`, `concat()`, and `flatMap()`.

Operators take configuration options, and they return a function that takes a source observable. When executing this returned function, the operator observes the source observable’s emitted values, transforms them, and returns a new observable of those transformed values. Here is a basic example:

<code-example path="rx-library/src/operators.ts" header="Map operator"></code-example>

You can use _pipes_ to link operators together. Pipes let you combine multiple functions into a single function. The `pipe()` function takes as its arguments the functions you want to combine, and returns a new function that, when executed, runs the composed functions in sequence.

<div class="alert is-helpful">

  Note that, for Angular apps, combining operators with pipes is preferred to _chaining_, which is used in many RxJS examples.

</div>

A set of operators applied to an observable is a recipe&mdash;that is, a set of instructions for producing the values you’re interested in. By itself, the recipe doesn’t do anything. You need to call `subscribe()` to produce a result through the recipe.

Here’s an example:

<code-example path="rx-library/src/operators.1.ts" header="Standalone pipe function"></code-example>

The `pipe()` function is also a method on the RxJS `Observable`, so you can use this shorter form to define the same operation:

<code-example path="rx-library/src/operators.2.ts" header="Observable.pipe function"></code-example>

### Common operators

RxJS provides many operators, but only a handful are used frequently. For a full list of operators and usage samples, visit the [RxJS API documentation](https://rxjs.dev/api).


| Area | Operators |
| :------------| :----------|
| Creation |  `from`,`fromEvent`, `of` |
| Combination | `combineLatest`, `concat`, `merge`, `startWith` , `withLatestFrom`, `zip` |
| Filtering | `debounceTime`, `distinctUntilChanged`, `filter`, `take`, `takeUntil` |
| Transformation | `bufferTime`, `concatMap`, `map`, `mergeMap`, `scan`, `switchMap` |
| Utility | `tap` |
| Multicasting | `share` |


## Naming conventions for observables

Because Angular applications are mostly written in TypeScript, you will typically know when a variable is an observable. Although the Angular framework does not enforce a naming convention for observables, you will often see observables named with a trailing “$” sign.

This can be useful when scanning through code and looking for observable values. Also, if you want a property to store the most recent value from an observable, it can be convenient to simply use the same name with or without the “$”.

For example:

<code-example path="rx-library/src/naming-convention.ts" header="Naming observables"></code-example>
