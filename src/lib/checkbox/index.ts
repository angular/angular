/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ObserversModule} from '@angular/cdk/observers';
import {MdRippleModule, MdCommonModule, FocusOriginMonitor} from '../core';
import {MdCheckbox} from './checkbox';
import {MdCheckboxRequiredValidator} from './checkbox-required-validator';

@NgModule({
  imports: [CommonModule, MdRippleModule, MdCommonModule, ObserversModule],
  exports: [MdCheckbox, MdCheckboxRequiredValidator, MdCommonModule],
  declarations: [MdCheckbox, MdCheckboxRequiredValidator],
  providers: [FocusOriginMonitor]
})
export class MdCheckboxModule {}


export * from './checkbox';
export * from './checkbox-required-validator';
