Angular [![Build Status](https://travis-ci.org/angular/angular.svg?branch=master)](https://travis-ci.org/angular/angular) [![Join the chat at https://gitter.im/angular/angular](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/angular/angular?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
=========

Angular is a development platform for building mobile and desktop web applications. This is the
repository for [Angular 2][ng2], both the JavaScript (JS) and [Dart][dart] versions.

Angular 2 is currently in **Alpha Preview**. We recommend using Angular 1.X for production
applications:

* [AngularJS][ngJS]: [angular/angular.js](http://github.com/angular/angular.js).
* [AngularDart][ngDart]: [angular/angular.dart](http://github.com/angular/angular.dart).


## Setup & Install Angular 2

Follow the instructions given on the [Angular download page][download].


## Want to help?

Want to file a bug, contribute some code, or improve documentation? Excellent! Read up on our
guidelines for [contributing][contributing].


## Examples

To see the examples, first build the project as described
[here](http://github.com/angular/angular/blob/master/DEVELOPER.md).

### Hello World Example

This example consists of three basic pieces - a component, a decorator, and a
service.  They are all constructed via injection. For more information see the
comments in the source `modules/examples/src/hello_world/index.js`.

You can build this example as either a JS or a Dart app:

* JS:
  * `$(npm bin)/gulp build.js.dev`, and
  * `$(npm bin)/gulp serve.js.dev`, and
  * open `localhost:8000/examples/src/hello_world/` in Chrome.
* Dart:
  * `$(npm bin)/gulp serve/examples.dart`, and
  * open `localhost:8080/src/hello_world` in Chrome (for dart2js) or
    [Dartium][dartium] (for Dart VM).

[contributing]: http://github.com/angular/angular/blob/master/CONTRIBUTING.md
[dart]: http://www.dartlang.org
[dartium]: http://www.dartlang.org/tools/dartium
[download]: http://angular.io/download
[ng2]: http://angular.io
[ngDart]: http://angulardart.org
[ngJS]: http://angularjs.org
