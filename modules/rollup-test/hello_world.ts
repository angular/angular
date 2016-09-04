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

@Component({selector: 'hello-world', template: 'hello world!!!'})
class HelloWorldComponent {
}

@NgModule({
  declarations: [HelloWorldComponent],
  bootstrap: [HelloWorldComponent],
  imports: [BrowserModule]
})
class ExampleModule {}

platformBrowserDynamic().bootstrapModule(ExampleModule);