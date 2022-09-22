/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatSliderModule} from '@angular/material/slider';
import {SliderE2e} from './slider-e2e';

@NgModule({
  imports: [MatSliderModule],
  declarations: [SliderE2e],
})
export class SliderE2eModule {}
