/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {HttpCmp} from './app/http_comp';

@NgModule(
    {declarations: [HttpCmp], bootstrap: [HttpCmp], imports: [BrowserModule, HttpClientModule]})
export class ExampleModule {
}

platformBrowserDynamic().bootstrapModule(ExampleModule);
