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

* [Node.js](http://nodejs.org), (version `>=5.4.1 <6`) which is used to run a development web server,
  run tests, and generate distributable files. We also use Node's Package Manager, `npm`
  (version `>=3.5.3 <4.0`), which comes with Node. Depending on your system, you can install Node either from
  source or as a pre-packaged bundle.

* [Java Development Kit](http://www.oracle.com/technetwork/es/java/javase/downloads/index.html) which is used
  to execute the selenium standalone server for e2e testing.
  
* [Bower] (https://bower.io/#install-bower) which is used to install additional dependencies

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

## Installing Bower Modules

Now run `bower` to install additional dependencies:

```shell
# Install other Angular project dependencies (bower.json)
bower install
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
./build.sh
```

* Results are put in the dist folder.

## Running Tests Locally

To run tests:

```shell
$ ./test.sh node             # Run all angular tests on node

$ ./test.sh browser          # Run all angular tests in browser
$ ./test.sh browserNoRouter  # Optionally run all angular tests without router in browser

$ ./test.sh tools            # Run angular tooling (not framework) tests
```

You should execute the 3 test suites before submitting a PR to github.

All the tests are executed on our Continuous Integration infrastructure and a PR could only be merged once the tests pass.

- CircleCI fails if your code is not formatted properly,
- Travis CI fails if any of the test suites described above fails.

## Update the public API tests

If you happen to modify the public API of Angular, API golden files must be updated using:

``` shell
$ gulp public-api:update
```

Note: The command `./test.sh tools` fails when the API doesn't match the golden files.

## <a name="clang-format"></a> Formatting your source code

Angular uses [clang-format](http://clang.llvm.org/docs/ClangFormat.html) to format the source code. If the source code
is not properly formatted, the CI will fail and the PR can not be merged.

You can automatically format your code by running:

``` shell
$ gulp format
```

## Publishing your own personal snapshot build

You may find that your un-merged change needs some validation from external participants.
Rather than requiring them to pull your Pull Request and build Angular locally, you can
publish the `*-builds` snapshots just like our Travis build does.

First time, you need to create the github repositories:

``` shell
$ export TOKEN=[get one from https://github.com/settings/tokens]
$ CREATE_REPOS=1 ./scripts/publish/publish-build-artifacts.sh [github username]
```

For subsequent snapshots, just run

``` shell
$ ./scripts/publish/publish-build-artifacts.sh [github username]
```

The script will publish the build snapshot to a branch with the same name as your current branch,
and create it if it doesn't exist.
