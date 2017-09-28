/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material/core';
import {
  MatProgressSpinner,
  MatSpinner,
  MatProgressSpinnerCssMatStyler,
} from './progress-spinner';


@NgModule({
  imports: [MatCommonModule],
  exports: [
    MatProgressSpinner,
    MatSpinner,
    MatCommonModule,
    MatProgressSpinnerCssMatStyler
  ],
  declarations: [
    MatProgressSpinner,
    MatSpinner,
    MatProgressSpinnerCssMatStyler
  ],
})
export class MatProgressSpinnerModule {}
