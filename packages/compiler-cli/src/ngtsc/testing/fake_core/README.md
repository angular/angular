`fake_core` is a library designed to expose some of the same symbols as `@angular/core`, without
requiring compilation of the whole of `@angular/core`. This enables unit tests for the compiler to
be written without incurring long rebuilds for every change.

* `@angular/core` is compiled with `@angular/compiler-cli`, and therefore has an implicit dependency
on it. Therefore core must be rebuilt if the compiler changes.
* Tests for the compiler which intend to build code that depends on `@angular/core` must have
a data dependency on `@angular/core`. Therefore core must be built to run the compiler tests, and
thus rebuilt if the compiler changes.

This rebuild cycle is expensive and slow. `fake_core` avoids this by exposing a subset of the
`@angular/core` API, which enables applications to be built by the ngtsc compiler without
needing a full version of core present at compile time.
