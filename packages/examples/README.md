# API Examples

This folder contains small example apps that get in-lined into our API docs.
Each example contains tests for application behavior (as opposed to testing Angular's
behavior) just like an Angular application developer would write.

# Running the examples

```
# Serving individual examples (e.g. common)
pnpm bazel run //packages/examples/common:devserver

# "core" examples
pnpm bazel run //packages/examples/core:devserver
```

# Running the tests

```
pnpm bazel test //packages/examples/...
```