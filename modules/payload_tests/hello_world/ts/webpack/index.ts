/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {BrowserModule} from '@angular/platform-browser';

@Component({
  selector: 'hello-app',
  template: `
    <h1>Hello, {{name}}!</h1>
    <label> Say hello to: <input [value]="name" (input)="name = $event.target.value"></label>
`
})
export class HelloCmp {
  name = 'World';
}

@NgModule({
  bootstrap: [HelloCmp],
  imports: [BrowserModule]
})
class ExampleModule {}


export function main() {
  platformBrowserDynamic().bootstrapModule(ExampleModule);
}
