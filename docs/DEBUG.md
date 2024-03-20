# Debugging Angular

The Angular project has comprehensive unit tests for the core packages and the tools.
The core packages are tested both in the browser (via Karma) and on the server (via Node.js).

## Debugging in Karma

It is useful to focus your debugging on one test at a time by changing that test to be
defined using the `fit(...)` function, rather than `it(...)`. Moreover, it can be helpful
to place a `debugger` statement in this `fit` clause to cause the debugger to stop when
it hits this test.

Read more about starting the debugger for Karma with Bazel in the [BAZEL.md](./BAZEL.md)
document.

## Debugging in Node

It is useful to focus your debugging on one test at a time by changing that test to be
defined using the `fit(...)` function, rather than `it(...)`. Moreover, it can be helpful
to place a `debugger` statement in this `fit` clause to cause the debugger to stop when
it hits this test.

Read more about starting the debugger for NodeJS tests with Bazel in the [BAZEL.md](./BAZEL.md)
document.