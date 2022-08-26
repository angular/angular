/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessPredicate} from '@angular/cdk/testing';
import {MatLegacyListHarnessBase} from './list-harness-base';
import {LegacyListHarnessFilters, LegacyListItemHarnessFilters} from './list-harness-filters';
import {getListItemPredicate, MatLegacyListItemHarnessBase} from './list-item-harness-base';

/** Harness for interacting with a standard mat-list in tests. */
export class MatLegacyListHarness extends MatLegacyListHarnessBase<
  typeof MatLegacyListItemHarness,
  MatLegacyListItemHarness,
  LegacyListItemHarnessFilters
> {
  /** The selector for the host element of a `MatList` instance. */
  static hostSelector = '.mat-list:not(mat-action-list)';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatListHarness` that meets certain
   * criteria.
   * @param options Options for filtering which list instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: LegacyListHarnessFilters = {}): HarnessPredicate<MatLegacyListHarness> {
    return new HarnessPredicate(MatLegacyListHarness, options);
  }

  override _itemHarness = MatLegacyListItemHarness;
}

/** Harness for interacting with a list item. */
export class MatLegacyListItemHarness extends MatLegacyListItemHarnessBase {
  /** The selector for the host element of a `MatListItem` instance. */
  static hostSelector = `${MatLegacyListHarness.hostSelector} .mat-list-item`;

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatListItemHarness` that meets
   * certain criteria.
   * @param options Options for filtering which list item instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(
    options: LegacyListItemHarnessFilters = {},
  ): HarnessPredicate<MatLegacyListItemHarness> {
    return getListItemPredicate(MatLegacyListItemHarness, options);
  }
}
