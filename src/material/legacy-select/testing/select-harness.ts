/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessPredicate} from '@angular/cdk/testing';
import {_MatSelectHarnessBase} from '@angular/material/select/testing';
import {
  MatLegacyOptionHarness,
  MatLegacyOptgroupHarness,
  OptionHarnessFilters,
  OptgroupHarnessFilters,
} from '@angular/material/legacy-core/testing';
import {LegacySelectHarnessFilters} from './select-harness-filters';

/**
 * Harness for interacting with a standard mat-select in tests.
 * @deprecated Use `MatSelectHarness` from `@angular/material/select/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export class MatLegacySelectHarness extends _MatSelectHarnessBase<
  typeof MatLegacyOptionHarness,
  MatLegacyOptionHarness,
  OptionHarnessFilters,
  typeof MatLegacyOptgroupHarness,
  MatLegacyOptgroupHarness,
  OptgroupHarnessFilters
> {
  static hostSelector = '.mat-select';
  protected _prefix = 'mat';
  protected _optionClass = MatLegacyOptionHarness;
  protected _optionGroupClass = MatLegacyOptgroupHarness;

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatSelectHarness` that meets
   * certain criteria.
   * @param options Options for filtering which select instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: LegacySelectHarnessFilters = {}): HarnessPredicate<MatLegacySelectHarness> {
    return new HarnessPredicate(MatLegacySelectHarness, options);
  }
}
