/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {registerLocaleData} from '@angular/common';
import {Component} from '@angular/core';
// we need to import data for the french locale
import localeFr from './locale-fr';

// registering french data
registerLocaleData(localeFr);

// #docregion PercentPipe
@Component({
  selector: 'percent-pipe',
  template: `<div>
    <!--output '26%'-->
    <p>A: {{ a | percent }}</p>

    <!--output '0,134.950%'-->
    <p>B: {{ b | percent: '4.3-5' }}</p>

    <!--output '0 134,950 %'-->
    <p>B: {{ b | percent: '4.3-5' : 'fr' }}</p>
  </div>`,
  standalone: false,
})
export class PercentPipeComponent {
  a: number = 0.259;
  b: number = 1.3495;
}
// #enddocregion
