/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarnessConstructor, HarnessPredicate} from '@angular/cdk/testing';
import {_MatSelectHarnessBase} from '@angular/material/select/testing';
import {
  MatOptionHarness,
  MatOptgroupHarness,
  OptionHarnessFilters,
  OptgroupHarnessFilters,
} from '@angular/material/core/testing';
import {SelectHarnessFilters} from './select-harness-filters';

/** Harness for interacting with an MDC-based mat-select in tests. */
export class MatSelectHarness extends _MatSelectHarnessBase<
  typeof MatOptionHarness,
  MatOptionHarness,
  OptionHarnessFilters,
  typeof MatOptgroupHarness,
  MatOptgroupHarness,
  OptgroupHarnessFilters
> {
  static hostSelector = '.mat-mdc-select';
  protected _prefix = 'mat-mdc';
  protected _optionClass = MatOptionHarness;
  protected _optionGroupClass = MatOptgroupHarness;

  /**
   * Gets a `HarnessPredicate` that can be used to search for a select with specific attributes.
   * @param options Options for filtering which select instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatSelectHarness>(
    this: ComponentHarnessConstructor<T>,
    options: SelectHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options);
  }
}
