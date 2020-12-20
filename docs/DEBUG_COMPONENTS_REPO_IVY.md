# Debugging the `components-repo-unit-tests` job

Currently all changes to Ivy are validated against the test suite of the
`angular/components` repository. In order to debug the `components-repo-unit-tests` CI
job, the following steps can be used:

1\) Build the Ivy package output by running `node ./scripts/build/build-packages-dist.js` in
the `angular/angular` repo.

2\) Clone the `angular/components` repository if not done yet ([quick link to repo](https://github.com/angular/components)).

3\) Set up the package output in the `angular/components` repository by running the following
command in the `angular/angular` repo:

```bash
node ./scripts/ci/update-deps-to-dist-packages.js {COMPONENTS_REPO}/package.json ./dist/packages-dist
```

4\) Switch into the `angular/components` repository and run the tests by using the
following command:

```bash
yarn test --deleted_packages=//src/dev-app --config=ivy
```

### Running tests for individual entry-points

The `yarn test` script from the `components` repository runs all tests in the project.
This is sometimes not desired because it involves building and testing of all packages
and entry-points. Running tests for an individual entry-point is possible by explicitly
selecting a given test target.

Here is an example of commands that run individual test targets. Note that it is
**important** to specify the `--config=ivy` flag in order to run tests with Ivy.

```bash
yarn bazel test --config=ivy src/material/slider:unit_tests
yarn bazel test --config=ivy src/cdk/a11y:unit_tests
yarn bazel test --config=ivy src/material/toolbar:unit_tests
```
