/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {HTTP_PROVIDERS} from '@angular/http';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {HttpCmp} from './app/http_comp';

@NgModule({bootstrap: [HttpCmp], providers: [HTTP_PROVIDERS], imports: [BrowserModule]})
class ExampleModule {
}

export function main() {
  platformBrowserDynamic().bootstrapModule(ExampleModule);
}
