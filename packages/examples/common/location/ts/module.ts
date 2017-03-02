/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {APP_BASE_HREF} from '@angular/common';
import {Component, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {HashLocationComponent} from './hash_location_component';
import {PathLocationComponent} from './path_location_component';

@Component({
  selector: 'example-app',
  template: `<hash-location></hash-location><path-location></path-location>`
})
export class ExampleAppComponent {
}

@NgModule({
  declarations: [ExampleAppComponent, PathLocationComponent, HashLocationComponent],
  providers: [{provide: APP_BASE_HREF, useValue: '/'}],
  imports: [BrowserModule],
  bootstrap: [ExampleAppComponent]
})
export class AppModule {
}
