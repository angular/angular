/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {registerLocaleData} from '@angular/common';
import {Component} from '@angular/core';
// we need to import data for the french locale
import localeFr from './locale-fr';

// registering french data
registerLocaleData(localeFr);

// #docregion NumberPipe
@Component({
  selector: 'number-pipe',
  template: `<div>
    <!--output '2.718'-->
    <p>e (no formatting): {{e | number}}</p>
    
    <!--output '002.71828'-->
    <p>e (3.1-5): {{e | number:'3.1-5'}}</p>

    <!--output '0,002.71828'-->
    <p>e (4.5-5): {{e | number:'4.5-5'}}</p>
    
    <!--output '0 002,71828'-->
    <p>e (french): {{e | number:'4.5-5':'fr'}}</p>

    <!--output '3.14'-->
    <p>pi (no formatting): {{pi | number}}</p>
    
    <!--output '003.14'-->
    <p>pi (3.1-5): {{pi | number:'3.1-5'}}</p>

    <!--output '003.14000'-->
    <p>pi (3.5-5): {{pi | number:'3.5-5'}}</p>

    <!--output '-3' / unlike '-2' by Math.round()-->
    <p>-2.5 (1.0-0): {{-2.5 | number:'1.0-0'}}</p>
  </div>`
})
export class NumberPipeComponent {
  pi: number = 3.14;
  e: number = 2.718281828459045;
}
// #enddocregion

// #docregion DeprecatedNumberPipe
@Component({
  selector: 'deprecated-number-pipe',
  template: `<div>
    <p>e (no formatting): {{e}}</p>
    <p>e (3.1-5): {{e | number:'3.1-5'}}</p>
    <p>pi (no formatting): {{pi}}</p>
    <p>pi (3.5-5): {{pi | number:'3.5-5'}}</p>
  </div>`
})
export class DeprecatedNumberPipeComponent {
  pi: number = 3.141592;
  e: number = 2.718281828459045;
}
// #enddocregion
