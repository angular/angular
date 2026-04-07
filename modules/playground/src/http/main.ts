/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HttpClientModule} from '@angular/common/http';
import {NgModule, provideZoneChangeDetection} from '@angular/core';
import {BrowserModule, platformBrowser} from '@angular/platform-browser';

import {HttpCmp} from './app/http_comp';

@NgModule({
  declarations: [HttpCmp],
  bootstrap: [HttpCmp],
  imports: [BrowserModule, HttpClientModule],
  providers: [provideZoneChangeDetection()],
})
export class ExampleModule {}

platformBrowser().bootstrapModule(ExampleModule);
