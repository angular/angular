/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive} from '@angular/core';
import {_MatAutocompleteOriginBase} from '@angular/material/autocomplete';

/**
 * Directive applied to an element to make it usable
 * as a connection point for an autocomplete panel.
 */
@Directive({
  selector: '[matAutocompleteOrigin]',
  exportAs: 'matAutocompleteOrigin',
})
export class MatLegacyAutocompleteOrigin extends _MatAutocompleteOriginBase {}
