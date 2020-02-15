# Tests

`@angular/labs` is a place to try new things. One thing which we are trying is to place the test code together with the production code. There are several advantages.
- Most IDEs do not know that `foo.ts` and `foo.spec.ts` are related and so it makes it hard to navigate between the two files. By placing the files next to each other the navigation becomes easier.
- It is easier to tell at a first glance if a particular code has tests and what kinds of tests (unit vs integration vs e2e)


## Naming Strategy

For any given file `path/file.ts` the following should be true.
- When building production code all `**/*.spec.ts` files are excluded from production. The spec files are further subdivided as:
  - `**/*.unit.spec.ts` (==> `yarn bazel packages/labs:unit` and `:unit_web`)
    - Unit tests have a strict bazel dependency only on the `packages/labs` package and as a result have a fast build time. 
  - `**/*.acceptance.spec.ts` (==> `yarn bazel packages/labs:acceptance` and `:acceptance_web`)
    - Acceptance tests have a broader dependency on other packages such as `package/compiler` and `package/platform-browser` for end to end tests. These tests are necessarily slower to build and execute. 


## Running test

- `yarn bazel test packages/labs/SUB_PKG:all` will execute all tests.
- `yarn bazel test packages/labs/SUB_PKG:unit` will execute all unit tests in node.
- `yarn bazel test packages/labs/SUB_PKG:unit_web` will execute all unit tests in browser.
- `yarn bazel test packages/labs/SUB_PKG:acceptance` will execute all acceptance tests in node.
- `yarn bazel test packages/labs/SUB_PKG:acceptance_web` will execute all acceptance tests in browser.

### Debugging

- In node: `yarn bazel test packages/labs/SUB_PKG:unit --config=debug` and than attach your debugger.
- In browser: `yarn bazel run packages/labs/SUB_PKG:unit_web` and than open your browser http://localhost:9876/debug.html to strat debugging.