/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarnessConstructor, HarnessPredicate} from '@angular/cdk/testing';
import {TableHarnessFilters, _MatTableHarnessBase} from '@angular/material/table/testing';
import {MatRowHarness, MatHeaderRowHarness, MatFooterRowHarness} from './row-harness';

/** Harness for interacting with an MDC-based mat-table in tests. */
export class MatTableHarness extends _MatTableHarnessBase<
  typeof MatHeaderRowHarness,
  MatHeaderRowHarness,
  typeof MatRowHarness,
  MatRowHarness,
  typeof MatFooterRowHarness,
  MatFooterRowHarness
> {
  /** The selector for the host element of a `MatTableHarness` instance. */
  static hostSelector = '.mat-mdc-table';
  protected _headerRowHarness = MatHeaderRowHarness;
  protected _rowHarness = MatRowHarness;
  protected _footerRowHarness = MatFooterRowHarness;

  /**
   * Gets a `HarnessPredicate` that can be used to search for a table with specific attributes.
   * @param options Options for narrowing the search
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatTableHarness>(
    this: ComponentHarnessConstructor<T>,
    options: TableHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options);
  }
}
