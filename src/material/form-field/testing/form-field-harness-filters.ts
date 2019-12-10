/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BaseHarnessFilters} from '@angular/cdk/testing';

/** A set of criteria that can be used to filter a list of `MatFormFieldHarness` instances. */
export interface FormFieldHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the text of the form field's floating label. */
  floatingLabelText?: string | RegExp;
  /** Filters based on whether the form field has error messages. */
  hasErrors?: boolean;
}
