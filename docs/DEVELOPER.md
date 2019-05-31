# Building and Testing Angular

This document describes how to set up your development environment to build and test Angular.
It also explains the basic mechanics of using `git`, `node`, and `yarn`.

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

## Building

To build Angular run:

```shell
./scripts/build-packages-dist.sh
```

* Results are put in the `dist/packages-dist` folder.

## Running Tests Locally

Bazel is used as the primary tool for building and testing Angular. Building and testing is
incremental with Bazel, and it's possible to only run tests for an individual package instead
of for all packages. Read more about this in the [BAZEL.md](./BAZEL.md) document. 

You should execute all test suites before submitting a PR to GitHub:
- `yarn bazel test packages/...`

**Note**: The first test run will be much slower than future runs. This is because future runs will
benefit from Bazel's capability to do incremental builds. 

All the tests are executed on our Continuous Integration infrastructure. PRs can only be
merged if the code is formatted properly and all tests are passing.

## <a name="clang-format"></a> Formatting your source code

Angular uses [clang-format](http://clang.llvm.org/docs/ClangFormat.html) to format the source code.
If the source code is not properly formatted, the CI will fail and the PR cannot be merged.

You can automatically format your code by running:
- `yarn gulp format`: re-format only edited source code.
- `yarn gulp format:all`: format _all_ source code

A better way is to set up your IDE to format the changed file on each file save.

### VS Code
1. Install [Clang-Format](https://marketplace.visualstudio.com/items?itemName=xaver.clang-format) extension for VS Code.

It will automatically pick up the settings from Angular's [settings.json](../.vscode/settings.json).

### WebStorm / IntelliJ
1. Install the [ClangFormatIJ](https://plugins.jetbrains.com/plugin/8396-clangformatij) plugin
1. Open `Preferences->Tools->clang-format`
1. Find the field named "PATH"
1. Add `<PATH_TO_YOUR_WORKSPACE>/angular/node_modules/clang-format/bin/<OS>/`
  where the OS options are: `darwin_x64`, `linux_x64`, and `win32`.

## Linting/verifying your source code

You can check that your code is properly formatted and adheres to coding style by running:

``` shell
$ yarn gulp lint
```

## Publishing snapshot builds

When a build of any branch on the upstream fork angular/angular is green on CircleCI,
it automatically publishes build artifacts
to repositories in the Angular org, eg. the `@angular/core` package is published to
http://github.com/angular/core-builds.

You may find that your un-merged change needs some validation from external participants.
Rather than requiring them to pull your Pull Request and build Angular locally, you can
publish the `*-builds` snapshots just like our CircleCI build does.

First time, you need to create the GitHub repositories:

``` shell
$ export TOKEN=[get one from https://github.com/settings/tokens]
$ CREATE_REPOS=1 ./scripts/ci/publish-build-artifacts.sh [GitHub username]
```

For subsequent snapshots, just run

``` shell
$ ./scripts/ci/publish-build-artifacts.sh [GitHub username]
```

The script will publish the build snapshot to a branch with the same name as your current branch,
and create it if it doesn't exist.

## Bazel support
### VS Code

1. Install [Bazel](https://marketplace.visualstudio.com/items?itemName=DevonDCarew.bazel-code) extension for VS Code.

### WebStorm / IntelliJ
1. Install the [Bazel](https://plugins.jetbrains.com/plugin/8609-bazel) plugin
1. You can find the settings under `Preferences->Other Settings->Bazel Settings`

It will automatically recognize `*.bazel` and `*.bzl` files.
