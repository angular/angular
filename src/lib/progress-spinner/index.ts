/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MdCommonModule} from '../core';
import {
  MdProgressSpinner,
  MdSpinner,
  MdProgressSpinnerCssMatStyler,
} from './progress-spinner';


@NgModule({
  imports: [MdCommonModule],
  exports: [
    MdProgressSpinner,
    MdSpinner,
    MdCommonModule,
    MdProgressSpinnerCssMatStyler
  ],
  declarations: [
    MdProgressSpinner,
    MdSpinner,
    MdProgressSpinnerCssMatStyler
  ],
})
class MdProgressSpinnerModule {}

export {MdProgressSpinnerModule};
export * from './progress-spinner';
