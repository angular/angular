/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {enableProdMode, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {MyComponent} from './my_component';

enableProdMode();

@NgModule({imports: [BrowserModule], declarations: [MyComponent], bootstrap: [MyComponent]})
export class AppModule {
}

platformBrowserDynamic().bootstrapModule(AppModule);
