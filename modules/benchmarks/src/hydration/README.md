# Hydration benchmark

This folder contains hydration benchmark that tests the process of matching DOM nodes at runtime.

There are 2 folders in this benchmark:

* `baseline` - renders a component without hydration, we use it as a baseline
* `main` - the same code as the `baseline`, but Angular uses hydration and matches existing DOM nodes instead of creating new ones

The benchmarks are based on `largetable` benchmarks.
