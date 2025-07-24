/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {enableProdMode, NgModule} from '@angular/core';
import {BrowserModule, platformBrowser} from '@angular/platform-browser';

import {MyComponent} from './my_component';

enableProdMode();

@NgModule({imports: [BrowserModule], declarations: [MyComponent], bootstrap: [MyComponent]})
export class AppModule {}

platformBrowser().bootstrapModule(AppModule);
