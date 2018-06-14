# Building and Testing Angular

This document describes how to set up your development environment to build and test Angular.
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

* [Node.js](http://nodejs.org), (version specified in the engines field of [`package.json`](../package.json)) which is used to run a development web server,
  run tests, and generate distributable files.

* [Yarn](https://yarnpkg.com) (version specified in the engines field of [`package.json`](../package.json)) which is used to install dependencies.

* [Java Development Kit](http://www.oracle.com/technetwork/es/java/javase/downloads/index.html) which is used
  to execute the selenium standalone server for e2e testing.

* (Optional for now) [Bazel](https://bazel.build/), please follow instructions in [BAZEL.md](https://github.com/angular/angular/blob/master/docs/BAZEL.md)

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
yarn install
```

**Optional**: In this document, we make use of installed npm package scripts and binaries
(stored under `./node_modules/.bin`) by prefixing these command invocations with `$(yarn bin)`; in
particular `gulp` and `protractor` commands.



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
./build.sh
```

* Results are put in the dist folder.

## Running Tests Locally

To run tests:

```shell
$ ./test.sh node             # Run all angular tests on node

$ ./test.sh browser          # Run all angular tests in browser

$ ./test.sh browserNoRouter  # Optionally run all angular tests without router in browser

$ ./test.sh router           # Optionally run only the router tests in browser
```

You should execute the 3 test suites before submitting a PR to github.

See [DEBUG.md](DEBUG.md) for information on debugging the code while running the unit tests.

All the tests are executed on our Continuous Integration infrastructure and a PR could only be merged once the tests pass.

- CircleCI fails if your code is not formatted properly,
- Travis CI fails if any of the test suites described above fails.

## <a name="clang-format"></a> Formatting your source code

Angular uses [clang-format](http://clang.llvm.org/docs/ClangFormat.html) to format the source code. If the source code
is not properly formatted, the CI will fail and the PR can not be merged.

You can automatically format your code by running:

``` shell
$ gulp format
```

There is a handy [clang-format extension](https://marketplace.visualstudio.com/items?itemName=xaver.clang-format)
for Visual Studio Code. Use the following settings to format your code when you save a file:

```json
{
    "editor.formatOnSave": true,
    "clang-format.executable": "${workspaceRoot}/node_modules/.bin/clang-format"
}
```

## Linting/verifying your source code

You can check that your code is properly formatted and adheres to coding style by running:

``` shell
$ gulp lint
```

## Publishing snapshot builds

When a build of any branch on the upstream fork angular/angular is green on CircleCI,
it automatically publishes build artifacts
to repositories in the Angular org, eg. the `@angular/core` package is published to
http://github.com/angular/core-builds.

You may find that your un-merged change needs some validation from external participants.
Rather than requiring them to pull your Pull Request and build Angular locally, you can
publish the `*-builds` snapshots just like our Travis build does.

First time, you need to create the github repositories:

``` shell
$ export TOKEN=[get one from https://github.com/settings/tokens]
$ CREATE_REPOS=1 TRAVIS= ./scripts/ci/publish-build-artifacts.sh [github username]
```

For subsequent snapshots, just run

``` shell
$ ./scripts/publish/publish-build-artifacts.sh [github username]
```

The script will publish the build snapshot to a branch with the same name as your current branch,
and create it if it doesn't exist.
