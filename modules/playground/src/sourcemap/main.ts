/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, NgModule} from '@angular/core';
import {BrowserModule, platformBrowser} from '@angular/platform-browser';

@Component({
  selector: 'error-app',
  template: ` <button class="errorButton" (click)="createError()">create error</button>`,
  standalone: false,
})
export class ErrorComponent {
  createError(): void {
    throw new Error('Sourcemap test');
  }
}

@NgModule({declarations: [ErrorComponent], bootstrap: [ErrorComponent], imports: [BrowserModule]})
export class ExampleModule {}

platformBrowser().bootstrapModule(ExampleModule);
