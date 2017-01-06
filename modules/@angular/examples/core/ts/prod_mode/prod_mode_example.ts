/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// #docregion enableProdMode
import {NgModule, enableProdMode} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {MyComponent} from './my_component';

enableProdMode();
@NgModule({imports: [BrowserModule], bootstrap: [MyComponent]})
class AppModule {
}
platformBrowserDynamic().bootstrapModule(AppModule);
// #enddocregion
