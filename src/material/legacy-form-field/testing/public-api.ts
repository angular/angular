/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Re-export the base control harness from the "form-field/testing/control" entry-point. To
// avoid circular dependencies, harnesses for form-field controls (i.e. input, select)
// need to import the base form-field control harness through a separate entry-point.
export {MatFormFieldControlHarness as MatLegacyFormFieldControlHarness} from '@angular/material/form-field/testing/control';

export {LegacyFormFieldControlHarness, MatLegacyFormFieldHarness} from './form-field-harness';
export {FormFieldHarnessFilters as LegacyFormFieldHarnessFilters} from '@angular/material/form-field/testing';
