/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material/core';
import {MatSnackbar} from './snackbar';

@NgModule({
  imports: [MatCommonModule],
  exports: [MatSnackbar, MatCommonModule],
  declarations: [MatSnackbar],
})
export class MatSnackbarModule {
}
