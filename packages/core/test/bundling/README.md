# Bundle

## `js_expected_symbol_test`
This folder contains tests which assert that most of the code is tree shaken away.
This is asserted by keeping gold files of all symbols which are expected to be retained.
When doing renaming it is often necessary to update the gold files; to do so use these scripts:

```
yarn run symbol-extractor:check
yarn run symbol-extractor:update
```

## Debugging 

You can inspect the build output of each project by using the `bundle.debug` target. 

```
yarn bazel build  //packages/core/test/bundling/standalone_bootstrap:bundle.debug
```

This target mostly tree shakes while keeping the symbols. To have a look at the minimal output (with inlining etc.) use the 
`bundle.debug.min` target.

```
yarn bazel build  //packages/core/test/bundling/standalone_bootstrap:bundle.debug.min
```
