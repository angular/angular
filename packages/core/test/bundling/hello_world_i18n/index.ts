/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import './translations';

import {Component, NgModule, provideManualChangeDetection} from '@angular/core';
import {BrowserModule, platformBrowser} from '@angular/platform-browser';

@Component({
  selector: 'hello-world',
  template: `<div i18n i18n-title title="Hello Title!">Hello World!</div>`,
})
export class HelloWorld {}

@NgModule({
  declarations: [HelloWorld],
  imports: [BrowserModule],
  bootstrap: [HelloWorld],
  providers: [provideManualChangeDetection()],
})
export class Module {}

platformBrowser().bootstrapModule(Module);
