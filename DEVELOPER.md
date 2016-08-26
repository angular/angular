# Building and Testing Angular 2 for JS

This document describes how to set up your development environment to build and test Angular 2 JS version. 
It also explains the basic mechanics of using `git`, `node`, and `npm`.

* [Prerequisite Software](#prerequisite-software)
* [Getting the Sources](#getting-the-sources)
* [Installing NPM Modules](#installing-npm-modules)
* [Building](#building)
* [Running Tests Locally](#running-tests-locally)

See the [contribution guidelines](https://github.com/angular/angular/blob/master/CONTRIBUTING.md)
if you'd like to contribute to Angular.

## Prerequisite Software

Before you can build and test Angular, you must install and configure the
following products on your development machine:

* [Git](http://git-scm.com) and/or the **GitHub app** (for [Mac](http://mac.github.com) or
  [Windows](http://windows.github.com)); [GitHub's Guide to Installing
  Git](https://help.github.com/articles/set-up-git) is a good source of information.

* [Node.js](http://nodejs.org), (version `>=5.4.1 <6`) which is used to run a development web server,
  run tests, and generate distributable files. We also use Node's Package Manager, `npm`
  (version `>=3.5.3 <4.0`), which comes with Node. Depending on your system, you can install Node either from
  source or as a pre-packaged bundle.

* [Java Development Kit](http://www.oracle.com/technetwork/es/java/javase/downloads/index.html) which is used
  to run Bazel and execute the selenium standalone server for e2e testing. JDK version 8 is required.

* [Bazel](https://bazel.io) is used to build and test Angular packages.

## Getting the Sources

Fork and clone the Angular repository:

1. Login to your GitHub account or create one by following the instructions given
   [here](https://github.com/signup/free).
2. [Fork](http://help.github.com/forking) the [main Angular
   repository](https://github.com/angular/angular).
3. Clone your fork of the Angular repository and define an `upstream` remote pointing back to
   the Angular repository that you forked in the first place.

```shell
# Clone your GitHub repository:
git clone git@github.com:<github username>/angular.git

# Go to the Angular directory:
cd angular

# Add the main Angular repository as an upstream remote to your repository:
git remote add upstream https://github.com/angular/angular.git
```
## Installing NPM Modules

Next, install the JavaScript modules needed to build and test Angular:

```shell
# Install Angular project dependencies (package.json)
npm install
```

## Windows only

In order to create the right symlinks, run **as administrator**:
```shell
./scripts/windows/create-symlinks.sh
```

Before submitting a PR, do not forget to remove them:
```shell
 ./scripts/windows/remove-symlinks.sh
 ```

## Building

To build Angular run:

```shell
bazel build :all_packages
```

To build individual modules, use `:<package_name>_package`, e.g.
`:core_package`.

* The npm build artifacts are put in the bazel-bin/ folder as tarballs.

## Running Tests Locally

To run tests:

```shell
$ bazel test :jasmine_tests                  # Run all angular tests on node

$ bazel test :karma_test                     # Run all angular tests except router in browser
$ bazel test :router_karma_test              # Run angular router tests in browser


# If you are on Linux, you will need to add `--test_env=DISPLAY` at the end of the Bazel command so that
# Chrome will be able to launch successfully. For example:
$ bazel test :karma_test --test_env=DISPLAY

# Alternatively, use `bazel run` instead:
$ bazel run :karma_test
```

You should execute the 2 test suites before submitting a PR to github.
All the tests are executed on our Continuous Integration infrastructure and a PR could only be merged once the tests pass.

- CircleCI fails if your code is not formatted properly,
- Travis CI fails if any of the test suite describe above fails.

## Update the public API tests

If you happen to modify the public API of Angular, API golden files must be updated using:

``` shell
$ bazel run :public_api
```

Note: The command `bazel test :public_api_test` fails when the API doesn't match the golden files.

## Formatting your source code

Angular uses [clang-format](http://clang.llvm.org/docs/ClangFormat.html) to format the source code. If the source code
is not properly formatted, the CI will fail and the PR can not be merged.

You can automatically format your code by running:

``` shell
$ gulp format
```

## Incremental development

To watch files and automatically rebuild, use `./ibazel` instead of the `bazel` command. For example:

``` shell
$ ./ibazel build :core                      # Automatically recompiles core in ES5

$ ./ibazel build :jasmine_tests             # Automatically reruns all tests on node
```

To debug tests:

``` shell
$ ./bazel-run.sh run :core_test --node_options=debug
                                            # Runs the core test suite in `node debug`
$ ./ibazel run :karma_test_local            # Runs karma in watch mode
$ ./ibazel run :router_karma_test_local

$ ./ibazel run :playground_test -- --serve-only
                                            # Runs the development server for e2e tests
```

* `./bazel-run.sh` is a variant of `bazel run` that connects stdin, and can be used for running
  node in debug mode.

See [Bazel README](https://github.com/angular/angular/blob/master/build_defs/README.md) for inner workings
of the build system.
