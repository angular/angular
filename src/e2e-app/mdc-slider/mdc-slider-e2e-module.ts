/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatSliderModule} from '@angular/material-experimental/mdc-slider';
import {MdcSliderE2e} from './mdc-slider-e2e';

@NgModule({
  imports: [MatSliderModule],
  declarations: [MdcSliderE2e],
})
export class MdcSliderE2eModule {}
