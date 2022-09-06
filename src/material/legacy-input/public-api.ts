/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {MatLegacyInput} from './input';
export {MatLegacyInputModule} from './input-module';
export {
  /**
   * @deprecated Use `MAT_INPUT_VALUE_ACCESSOR` from `@angular/material/input` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_INPUT_VALUE_ACCESSOR as MAT_LEGACY_INPUT_VALUE_ACCESSOR,

  /**
   * @deprecated Use `getMatInputUnsupportedTypeError` from `@angular/material/input` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  getMatInputUnsupportedTypeError as getMatLegacyInputUnsupportedTypeError,
} from '@angular/material/input';
