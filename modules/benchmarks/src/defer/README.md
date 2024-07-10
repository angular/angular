# Defer benchmark

This folder contains defer benchmark that tests the process of `@defer` block creation.

There are 2 folders in this benchmark:

* `baseline` - renders a component using an `@if` condition, we use it as a baseline
* `main` - the same code as the `baseline`, but instead of the `@if`, we use `@defer` to compare defer blocks against conditionals

The benchmarks are based on `largetable` benchmarks.
