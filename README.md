[![Build Status](https://travis-ci.org/angular/angular.svg?branch=master)](https://travis-ci.org/angular/angular)

## Build

### Prerequisites:

1. `npm install`
2. `npm install -g gulp karma karma-cli`
3. `npm install -g protractor`
4. `webdriver-manager update`
3. Optionally install Dart SDK (only if you plan on building Dart applications)
  1. [Install the Dart SDK](https://www.dartlang.org/tools/sdk/)
  2. [Add the Dart SDK's `bin` directory to your system path](https://www.dartlang.org/tools/pub/installing.html)
4. `gulp build`
5. `pub get`

### Folder structure

* `modules/*`: modules that will be loaded in the browser
* `tools/*`: tools that are needed to build Angular

### File endings

* `*.js`: javascript files that get transpiled to Dart and EcmaScript 5
* `*.es6`: javascript files that get transpiled only to EcmaScript 5
* `*.es5`: javascript files that don't get transpiled
* `*.dart`: dart files that don't get transpiled

### Build:

1. `gulp build` -> result is in `dist` folder

  * will also run `pub get` for the subfolders in `modules`
    and run `dartanalyzer` for every file that matches
    `<module>/src/<module>.dart`, e.g. `di/src/di.dart`

2. `gulp clean` -> cleans the `dist` folder

### Unit tests:

1. `karma start karma-js.conf.js`: JS tests
2. `karma start karma-dart.conf.js`: Dart tests

Notes for transpiler tests:

The karma preprocessor is setup in a way so that after every test run
the transpiler is reloaded. With that it is possible to make changes
to the preprocessor and run the tests without exiting karma
(just touch a test file that you would like to run).

### Performance tests

1. `gulp build.cjs` (builds benchpress and tests into `dist/cjs` folder)
2. `protractor protractor-perf-js.conf.js`: JS performance tests
3. `protractor protractor-perf-dart2js.conf.js`: Dart2JS performance tests

### Examples:

To see the examples, first build the project as described above.

#### Hello World Example
This example consists of three basic pieces - a component, a decorator and a service.
They are all constructed via injection. For more information see the comments in the
source `modules/examples/src/hello_world/index.js`.

You can build this example as either JS or Dart app:
* (JS) `gulp serve.js.dev` and open `localhost:8000/examples/web/hello_world/` in Chrome.
* (Dart) `gulp serve/examples.dart` and open `localhost:8080` in Chrome(for dart2js) or dartium(for dart vm).

## Debug the transpiler

If you need to debug the transpiler:

- add a `debugger;` statement in the transpiler code,
- from the root folder, execute `node debug node_modules/.bin/gulp build` to enter the node
  debugger
- press "c" to execute the program until you reach the `debugger;` statement,
- you can then type "repl" to enter the REPL and inspect variables in the context.

See the [Node.js manual](http://nodejs.org/api/debugger.html) for more information.

Notes:
- You can also execute `node node_modules/.bin/karma start karma-dart.conf.js` depending on which
  code you want to debug (the former will process the "modules" folder while the later processes
  the transpiler specs),
- You can also add `debugger;` statements in the specs (JavaScript). The execution will halt when
  the developer tools are opened in the browser running Karma.

## Debug the tests

If you need to debug the tests:

- add a `debugger;` statement to the test you want to debug (oe the source code),
- execute karma `node_modules/karma/bin/karma start karma-js.conf.js`,
- press the top right "DEBUG" button,
- open the dev tools and press F5,
- the execution halt at the `debugger;` statement

Note (WebStorm users):
You can create a Karma run config from WebStorm.
Then in the "Run" menu, press "Debug 'karma-js.conf.js'", WebStorm will stop in the generated code
on the `debugger;` statement.
You can then step into the code and add watches.
The `debugger;` statement is needed because WebStorm will stop in a transpiled file. Breakpoints in
the original source files are not supported at the moment.
