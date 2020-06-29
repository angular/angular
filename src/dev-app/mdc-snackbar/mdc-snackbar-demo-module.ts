/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatSnackbarModule} from '@angular/material-experimental/mdc-snackbar';
import {RouterModule} from '@angular/router';
import {MdcSnackbarDemo} from './mdc-snackbar-demo';

@NgModule({
  imports: [
    MatSnackbarModule,
    RouterModule.forChild([{path: '', component: MdcSnackbarDemo}]),
  ],
  declarations: [MdcSnackbarDemo],
})
export class MdcSnackbarDemoModule {
}
