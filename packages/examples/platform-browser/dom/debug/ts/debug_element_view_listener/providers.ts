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

@Component({selector: 'my-component', template: 'text'})
class MyAppComponent {
}
@NgModule({imports: [BrowserModule], bootstrap: [MyAppComponent]})
class AppModule {
}
platformBrowserDynamic().bootstrapModule(AppModule);
