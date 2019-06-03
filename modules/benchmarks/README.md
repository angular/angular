# How to run the benchmarks locally

## Run in the browser (dev mode)

```bash
yarn bazel run modules/benchmarks/src/{benchmark_name}/{impl_name}:devserver

# e.g. tree benchmark implemented with Angular (view engine in dev mode):
yarn bazel run modules/benchmarks/src/tree/ng2:devserver

# e.g. tree benchmark implemented with Angular (ivy in dev mode):
yarn bazel run modules/benchmarks/src/tree/ng2:devserver --define=compile=aot
```

## Run in the browser (prod mode)

```bash
yarn bazel run modules/benchmarks/src/{benchmark_name}/{name}:prodserver

# e.g. tree benchmark implemented with Angular (view engine in prod mode):
yarn bazel run modules/benchmarks/src/tree/ng2:prodserver

# e.g. tree benchmark implemented with Angular (ivy in prod mode):
yarn bazel run modules/benchmarks/src/tree/ng2:prodserver --define=compile=aot
```

## Run benchpress

```bash
yarn bazel run modules/benchmarks/src/{benchmark_name}/{name}:perf

# e.g. tree benchmark implemented with Angular (view engine):
yarn bazel run modules/benchmarks/src/tree/ng2:perf

# e.g. tree benchmark implemented with Angular (ivy):
yarn bazel run modules/benchmarks/src/tree/ng2:perf --define=compile=aot
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
