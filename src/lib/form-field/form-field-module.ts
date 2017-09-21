/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {PlatformModule} from '@angular/cdk/platform';
import {MdError} from './error';
import {MdFormField} from './form-field';
import {MdHint} from './hint';
import {MdPlaceholder} from './placeholder';
import {MdPrefix} from './prefix';
import {MdSuffix} from './suffix';


@NgModule({
  declarations: [
    MdError,
    MdHint,
    MdFormField,
    MdPlaceholder,
    MdPrefix,
    MdSuffix,
  ],
  imports: [
    CommonModule,
    PlatformModule,
  ],
  exports: [
    MdError,
    MdHint,
    MdFormField,
    MdPlaceholder,
    MdPrefix,
    MdSuffix,
  ],
})
export class MdFormFieldModule {}
