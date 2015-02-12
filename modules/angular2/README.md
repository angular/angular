Angular2
=========

The sources for this package are in the main [Angular2](https://github.com/angular/angular) repo. Please file issues and pull requests against that repo. This is the repository for the upcoming 2.0 version. If you're looking for the current official version of Angular you should go to [angular/angular.js](https://github.com/angular/angular.js)

Angular2 has 2 versions:

1. a development version that includes runtime type assertions: See `ng2dev` npm tag
2. a production version that does not include runtime type assertions: See `ng2prod` npm tag

All sources are in ES6 format and have the suffix `.es6`. They don't depend on any runtime
and can be used by any modern ES6 -> ES5 transpiler.

As a convenience, we provide you with `es5build.js`, a script to transpile the sources into es5
using [Google Traceur](https://github.com/google/traceur-compiler/).

License: Apache MIT 2.0
