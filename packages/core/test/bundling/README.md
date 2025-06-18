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

You can inspect the build output of each project by building the `:bundles` target.

```bash
yarn bazel build //packages/core/test/bundling/standalone_bootstrap:bundles
```

This output is always unmangled and can be easily used for debugging. Alternatively, you
can also serve the output by running:

```bash
yarn bazel run //packages/core/test/bundling/standalone_bootstrap:bundles.serve
```

If needed, you can also control the Angular CLI optimizations via environment variables that
you can set via the `env` attribute in `BUILD.bazel` of each test.
