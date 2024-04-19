## How to serve the examples

All playground examples are built and served with Bazel. Below is an example that
demonstrates how a specific example can be built and served with Bazel:

```bash
# e.g. src/zippy_component
yarn bazel run modules/playground/src/zippy_component:devserver

# e.g. src/upgrade
yarn bazel run modules/playground/src/upgrade:devserver
```