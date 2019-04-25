# Typescript API Guardian

Keeps track of public API surface of a typescript library.

Examples:

```sh
# Generate one declaration file
ts-api-guardian --out api_guard.d.ts index.d.ts
# Generate multiple declaration files
# (output location like typescript)
ts-api-guardian --outDir api_guard [--rootDir .] core/index.d.ts core/testing.d.ts
# Print usage
ts-api-guardian --help
# Check against one declaration file
ts-api-guardian --verify api_guard.d.ts index.d.ts
# Check against multiple declaration files
ts-api-guardian --verifyDir api_guard [--rootDir .] core/index.d.ts core/testing.d.ts
```

# For developers

Build and test this library:

```sh
$ yarn bazel run //:install
$ yarn bazel test //tools/ts-api-guardian:all
```

Publish to NPM:

```sh
$ yarn bazel run @nodejs//:npm whoami # should be logged in as angular
$ grep version tools/ts-api-guardian/package.json # advance as needed
$ yarn bazel run //tools/ts-api-guardian:ts-api-guardian.publish
```
