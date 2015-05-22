# Building and Testing Angular 2 for JS and Dart

This document describes how to set up your development environment to build and test Angular, both
JS and Dart versions. It also explains the basic mechanics of using `git`, `node`, and `npm`.

* [Prerequisite Software](#prerequisite-software)
* [Getting the Sources](#getting-the-sources)
* [Environment Variable Setup](#environment-variable-setup)
* [Installing NPM Modules and Dart Packages](#installing-npm-modules-and-dart-packages)
* [Running Tests Locally](#running-tests-locally)
* [Formatting](#formatting)
* [Project Information](#project-information)
* [CI using Travis](#ci-using-travis)
* [Transforming Dart code](#transforming-dart-code)
* [Debugging](#debugging)

See the [contribution guidelines](https://github.com/angular/angular/blob/master/CONTRIBUTING.md)
if you'd like to contribute to Angular.

## Prerequisite Software

Before you can build and test Angular, you must install and configure the
following products on your development machine:

* [Dart](https://www.dartlang.org) (version ` >=1.10.0-dev.1.10 <2.0.0`), specifically the Dart-SDK and
  Dartium (a version of [Chromium](http://www.chromium.org) with native support for Dart through
  the Dart VM). One of the **simplest** ways to get both is to install the **Dart Editor bundle**,
  which includes the editor, SDK and Dartium. See the [Dart tools](https://www.dartlang.org/tools)
  download [page for instructions](https://www.dartlang.org/tools/download.html). You can also
  download both **stable** and **dev** channel versions from the [download
  archive](https://www.dartlang.org/tools/download-archive).

* [Git](http://git-scm.com) and/or the **GitHub app** (for [Mac](http://mac.github.com) or
  [Windows](http://windows.github.com)); [GitHub's Guide to Installing
  Git](https://help.github.com/articles/set-up-git) is a good source of information.

* [Node.js](http://nodejs.org), which is used to run a development web server, run tests, and
  generate distributable files. We also use Node's Package Manager, `npm`, which comes with Node.
  Depending on your system, you can install Node either from source or as a pre-packaged bundle.

* [Chrome Canary](https://www.google.com/chrome/browser/canary.html), a version of Chrome with
  bleeding edge functionality, built especially for developers (and early adopters).

* [Bower](http://bower.io/).


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

## Build commands

To build Angular and prepare tests, run:

```shell
$(npm bin)/gulp build
```

Notes:
* Results are put in the `dist` folder.
* This will also run `pub get` for the subfolders in `modules` and run `dartanalyzer` for
  every file that matches `<module>/src/<module>.dart`, e.g. `di/src/di.dart`.

You can selectively build either the JS or Dart versions as follows:

* `$(npm bin)/gulp build.js`
* `$(npm bin)/gulp build.dart`

To clean out the `dist` folder, run:

```shell
$(npm bin)/gulp clean
```

## Running Tests Locally

### Full test suite

* `npm test`: full test suite for both JS and Dart versions of Angular. These are the same tests
  that run on Travis.

You can selectively run either the JS or Dart versions as follows:

* `$(npm bin)/gulp test.all.js`
* `$(npm bin)/gulp test.all.dart`

### Unit tests

You can run just the unit tests as follows:

* `$(npm bin)/gulp test.unit.js`: JS tests in a browser; runs in **watch mode** (i.e.
   watches the test files for changes and re-runs tests when files are updated).
* `$(npm bin)/gulp test.unit.cjs`: JS tests in NodeJS; runs in **watch mode**.
* `$(npm bin)/gulp test.unit.dart`: Dart tests in Dartium; runs in **watch mode**.

If you prefer running tests in "single-run" mode rather than watch mode use:

* `$(npm bin)/gulp test.unit.js/ci`
* `$(npm bin)/gulp test.unit.cjs/ci`
* `$(npm bin)/gulp test.unit.dart/ci`

The task updates the dist folder with transpiled code whenever a source or test file changes, and
Karma is run against the new output.

**Note**: If you want to only run a single test you can alter the test you wish to run by changing
`it` to `iit` or `describe` to `ddescribe`. This will only run that individual test and make it
much easier to debug. `xit` and `xdescribe` can also be useful to exclude a test and a group of
tests respectively.

### E2e tests

1. `$(npm bin)/gulp build.js.cjs` (builds benchpress and tests into `dist/js/cjs` folder).
2. `$(npm bin)/gulp serve.js.prod serve.js.dart2js` (runs a local webserver).
3. `$(npm bin)/protractor protractor-js.conf.js`: JS e2e tests.
4. `$(npm bin)/protractor protractor-dart2js.conf.js`: dart2js e2e tests.

Angular specific command line options when running protractor:
  - `$(npm bin)/protractor protractor-{js|dart2js}-conf.js --ng-help`

### Performance tests

1. `$(npm bin)/gulp build.js.cjs` (builds benchpress and tests into `dist/js/cjs` folder)
2. `$(npm bin)/gulp serve.js.prod serve.js.dart2js` (runs a local webserver)
3. `$(npm bin)/protractor protractor-js.conf.js --benchmark`: JS performance tests
4. `$(npm bin)/protractor protractor-dart2js.conf.js --benchmark`: dart2js performance tests

Angular specific command line options when running protractor (e.g. force gc, ...):
`$(npm bin)/protractor protractor-{js|dart2js}-conf.js --ng-help`

## Formatting

We use [clang-format](http://clang.llvm.org/docs/ClangFormat.html) to automatically enforce code style for our TypeScript code.
This allows us to focus our code reviews more on the content, and less on style nit-picking.
It also lets us encode our style guide in the `.clang-format` file in the repository,
allowing many tools and editors to share our settings.

To check the formatting of your code, run

    gulp check-format

Note that the continuous build on Travis runs `gulp enforce-format`.
Unlike the `check-format` task, this will actually fail the build if files aren't formatted according to the style guide.

Your life will be easier if you include the formatter in your standard workflow.
Otherwise, you'll likely forget to check the formatting,
and waste time waiting for a build on Travis that fails due to some whitespace difference.

* **git pre-commit hook** is available at
[llvm.org](https://llvm.org/svn/llvm-project/cfe/trunk/tools/clang-format/git-clang-format).
This will automatically format your delta regions when you commit a change.
To install, first patch this file to add `.ts` to the `default_extensions` section.
Then copy the file somewhere in your path, for example, `/usr/local/git/current/bin/git-clang-format`.
Make sure it is executable. Then, in the angular repo, run

```
    $ echo -e '#!/bin/sh\nexec git clang-format' > .git/hooks/pre-commit
    $ chmod u+x !$
```

* **WebStorm** can run clang-format on the current file.
  1. Under Preferences, open Tools > External Tools.
  1. Plus icon to Create Tool
  1. Fill in the form:
    - Name: clang-format
    - Description: Format
    - Synchronize files after execution: checked
    - Open console: not checked
    - Show in: Editor menu
    - Program: [path to clang-format, try `$ echo $(npm config get prefix)/bin/clang-format`]
    - Parameters: `-i -style=file $FilePath$`
    - Working directory: `$ProjectFileDir$`
    
## Project Information

### Folder structure

* `modules/*`: modules that will be loaded in the browser
* `tools/*`: tools that are needed to build Angular
* `dist/*`: build files are placed here.

### File suffixes

* `*.js`: JavaScript files that get transpiled to Dart and EcmaScript 5
* `*.es6`: JavaScript files that get transpiled only to EcmaScript 5
* `*.es5`: JavaScript files that don't get transpiled
* `*.dart`: Dart files that don't get transpiled

## CI using Travis

For instructions on setting up Continuous Integration using Travis, see the instructions given
[here](https://github.com/angular/angular.dart/blob/master/travis.md).

## Transforming Dart code

See the [wiki](//github.com/angular/angular/wiki/Angular-2-Dart-Transformer).

## Debugging

### Debug the transpiler

If you need to debug the transpiler:

- add a `debugger;` statement in the transpiler code,
- from the root folder, execute `node debug $(npm bin)/gulp build` to enter the node
  debugger
- press "c" to execute the program until you reach the `debugger;` statement,
- you can then type "repl" to enter the REPL and inspect variables in the context.

See the [Node.js manual](http://nodejs.org/api/debugger.html) for more information.

Notes:
- You can also execute `node $(npm bin)/karma start karma-dart.conf.js` depending on which
  code you want to debug (the former will process the "modules" folder while the later processes
  the transpiler specs).
- You can also add `debugger;` statements in the specs (JavaScript). The execution will halt when
  the developer tools are opened in the browser running Karma.

### Debug the tests

If you need to debug the tests:

- add a `debugger;` statement to the test you want to debug (or the source code),
- execute karma `$(npm bin)/gulp test.js`,
- press the top right "DEBUG" button,
- open the DevTools and press F5,
- the execution halts at the `debugger;` statement

**Note (WebStorm users)**:

1. Create a Karma run config from WebStorm.
2. Then in the "Run" menu, press "Debug 'karma-js.conf.js'", and WebStorm will stop in the generated
   code on the `debugger;` statement.
3. You can then step into the code and add watches.

The `debugger;` statement is needed because WebStorm will stop in a transpiled file. Breakpoints in
the original source files are not supported at the moment.
