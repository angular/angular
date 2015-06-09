Benchpress - a framework for e2e performance tests
=========

The sources for this package are in the main [Angular2](https://github.com/angular/angular) repo. Please file issues and pull requests against that repo.

This package contains different sources for different users:

1. The files located in the root folder can be consumed using CommonJS
2. The files under `/es6` are es6 compatible files that can be transpiled to
   es5 using any transpiler. This contains:
    * `dev/`: a development version that includes runtime type assertions
    * `prod/`: a production version that does not include runtime type assertions
3. The files under `/ts` are the Typescript source files

As a convenience, we provide you with `/es6/{dev|prod}/es5build.js`, a script to transpile the es6 sources into es5
using [Google Traceur](https://github.com/google/traceur-compiler/).

License: Apache MIT 2.0
