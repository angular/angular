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
import {MatError} from './error';
import {MatFormField} from './form-field';
import {MatHint} from './hint';
import {MatPlaceholder} from './placeholder';
import {MatPrefix} from './prefix';
import {MatSuffix} from './suffix';


@NgModule({
  declarations: [
    MatError,
    MatHint,
    MatFormField,
    MatPlaceholder,
    MatPrefix,
    MatSuffix,
  ],
  imports: [
    CommonModule,
    PlatformModule,
  ],
  exports: [
    MatError,
    MatHint,
    MatFormField,
    MatPlaceholder,
    MatPrefix,
    MatSuffix,
  ],
})
export class MatFormFieldModule {}
