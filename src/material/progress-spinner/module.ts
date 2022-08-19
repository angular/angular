/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material/core';
import {MatProgressSpinner, MatSpinner} from './progress-spinner';
import {CommonModule} from '@angular/common';

@NgModule({
  imports: [CommonModule],
  exports: [MatProgressSpinner, MatSpinner, MatCommonModule],
  declarations: [MatProgressSpinner, MatSpinner],
})
export class MatProgressSpinnerModule {}
