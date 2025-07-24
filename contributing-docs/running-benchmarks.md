## Benchmarks

- Benchmarks code can be found in: `/modules/benchmarks/src`.
- Benchmarks convenience script code in `/scripts/benchmarks`.
- Benchpress (the sample runner) in `/packages/benchpress`.

### Running benchmark

```
yarn benchmarks run
```

### Running a comparison with local changes

```
yarn benchmarks run-compare main
yarn benchmarks run-compare <compare-sha> [bazel-target]
```

If no benchmark target is specified, a prompt will allow you to select an available benchmark.

### Running a comparison in a PR

You can start a comparison by adding a comment as follows to any PR:

```
/benchmark-compare main //modules/benchmarks/src/expanding_rows:perf_chromium
```

```
/benchmark-compare <other-sha> //modules/benchmarks/src/expanding_rows:perf_chromium
```

**Note**: An explicit benchmark target must be provided. You can use the prompt
of `yarn benchmarks run` to discover available benchmarks.
