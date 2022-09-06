/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessPredicate} from '@angular/cdk/testing';
import {
  MatLegacyCellHarness,
  MatLegacyFooterCellHarness,
  MatLegacyHeaderCellHarness,
} from './cell-harness';
import {_MatRowHarnessBase, RowHarnessFilters} from '@angular/material/table/testing';

/**
 * Harness for interacting with a standard Angular Material table row.
 * @deprecated Use `MatRowHarness` from `@angular/material/table/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export class MatLegacyRowHarness extends _MatRowHarnessBase<
  typeof MatLegacyCellHarness,
  MatLegacyCellHarness
> {
  /** The selector for the host element of a `MatRowHarness` instance. */
  static hostSelector = '.mat-row';
  protected _cellHarness = MatLegacyCellHarness;

  /**
   * Gets a `HarnessPredicate` that can be used to search for a table row with specific attributes.
   * @param options Options for narrowing the search
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: RowHarnessFilters = {}): HarnessPredicate<MatLegacyRowHarness> {
    return new HarnessPredicate(MatLegacyRowHarness, options);
  }
}

/**
 * Harness for interacting with a standard Angular Material table header row.
 * @deprecated Use `MatHeaderRowHarness` from `@angular/material/table/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export class MatLegacyHeaderRowHarness extends _MatRowHarnessBase<
  typeof MatLegacyHeaderCellHarness,
  MatLegacyHeaderCellHarness
> {
  /** The selector for the host element of a `MatHeaderRowHarness` instance. */
  static hostSelector = '.mat-header-row';
  protected _cellHarness = MatLegacyHeaderCellHarness;

  /**
   * Gets a `HarnessPredicate` that can be used to search for
   * a table header row with specific attributes.
   * @param options Options for narrowing the search
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: RowHarnessFilters = {}): HarnessPredicate<MatLegacyHeaderRowHarness> {
    return new HarnessPredicate(MatLegacyHeaderRowHarness, options);
  }
}

/**
 * Harness for interacting with a standard Angular Material table footer row.
 * @deprecated Use `MatFooterRowHarness` from `@angular/material/table/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export class MatLegacyFooterRowHarness extends _MatRowHarnessBase<
  typeof MatLegacyFooterCellHarness,
  MatLegacyFooterCellHarness
> {
  /** The selector for the host element of a `MatFooterRowHarness` instance. */
  static hostSelector = '.mat-footer-row';
  protected _cellHarness = MatLegacyFooterCellHarness;

  /**
   * Gets a `HarnessPredicate` that can be used to search for
   * a table footer row cell with specific attributes.
   * @param options Options for narrowing the search
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: RowHarnessFilters = {}): HarnessPredicate<MatLegacyFooterRowHarness> {
    return new HarnessPredicate(MatLegacyFooterRowHarness, options);
  }
}
