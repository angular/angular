/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarnessConstructor, HarnessPredicate} from '@angular/cdk/testing';
import {
  MatCellHarness as BaseMatCellHarness,
  MatHeaderCellHarness as BaseMatHeaderCellHarness,
  MatFooterCellHarness as BaseMatFooterCellHarness,
  CellHarnessFilters,
} from '@angular/material/table/testing';

/** Harness for interacting with an MDC-based Angular Material table cell. */
export class MatCellHarness extends BaseMatCellHarness {
  /** The selector for the host element of a `MatCellHarness` instance. */
  static override hostSelector = '.mat-mdc-cell';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a table cell with specific attributes.
   * @param options Options for narrowing the search
   * @return a `HarnessPredicate` configured with the given options.
   */
  static override with<T extends MatCellHarness>(
    this: ComponentHarnessConstructor<T>,
    options: CellHarnessFilters = {},
  ): HarnessPredicate<T> {
    return BaseMatCellHarness._getCellPredicate(this, options);
  }
}

/** Harness for interacting with an MDC-based Angular Material table header cell. */
export class MatHeaderCellHarness extends BaseMatHeaderCellHarness {
  /** The selector for the host element of a `MatHeaderCellHarness` instance. */
  static override hostSelector = '.mat-mdc-header-cell';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a table header cell with specific
   * attributes.
   * @param options Options for narrowing the search
   * @return a `HarnessPredicate` configured with the given options.
   */
  static override with<T extends MatHeaderCellHarness>(
    this: ComponentHarnessConstructor<T>,
    options: CellHarnessFilters = {},
  ): HarnessPredicate<T> {
    return BaseMatHeaderCellHarness._getCellPredicate(this, options);
  }
}

/** Harness for interacting with an MDC-based Angular Material table footer cell. */
export class MatFooterCellHarness extends BaseMatFooterCellHarness {
  /** The selector for the host element of a `MatFooterCellHarness` instance. */
  static override hostSelector = '.mat-mdc-footer-cell';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a table footer cell with specific
   * attributes.
   * @param options Options for narrowing the search
   * @return a `HarnessPredicate` configured with the given options.
   */
  static override with<T extends MatFooterCellHarness>(
    this: ComponentHarnessConstructor<T>,
    options: CellHarnessFilters = {},
  ): HarnessPredicate<T> {
    return BaseMatFooterCellHarness._getCellPredicate(this, options);
  }
}
