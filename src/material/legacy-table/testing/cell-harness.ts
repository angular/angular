/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessPredicate} from '@angular/cdk/testing';
import {_MatCellHarnessBase, CellHarnessFilters} from '@angular/material/table/testing';

/** Harness for interacting with a standard Angular Material table cell. */
export class MatLegacyCellHarness extends _MatCellHarnessBase {
  /** The selector for the host element of a `MatCellHarness` instance. */
  static hostSelector = '.mat-cell';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a table cell with specific attributes.
   * @param options Options for narrowing the search
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: CellHarnessFilters = {}): HarnessPredicate<MatLegacyCellHarness> {
    return _MatCellHarnessBase._getCellPredicate(this, options);
  }
}

/** Harness for interacting with a standard Angular Material table header cell. */
export class MatLegacyHeaderCellHarness extends _MatCellHarnessBase {
  /** The selector for the host element of a `MatHeaderCellHarness` instance. */
  static hostSelector = '.mat-header-cell';

  /**
   * Gets a `HarnessPredicate` that can be used to search for
   * a table header cell with specific attributes.
   * @param options Options for narrowing the search
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: CellHarnessFilters = {}): HarnessPredicate<MatLegacyHeaderCellHarness> {
    return _MatCellHarnessBase._getCellPredicate(this, options);
  }
}

/** Harness for interacting with a standard Angular Material table footer cell. */
export class MatLegacyFooterCellHarness extends _MatCellHarnessBase {
  /** The selector for the host element of a `MatFooterCellHarness` instance. */
  static hostSelector = '.mat-footer-cell';

  /**
   * Gets a `HarnessPredicate` that can be used to search for
   * a table footer cell with specific attributes.
   * @param options Options for narrowing the search
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: CellHarnessFilters = {}): HarnessPredicate<MatLegacyFooterCellHarness> {
    return _MatCellHarnessBase._getCellPredicate(this, options);
  }
}
