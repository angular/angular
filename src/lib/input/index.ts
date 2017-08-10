/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MdInput} from './input';
import {MdTextareaAutosize} from './autosize';
import {CommonModule} from '@angular/common';
import {PlatformModule} from '../core/platform/index';
import {MdFormFieldModule} from '../form-field/index';


@NgModule({
  declarations: [
    MdInput,
    MdTextareaAutosize,
  ],
  imports: [
    CommonModule,
    MdFormFieldModule,
    PlatformModule,
  ],
  exports: [
    // We re-export the `MdFormFieldModule` since `MdInput` will almost always be used together with
    // `MdFormField`.
    MdFormFieldModule,
    MdInput,
    MdTextareaAutosize,
  ],
})
export class MdInputModule {}


export * from './autosize';
export * from './input';
export * from './input-errors';

