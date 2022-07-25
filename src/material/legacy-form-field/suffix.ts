/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive} from '@angular/core';
import {MAT_SUFFIX} from '@angular/material/form-field';

/** Suffix to be placed at the end of the form field. */
@Directive({
  selector: '[matSuffix]',
  providers: [{provide: MAT_SUFFIX, useExisting: MatLegacySuffix}],
})
export class MatLegacySuffix {}
