/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

@Component({
  template: `
    <h1>404</h1>
    <p>This page does not exist</p>
    <a mat-raised-button routerLink="/">Go back to the home page</a>
  `,
  host: {'class': 'mat-typography'},
})
export class DevApp404 {
}
