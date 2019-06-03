# How to run the benchmarks locally

## Run in the browser

```bash
yarn bazel run modules/benchmarks/src/tree/{name}:devserver

# e.g. "ng2" tree benchmark:
yarn bazel run modules/benchmarks/src/tree/ng2:devserver
```

## Run e2e tests

```
# Run e2e tests of individual applications:
yarn bazel test modules/benchmarks/src/tree/ng2/...

# Run all e2e tests:
yarn bazel test modules/benchmarks/...
```

## Use of *_aot.ts files

The `*_aot.ts` files are used as entry-points within Google to run the benchmark
tests. These are still built as part of the corresponding `ng_module` rule.
