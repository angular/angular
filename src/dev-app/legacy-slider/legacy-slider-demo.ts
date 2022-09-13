/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatLegacySliderModule} from '@angular/material/legacy-slider';
import {MatLegacyTabsModule} from '@angular/material/legacy-tabs';

@Component({
  selector: 'legacy-slider-demo',
  templateUrl: 'legacy-slider-demo.html',
  standalone: true,
  imports: [FormsModule, MatLegacySliderModule, MatLegacyTabsModule],
})
export class LegacySliderDemo {
  demo: number;
  val: number = 50;
  min: number = 0;
  max: number = 100;
  disabledValue = 0;
}
