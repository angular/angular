# Angular Compatibility Compiler (ngcc)

This compiler will convert `node_modules` compiled with `ngc`, into `node_modules` which
appear to have been compiled with `ngtsc`.

This conversion will allow such "legacy" packages to be used by the Ivy rendering engine.

## Building

The project is built using Bazel:

```bash
bazel build //packages/compiler-cli/src/ngcc
```

## Unit Testing

The unit tests are built and run using Bazel:

```bash
bazel test //packages/compiler-cli/src/ngcc/test
```

## Integration Testing

There are tests that check the behaviour of the overall executable:

```bash
bazel test //packages/compiler-cli/test/ngcc
```
