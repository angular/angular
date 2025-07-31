# Angular Linker

This package contains a `FileLinker` and supporting code to be able to "link" partial declarations of components, directives, etc in libraries to produce the full definitions.

The partial declaration format allows library packages to be published to npm without exposing the underlying Ivy instructions.

The tooling here allows application build tools (e.g. CLI) to produce fully compiled components, directives, etc at the point when the application is bundled.
These linked files can be cached outside `node_modules` so it does not suffer from problems of mutating packages in `node_modules`.

Generally this tooling will be wrapped in a transpiler specific plugin, such as the provided [Babel plugin](./babel).

## Unit Testing

The unit tests are built and run using Bazel:

```bash
pnpm bazel test //packages/compiler-cli/linker/test
```
