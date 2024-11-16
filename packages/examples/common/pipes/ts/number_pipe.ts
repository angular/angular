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

registerLocaleData(localeFr, 'fr');

// #docregion NumberPipe
@Component({
  selector: 'number-pipe',
  template: `<div>
    <p>
      No specified formatting:
      {{ pi | number }}
      <!--output: '3.142'-->
    </p>

    <p>
      With digitsInfo parameter specified:
      {{ pi | number: '4.1-5' }}
      <!--output: '0,003.14159'-->
    </p>

    <p>
      With digitsInfo and locale parameters specified:
      {{ pi | number: '4.1-5' : 'fr' }}
      <!--output: '0 003,14159'-->
    </p>
  </div>`,
  standalone: false,
})
export class NumberPipeComponent {
  pi: number = 3.14159265359;
}
// #enddocregion
