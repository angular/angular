/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatSliderModule, MatTabsModule} from '@angular/material';
import {SliderDemo} from './slider-demo';

@NgModule({
  imports: [
    FormsModule,
    MatSliderModule,
    MatTabsModule,
  ],
  declarations: [SliderDemo],
})
export class SliderDemoModule {
}
