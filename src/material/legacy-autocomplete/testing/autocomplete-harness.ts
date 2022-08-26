/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessPredicate} from '@angular/cdk/testing';
import {
  MatLegacyOptgroupHarness,
  MatLegacyOptionHarness,
  OptgroupHarnessFilters,
  OptionHarnessFilters,
} from '@angular/material/legacy-core/testing';
import {_MatAutocompleteHarnessBase} from '@angular/material/autocomplete/testing';
import {LegacyAutocompleteHarnessFilters} from './autocomplete-harness-filters';

/** Harness for interacting with a standard mat-autocomplete in tests. */
export class MatLegacyAutocompleteHarness extends _MatAutocompleteHarnessBase<
  typeof MatLegacyOptionHarness,
  MatLegacyOptionHarness,
  OptionHarnessFilters,
  typeof MatLegacyOptgroupHarness,
  MatLegacyOptgroupHarness,
  OptgroupHarnessFilters
> {
  protected _prefix = 'mat';
  protected _optionClass = MatLegacyOptionHarness;
  protected _optionGroupClass = MatLegacyOptgroupHarness;

  /** The selector for the host element of a `MatAutocomplete` instance. */
  static hostSelector = '.mat-autocomplete-trigger';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatAutocompleteHarness` that meets
   * certain criteria.
   * @param options Options for filtering which autocomplete instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(
    options: LegacyAutocompleteHarnessFilters = {},
  ): HarnessPredicate<MatLegacyAutocompleteHarness> {
    return new HarnessPredicate(MatLegacyAutocompleteHarness, options).addOption(
      'value',
      options.value,
      (harness, value) => HarnessPredicate.stringMatches(harness.getValue(), value),
    );
  }
}
