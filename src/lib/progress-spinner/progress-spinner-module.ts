/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {NgModule} from '@angular/core';
import {PlatformModule} from '@angular/cdk/platform';
import {MatCommonModule} from '@angular/material/core';
import {MatProgressSpinner, MatSpinner} from './progress-spinner';

@NgModule({
  imports: [MatCommonModule, PlatformModule],
  exports: [
    MatProgressSpinner,
    MatSpinner,
    MatCommonModule
  ],
  declarations: [
    MatProgressSpinner,
    MatSpinner
  ],
})
class MatProgressSpinnerModule {}

export {MatProgressSpinnerModule};
