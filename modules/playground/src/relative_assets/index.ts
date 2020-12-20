/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {MyCmp} from './app/my_cmp';

@Component({
  selector: 'relative-app',
  template: `component = <my-cmp></my-cmp>`,
})
export class RelativeApp {
}

@NgModule({declarations: [RelativeApp, MyCmp], bootstrap: [RelativeApp], imports: [BrowserModule]})
export class ExampleModule {
}

platformBrowserDynamic().bootstrapModule(ExampleModule);
