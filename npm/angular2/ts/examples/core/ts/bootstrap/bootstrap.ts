import {Component} from 'angular2/core';
import {bootstrap} from 'angular2/platform/browser';

// #docregion bootstrap
@Component({selector: 'my-app', template: 'Hello {{ name }}!'})
class MyApp {
  name: string = 'World';
}

function main() {
  return bootstrap(MyApp);
}
// #enddocregion
