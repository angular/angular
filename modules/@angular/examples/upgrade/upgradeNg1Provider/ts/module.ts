/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Inject, Injectable, Input, NgModule, forwardRef} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {UpgradeAdapter} from '@angular/upgrade';
import {IAngularStatic} from '@types/angular';
declare var angular: IAngularStatic;


// #docregion upgradeNg1Provider
// Start with instantiating UpgradeAdapter which will be used to create facades between the
// two framworks.
const adapter = new UpgradeAdapter(forwardRef(() => MyModule));

// Also create AngularJS 1 module.
const module = angular.module('myExample', []);

// An example of AngularJS 1 service
class Login {
  username: string = 'anonymous';
  password: string = '';
}

// An example of AngularJS 1 service
class Server {
  url = '/someService';
}

// Register the services with the AngularJS 1 module.
module.service('server', Server);
module.service('login', Login);

// Bridge the Angular 2 injector with AngularJS 1.
// In this example the `server` will become available for injection using the `@Inject('server')`
// syntax
adapter.upgradeNg1Provider('server');
// In this example the `login` will become available for injection as `Login`
adapter.upgradeNg1Provider('login', {asToken: Login});


// Example of Angular 2 service which injects `server` and `login` from AngularJS 1.
// Because AngularJS 1 uses strings while Angular 2 uses tokens notice the two possible
// way of injecting the dependencies.
@Injectable()
class Example {
  server: Server;
  login: Login;

  constructor(@Inject('server') server: Server, login: Login) {
    this.server = server;
    this.login = login;
  }
}
// #enddocregion

@Component({selector: 'log', template: `<div>example | json => {{example | json}}</div>`})
class LogComponent {
  constructor(private example: Example) {}
}

@NgModule({
  imports: [BrowserModule],
  declarations: [LogComponent],
  providers: [Example],
  entryComponents: [LogComponent]
})
class MyModule {
}


module.directive('exampleApp', adapter.downgradeNg2Component(LogComponent));

adapter.bootstrap(document.body, ['myExample']);
