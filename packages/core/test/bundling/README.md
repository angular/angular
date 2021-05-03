# Bundle

## `js_expected_symbol_test`
This folder contains tests which assert that most of the code is tree shaken away.
This is asserted by keeping gold files of all symbols which are expected to be retained.
When doing renaming it is often necessary to update the gold files, to do so use these commands:

```
yarn bazel run --config=ivy //packages/core/test/bundling/injection:symbol_test.accept
yarn bazel run --config=ivy //packages/core/test/bundling/cyclic_import:symbol_test.accept
yarn bazel run --config=ivy //packages/core/test/bundling/forms:symbol_test.accept
yarn bazel run --config=ivy //packages/core/test/bundling/hello_world:symbol_test.accept
yarn bazel run --config=ivy //packages/core/test/bundling/router:symbol_test.accept
yarn bazel run --config=ivy //packages/core/test/bundling/todo:symbol_test.accept
```

## Running all symbol tests
To run all symbol tests with one command, you can use the following scripts:

```
yarn run symbol-extractor:check
yarn run symbol-extractor:update
```
