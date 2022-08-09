/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatSliderModule} from '@angular/material/slider';
import {MatTabsModule} from '@angular/material-experimental/mdc-tabs';

@Component({
  selector: 'mdc-slider-demo',
  templateUrl: 'mdc-slider-demo.html',
  styles: ['.mat-mdc-slider { width: 300px; }'],
  standalone: true,
  imports: [FormsModule, MatSliderModule, MatTabsModule],
})
export class MdcSliderDemo {
  demo: number;
  val: number = 50;
  min: number = 0;
  max: number = 100;
  disabledValue = 0;
}
