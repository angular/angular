/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

@Component({
  selector: 'mdc-slider-e2e',
  template: `
    <mat-slider id="standard-slider">
      <input aria-label="Standard slider" matSliderThumb>
    </mat-slider>

    <mat-slider id="disabled-slider" disabled>
      <input aria-label="Disabled slider" matSliderThumb>
    </mat-slider>

    <mat-slider id="range-slider">
      <input aria-label="Range slider start thumb" matSliderStartThumb>
      <input aria-label="Range slider end thumb" matSliderEndThumb>
    </mat-slider>
    `,
})
export class MdcSliderE2e {}
