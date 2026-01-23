# Benchmark Directory Layout

## Bazel

Under bazel the rules for laying out test files are slightly different. Use `largetable/render3` as an example.

Put the perf file in current subdirectory (ie `largetable`) such that the same perf file can be used for each of the sub-subdirectories. (ie `largetable/*` should all be testable with the same perf file `largetable/largetable_perf.spec.ts`). Under bazel, typescript protractor spec files must end with `.spec.ts` or `.test.ts`.
