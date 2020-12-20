/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {NgModule} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AnimateApp} from './app/animate-app';

@NgModule({declarations: [AnimateApp], bootstrap: [AnimateApp], imports: [BrowserAnimationsModule]})
export class ExampleModule {
}

platformBrowserDynamic().bootstrapModule(ExampleModule);
