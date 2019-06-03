# Integration tests for Angular

This directory contains end-to-end tests for Angular. Each directory is a self-contained application that exactly mimics how a user might expect Angular
to work, so they allow high-fidelity reproductions of real-world issues.

For this to work, we first build the Angular distribution just like we would
publish it to npm, then install the distribution into each app.

To test Angular CLI applications, we use the integration test `cli-hello-world`.
When a significant change is released in the CLI, the application should be updated with `ng update`:

```bash
$ cd integration/cli-hello-world
$ yarn install
$ yarn ng update @angular/cli @angular-devkit/build-angular
# yarn build
# yarn test
# typescript version
```

## Render3 tests

The directory `cli-hello-world-ivy-compat` contains a test for render3 used with the angular cli.

The `cli-hello-world-ivy-minimal` contains a minimal ivy app that is meant to mimic the bazel 
equivalent in `packages/core/test/bundling/hello_world`, and should be kept similar.

## Writing an integration test

The API for each test is:

- Each sub-directory here is an integration test
- Each test should have a `package.json` file
- The test runner will run `yarn` and `yarn test` on the package

This means that the test should be started by test script, like
```
"scripts": {"test": "runProgramA && assertResultIsGood"}
```

Note that the `package.json` file uses a special `file://../../dist` scheme
to reference the Angular packages, so that the locally-built Angular
is installed into the test app.

Also, beware of floating (non-locked) dependencies. If in doubt
you can install the package directly from `file:../../node_modules`.

## Running integration tests

```
$ ./integration/run_tests.sh
```

The test runner will first re-build any stale npm packages, then `cd` into each
subdirectory to execute the test.
