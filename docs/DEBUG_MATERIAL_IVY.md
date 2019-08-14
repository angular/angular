# Debugging the Material unit tests job

Currently all changes to Ivy are validated against the test suite of the
`angular/components` repository. In order to debug the `material-unit-tests` CI
job, the following steps can be used:

1\) Build the Ivy package output by running `./scripts/build-ivy-npm-packages.sh` in
the `angular/angular` repo.

2\) Clone the `angular/components` repository if not done yet ([quick link to repo](https://github.com/angular/components)).

3\) Set up the package output in the `components` repository by running the following
command in the `angular/angular` repo:

```bash
node ./scripts/ci/update-deps-to-dist-packages.js {COMPONENTS_REPO}/package.json ./dist/packages-dist-ivy-aot
```

4\) Switch into the `components` repository and run the tests by using the
following command:

```bash
yarn test --deleted_packages=//src/dev-app --define=compile=aot
```

### Running tests for individual entry-points

The `yarn test` script from the `components` repository runs all tests in the project.
This is sometimes not desired because it involves building and testing of all packages
and entry-points. Running tests for an individual entry-point is possible by explicitly
selecting a given test target.

Here is an example of commands that run individual test targets. Note that it is
**important** to specify the `--define=compile=aot` flag in order to run tests with Ivy.
  
```bash
yarn bazel test --define=compile=aot src/material/slider:unit_tests
yarn bazel test --define=compile=aot src/cdk/a11y:unit_tests
yarn bazel test --define=compile=aot src/material/toolbar:unit_tests
``` 