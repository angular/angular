import {Component} from '@angular/core';
import {bootstrap} from '@angular/platform-browser';

// #docregion bootstrap
@Component({selector: 'my-app', template: 'Hello {{ name }}!'})
class MyApp {
  name: string = 'World';
}

function main() {
  return bootstrap(MyApp);
}
// #enddocregion
