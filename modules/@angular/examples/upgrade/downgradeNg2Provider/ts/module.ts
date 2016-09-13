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


// #docregion downgradeNg2Provider
// Start with instantiating UpgradeAdapter which will be used to create facades between the
// two framworks.
const adapter = new UpgradeAdapter(forwardRef(() => MyModule));

// Also create AngularJS 1 module.
const module = angular.module('myExample', []);

// An Example for Angular 2 Service
@Injectable()
class Login {
  username: string = 'anonymous';
  password: string = '';
}

// Another Example for Angular 2 Service
@Injectable()
class Server {
  url = '/someService';
}

// This is an example of AngularJS 1 services which will now inject instance of services created
// in Angular 2.
// Notice the `$inject` which configures the injection.
function Example(login: Login, server: Server) {
  this.server = server;
  this.login = login;
}
Example.$inject = ['Login', 'Server'];

// Configure AngularJS 1 module with Example service.
module.service('Example', Example);

// Now map the Angular 2 services into AngularJS 1 services using the `downgradeNg2Provider`
// facade and given them string names `Login` and `Server` respectively.
module.service('Login', adapter.downgradeNg2Provider(Login));
module.service('Server', adapter.downgradeNg2Provider(Server));

// #enddocregion

@NgModule({imports: [BrowserModule], providers: [Login, Server]})
class MyModule {
}

module.directive('exampleApp', [
  'Example',
  (example: any) => {
    return {
      scope: true,
      link: (scope: any) => scope.example = example,
      template: '<div>example | json => {{example | json}}</div>'
    };
  }
]);

adapter.bootstrap(document.body, ['myExample']);
