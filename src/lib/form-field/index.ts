/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MdError} from './error';
import {MdFormField} from './form-field';
import {MdHint} from './hint';
import {MdPlaceholder} from './placeholder';
import {MdPrefix} from './prefix';
import {MdSuffix} from './suffix';
import {CommonModule} from '@angular/common';
import {PlatformModule} from '../core/platform/index';


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


export * from './error';
export * from './form-field';
export * from './form-field-control';
export * from './form-field-errors';
export * from './hint';
export * from './placeholder';
export * from './prefix';
export * from './suffix';

