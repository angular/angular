# Typescript API Guardian

Keeps track of public API surface of a typescript library.

# For developers

Build and test this library:

```sh
$ bazel run //:install
$ bazel test //tools/ts-api-guardian:all
```

Publish to NPM:

```sh
$ npm whoami # should be logged in as angular
$ grep version tools/ts-api-guardian/package.json # advance as needed
$ bazel run //tools/ts-api-guardian:ts-api-guardian.publish
```
