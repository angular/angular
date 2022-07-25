/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ObserversModule} from '@angular/cdk/observers';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material/core';
import {MatLegacyError} from './error';
import {MatLegacyFormField} from './form-field';
import {MatLegacyHint} from './hint';
import {MatLegacyLabel} from './label';
import {MatLegacyPlaceholder} from './placeholder';
import {MatLegacyPrefix} from './prefix';
import {MatLegacySuffix} from './suffix';

@NgModule({
  declarations: [
    MatLegacyError,
    MatLegacyFormField,
    MatLegacyHint,
    MatLegacyLabel,
    MatLegacyPlaceholder,
    MatLegacyPrefix,
    MatLegacySuffix,
  ],
  imports: [CommonModule, MatCommonModule, ObserversModule],
  exports: [
    MatCommonModule,
    MatLegacyError,
    MatLegacyFormField,
    MatLegacyHint,
    MatLegacyLabel,
    MatLegacyPlaceholder,
    MatLegacyPrefix,
    MatLegacySuffix,
  ],
})
export class MatLegacyFormFieldModule {}
