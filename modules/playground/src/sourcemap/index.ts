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

@Component({
  selector: 'error-app',
  template: `
           <button class="errorButton" (click)="createError()">create error</button>`
})
export class ErrorComponent {
  createError(): void {
    throw new Error('Sourcemap test');
  }
}

@NgModule({declarations: [ErrorComponent], bootstrap: [ErrorComponent], imports: [BrowserModule]})
export class ExampleModule {
}

platformBrowserDynamic().bootstrapModule(ExampleModule);
