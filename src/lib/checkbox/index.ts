/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ObserveContentModule} from '@angular/cdk';
import {MdRippleModule, MdCommonModule, FocusOriginMonitor} from '../core';
import {MdCheckbox} from './checkbox';


@NgModule({
  imports: [CommonModule, MdRippleModule, MdCommonModule, ObserveContentModule],
  exports: [MdCheckbox, MdCommonModule],
  declarations: [MdCheckbox],
  providers: [FocusOriginMonitor]
})
export class MdCheckboxModule {}


export * from './checkbox';
