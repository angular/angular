/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, ErrorHandler, Injectable, NgModule} from '@angular/core';

@Component({
  selector: 'benchmark-area',
  template: '<ng-content></ng-content>',
  styles: [
    `
      :host {
        padding: 1;
        margin: 1;
        background-color: white;
        width: 1000px;
        display: block;
      }
    `,
  ],
  host: {
    'class': 'cfc-ng2-region',
  },
  standalone: false,
})
export class BenchmarkArea {}

declare interface ExtendedWindow extends Window {
  benchmarkErrors?: string[];
}
const extendedWindow = window as ExtendedWindow;

@Injectable({providedIn: 'root'})
export class BenchmarkErrorHandler implements ErrorHandler {
  handleError(error: Error) {
    if (!extendedWindow.benchmarkErrors) {
      extendedWindow.benchmarkErrors = [];
    }
    extendedWindow.benchmarkErrors.push(error.message);
    console.error(error);
  }
}

@NgModule({
  declarations: [BenchmarkArea],
  exports: [BenchmarkArea],
  providers: [{provide: ErrorHandler, useClass: BenchmarkErrorHandler}],
})
export class BenchmarkModule {}
