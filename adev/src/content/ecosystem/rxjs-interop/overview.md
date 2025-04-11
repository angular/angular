# Using RxJS with Angular

## Introduction to RxJS

[RxJS](https://rxjs.dev/) is a reactive programming library that focuses on handling streams and event based programming.

RxJS provides an implementation of the [`Observable`](https://rxjs.dev/guide/observable) type, which is needed until the type becomes part of the language and until browsers support it. The library also provides utility functions for creating and working with observables. These utility functions can be used for:

- Converting existing code for async operations into observables
- Iterating through the values in a stream
- Mapping values to different types
- Filtering streams
- Composing multiple streams

More details are available on the official [RxJS documentation](https://rxjs.dev/).

## Interop between Angular and RxJS

Angular expose RxJS `Observable`s across a variety of APIs. 

The `@angular/core/rxjs-interop` package is intended to offer a set of API where Angular exposes core functionalities with `Observable`s.

More details are available in the following guides.

- [Signal interop guide](/ecosystem/rxjs-interop/signals-interop)
- [component output interop guide](/ecosystem/rxjs-interop/output-interop)

<!-- TODO: Add a RxJS good practices guide -->
<!-- TODO: Add a guide for rxResource -->
<!-- TODO: Add a mention somewhere about takeUntilDestroy -->
