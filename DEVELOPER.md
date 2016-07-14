# Building and Testing Angular 2 for JS and Dart

This document describes how to set up your development environment to build and test Angular, both
JS and Dart versions. It also explains the basic mechanics of using `git`, `node`, and `npm`.

* [Prerequisite Software](#prerequisite-software)
* [Getting the Sources](#getting-the-sources)
* [Environment Variable Setup](#environment-variable-setup)
* [Installing NPM Modules and Dart Packages](#installing-npm-modules-and-dart-packages)
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

* *Optional*: [Dart](https://www.dartlang.org) (version `>=1.13.2 <2.0.0`), specifically the Dart SDK and
  Dartium (a version of [Chromium](http://www.chromium.org) with native support for Dart through
  the Dart VM). Visit Dart's [Downloads page](https://www.dartlang.org/downloads) page for
  instructions. You can also download both **stable** and **dev** channel versions from the
  [download archive](https://www.dartlang.org/downloads/archive/). In that case, on Windows, Dart
  must be added to the `PATH` (e.g. `path-to-dart-sdk-folder\bin`) and a new `DARTIUM_BIN`
  environment variable must be created, pointing to the executable (e.g.
  `path-to-dartium-folder\chrome.exe`).

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

## Environment Variable Setup

Define the environment variables listed below. These are mainly needed for the testing. The
notation shown here is for [`bash`](http://www.gnu.org/software/bash); adapt as appropriate for
your favorite shell.

Examples given below of possible values for initializing the environment variables assume **Mac OS
X** and that you have installed the Dart Editor in the directory named by
`DART_EDITOR_DIR=/Applications/dart`. This is only for illustrative purposes.

```shell
# DARTIUM_BIN: path to a Dartium browser executable; used by Karma to run Dart tests
export DARTIUM_BIN="$DART_EDITOR_DIR/chromium/Chromium.app/Contents/MacOS/Chromium"
```

Add the Dart SDK `bin` directory to your path and/or define `DART_SDK` (this is also detailed
[here](https://www.dartlang.org/tools/pub/installing.html)):

```shell
# DART_SDK: path to a Dart SDK directory
export DART_SDK="$DART_EDITOR_DIR/dart-sdk"

# Update PATH to include the Dart SDK bin directory
PATH+=":$DART_SDK/bin"
```

And specify where the pub’s dependencies are downloaded. By default, this directory is located under .pub_cache
in your home directory (on Mac and Linux), or in AppData\Roaming\Pub\Cache (on Windows).

```shell
# PUB_CACHE: location of pub dependencies
export PUB_CACHE="/Users/<user>/.pub-cache"
```

## Installing NPM Modules and Dart Packages

Next, install the JavaScript modules and Dart packages needed to build and test Angular:

```shell
# Install Angular project dependencies (package.json)
npm install
```

**Optional**: In this document, we make use of project local `npm` package scripts and binaries
(stored under `./node_modules/.bin`) by prefixing these command invocations with `$(npm bin)`; in
particular `gulp` and `protractor` commands. If you prefer, you can drop this path prefix by either:

*Option 1*: globally installing these two packages as follows:

* `npm install -g gulp` (you might need to prefix this command with `sudo`)
* `npm install -g protractor` (you might need to prefix this command with `sudo`)

Since global installs can become stale, and required versions can vary by project, we avoid their
use in these instructions.

*Option 2*: defining a bash alias like `alias nbin='PATH=$(npm bin):$PATH'` as detailed in this
[Stackoverflow answer](http://stackoverflow.com/questions/9679932/how-to-use-package-installed-locally-in-node-modules/15157360#15157360) and used like this: e.g., `nbin gulp build`.

## Building

To build Angular run:

```shell
./build.sh
```

* Results are put in the dist folder.

## Running Tests Locally

To run tests:

```shell
$ ./test.sh node

$ ./test.sh browser

$ ./test.sh tools
```

You should execute the 3 test suites before submitting a PR to github.

All the tests are executed on our Continuous Integration infrastructure and a PR could only be merged once the tests pass.

- CircleCI fails if your code is not formatted properly,
- Travis CI fails if any of the test suite describe above fails.

## Update the public API tests

If you happen to modify the public API of Angular, API golden files must be updated using:

``` shell
$ gulp public-api:update
```

Note: The command `./test.sh tools` fails when the API doesn't match the golden files.

## Formatting your source code

Angular uses [clang-format](http://clang.llvm.org/docs/ClangFormat.html) to format the source code. If the source code
is not properly formatted, the CI will fail and the PR can not be merged.

You can automatically format your code by running:

``` shell
$ gulp format
```


