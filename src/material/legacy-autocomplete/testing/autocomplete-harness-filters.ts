/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BaseHarnessFilters} from '@angular/cdk/testing';

/**
 * A set of criteria that can be used to filter a list of `MatAutocompleteHarness` instances.
 * @deprecated Use `AutocompleteHarnessFilters` from `@angular/material/autocomplete/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export interface LegacyAutocompleteHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose associated input element matches the given value. */
  value?: string | RegExp;
}
