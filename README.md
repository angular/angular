[![Build Status](https://travis-ci.org/angular/angular.svg?branch=master)](https://travis-ci.org/angular/angular)

## Build

### Prerequisites:

1. `npm install`
2. `pub get`
3. `install -g gulp`
4. `install -g karma`

### Folder structure

* `modules/*`: modules that will be loaded in the browser
* `tools/*`: tools that are needed to build Angular

### File endings

* `*.js`: javascript files that get transpiled to Dart and EcmaScript 5
* `*.es6`: javascript files that get transpiled only to EcmaScript 5
* `*.es5`: javascript files that don't get transpiled
* `*.dart`: dart files that don't get transpiled

### Build:

1. `gulp build` -> result is in `build` folder

  * will also to `pubg get` for the subfolders in `modules`
    and run `dartanalyzer` for every file that matches
    `<module>/src/<module>.dart`, e.g. `di/src/di.dart`

2. `gulp clean` -> cleans the `build` folder

### Tests:

1. `karma start karma-js.conf.js`: JS tests
2. `karma start karma-dart.conf.js`: JS tests

Notes for all tests:

The karma preprocessor is setup in a way so that after every test run
the transpiler is reloaded. With that it is possible to make changes
to the preprocessor and run the tests without exiting karma
(just touch a test file that you would like to run).

Restriction for Dart tests (for now):

  * Due to a bug `karma-dart` plugin,
    this will use the files in the `build` folder for resolving
    `package:` dependencies (created e.g. for `import ... from 'di:di'`).
    So you need to execute `gulp build` before this.