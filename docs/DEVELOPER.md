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
./scripts/build-packages-dist.sh
```

* Results are put in the `dist/packages-dist` folder.

## Running Tests Locally

Bazel is used as the primary tool for building and testing Angular. Building and testing is
incremental with Bazel, and it's possible to only run tests for an individual package instead
of for all packages.

Read more about this in the [BAZEL.md](./BAZEL.md) document. You should execute all test suites
before submitting a PR to Github.

All the tests are executed on our Continuous Integration infrastructure and a PR could only be
merged if the code is formatted properly and all tests are passing.

## <a name="clang-format"></a> Formatting your source code

Angular uses [clang-format](http://clang.llvm.org/docs/ClangFormat.html) to format the source code.
If the source code is not properly formatted, the CI will fail and the PR can not be merged.

You can automatically format your code by running:
- `gulp format`: format all source code
- `gulp format:changed`: re-format only edited source code.

A better way is to set up your IDE to format the changed file on each file save.

### VS Code
1. Install [Clang-Format](https://marketplace.visualstudio.com/items?itemName=xaver.clang-format) extension for VS Code.
2. Open `settings.json` in your workspace and add these lines:
```json
  "files.autoSave": "onFocusChange",
  "editor.formatOnSave": true,
  "clang-format.executable": "PATH_TO_YOUR_WORKSPACE/angular/node_modules/.bin/clang-format",
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
publish the `*-builds` snapshots just like our CircleCI build does.

First time, you need to create the github repositories:

``` shell
$ export TOKEN=[get one from https://github.com/settings/tokens]
$ CREATE_REPOS=1 ./scripts/ci/publish-build-artifacts.sh [github username]
```

For subsequent snapshots, just run

``` shell
$ ./scripts/publish/publish-build-artifacts.sh [github username]
```

The script will publish the build snapshot to a branch with the same name as your current branch,
and create it if it doesn't exist.

## Bazel support
### VS Code

1. Install [Bazel](https://marketplace.visualstudio.com/items?itemName=DevonDCarew.bazel-code) extension for VS Code.
2. Open `settings.json` in your workspace and add these lines:
```json
  "files.associations": {
    "*.bazel": "bazel"
  },
```

## General IDE settings
### VS Code

1. Open `settings.json` in your workspace and add these lines:
```json
  "editor.tabSize": 2,
  "files.exclude": {
    "bazel-out": true,
    ".idea": true,
    ".circleci": true,
    ".github": true,
    "dist/**": true,
    "node_modules/**": true,
    ".rpt2_cache": true,
    ".vscode": true
  },
```
