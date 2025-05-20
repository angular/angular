/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HttpClientJsonpModule, HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {BrowserModule, platformBrowser} from '@angular/platform-browser';

import {JsonpCmp} from './app/jsonp_comp';

@NgModule({
  bootstrap: [JsonpCmp],
  declarations: [JsonpCmp],
  imports: [BrowserModule, HttpClientModule, HttpClientJsonpModule],
})
export class ExampleModule {}

platformBrowser().bootstrapModule(ExampleModule);
