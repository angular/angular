/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive} from '@angular/core';
import {MAT_PREFIX} from '@angular/material/form-field';

/** Prefix to be placed in front of the form field. */
@Directive({
  selector: '[matPrefix]',
  providers: [{provide: MAT_PREFIX, useExisting: MatLegacyPrefix}],
})
export class MatLegacyPrefix {}
