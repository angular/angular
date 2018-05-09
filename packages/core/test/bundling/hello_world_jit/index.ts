/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import 'reflect-metadata';

import {Component, NgModule, ɵrenderComponent as renderComponent} from '@angular/core';

@Component({
  selector: 'greeting-cmp',
  template: 'Hello World!',
})
export class Greeting {
}

@NgModule({
  declarations: [Greeting],
  exports: [Greeting],
})
export class GreetingModule {
}

@Component({selector: 'hello-world', template: '<greeting-cmp></greeting-cmp>'})
export class HelloWorld {
}

@NgModule({
  declarations: [HelloWorld],
  imports: [GreetingModule],
})
export class HelloWorldModule {
}

renderComponent(HelloWorld);
