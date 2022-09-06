/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {LegacyFormFieldControlHarness, MatLegacyFormFieldHarness} from './form-field-harness';

// Re-export the base control harness from the "form-field/testing/control" entry-point. To
// avoid circular dependencies, harnesses for form-field controls (i.e. input, select)
// need to import the base form-field control harness through a separate entry-point.
export {
  /**
   * @deprecated Use `MatFormFieldControlHarness` from `@angular/material/form-field/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatFormFieldControlHarness as MatLegacyFormFieldControlHarness,
} from '@angular/material/form-field/testing/control';

export {
  /**
   * @deprecated Use `FormFieldHarnessFilters` from `@angular/material/form-field/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  FormFieldHarnessFilters as LegacyFormFieldHarnessFilters,
} from '@angular/material/form-field/testing';
