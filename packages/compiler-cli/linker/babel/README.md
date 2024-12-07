# Angular linker - Babel plugin

This package contains a Babel plugin that can be used to find and link partially compiled declarations in library source code.
See the [linker package README](../README.md) for more information.

## Unit Testing

The unit tests are built and run using Bazel:

```bash
yarn bazel test //packages/compiler-cli/linker/babel/test
```
