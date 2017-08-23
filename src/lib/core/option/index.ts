/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MdRippleModule} from '../ripple/index';
import {MdPseudoCheckboxModule} from '../selection/index';
import {MdOption} from './option';
import {MdOptgroup} from './optgroup';


@NgModule({
  imports: [MdRippleModule, CommonModule, MdPseudoCheckboxModule],
  exports: [MdOption, MdOptgroup],
  declarations: [MdOption, MdOptgroup]
})
export class MdOptionModule {}


export * from './option';
export * from './optgroup';
