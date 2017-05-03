# Integration tests for Angular

This directory contains end-to-end tests for Angular. Each directory is a self-contained
application that exactly mimics how a user might expect Angular to work, so they allow
high-fidelity reproductions of real-world issues.

For this to work, we first build the Angular distribution just like we would publish
it to npm, then install the distribution into each app.

## Writing an integration test

The API for each test is:

- Each sub-directory here is an integration test
- Each test should have a `package.json` file
- The test runner will run `yarn` and `yarn test` on the package

This means that the test should be started by test script, like
```
'scripts' { 'test': 'runProgramA && assertResultIsGood' }
```

Note that the `package.json` file uses a special `file://../../dist` scheme
to reference the Angular packages, so that the locally-built Angular
is installed into the test app.

Also, beware of floating (non-shrinkwrapped) dependencies. If in doubt
you can install the package directly from `file:../../node_modules`. For example,
this is useful for protractor, which has a slow post-install step
(`webdriver-manager update`) that can be skipped when the package from
Angular's `node_modules` is installed.

## Running integration tests

You can iterate on the tests by keeping the dist folder up-to-date.
See the `package.json` of the test(s) you're debugging, to see which dist/ folders they install from.
Then run the right `tsc --watch` command to keep those dist folders up-to-date, for example:

```
$ ./node_modules/.bin/tsc -p packages/core/tsconfig-build.json --watch
```

Now you can run the integration test, it will re-install from the dist/ folder on each run.

```
$ ./integration/run_tests.sh
```
