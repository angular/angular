/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PlatformModule} from '@angular/cdk/platform';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MdFormFieldModule} from '@angular/material/form-field';
import {MdTextareaAutosize} from './autosize';
import {MdInput} from './input';


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
