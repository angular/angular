/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {RowHarnessFilters, CellHarnessFilters} from './table-harness-filters';
import {MatCellHarness, MatHeaderCellHarness, MatFooterCellHarness} from './cell-harness';

/** Text extracted from a table row organized by columns. */
export interface MatRowHarnessColumnsText {
  [columnName: string]: string;
}

/** Harness for interacting with a standard Angular Material table row. */
export class MatRowHarness extends ComponentHarness {
  /** The selector for the host element of a `MatRowHarness` instance. */
  static hostSelector = '.mat-row';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a table row with specific attributes.
   * @param options Options for narrowing the search
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: RowHarnessFilters = {}): HarnessPredicate<MatRowHarness> {
    return new HarnessPredicate(MatRowHarness, options);
  }

  /** Gets a list of `MatCellHarness` for all cells in the row. */
  async getCells(filter: CellHarnessFilters = {}): Promise<MatCellHarness[]> {
    return this.locatorForAll(MatCellHarness.with(filter))();
  }

  /** Gets the text of the cells in the row. */
  async getCellTextByIndex(filter: CellHarnessFilters = {}): Promise<string[]> {
    return getCellTextByIndex(this, filter);
  }

  /** Gets the text inside the row organized by columns. */
  async getCellTextByColumnName(): Promise<MatRowHarnessColumnsText> {
    return getCellTextByColumnName(this);
  }
}

/** Harness for interacting with a standard Angular Material table header row. */
export class MatHeaderRowHarness extends ComponentHarness {
  /** The selector for the host element of a `MatHeaderRowHarness` instance. */
  static hostSelector = '.mat-header-row';

  /**
   * Gets a `HarnessPredicate` that can be used to search for
   * a table header row with specific attributes.
   * @param options Options for narrowing the search
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: RowHarnessFilters = {}): HarnessPredicate<MatHeaderRowHarness> {
    return new HarnessPredicate(MatHeaderRowHarness, options);
  }

  /** Gets a list of `MatHeaderCellHarness` for all cells in the row. */
  async getCells(filter: CellHarnessFilters = {}): Promise<MatHeaderCellHarness[]> {
    return this.locatorForAll(MatHeaderCellHarness.with(filter))();
  }

  /** Gets the text of the cells in the header row. */
  async getCellTextByIndex(filter: CellHarnessFilters = {}): Promise<string[]> {
    return getCellTextByIndex(this, filter);
  }

  /** Gets the text inside the header row organized by columns. */
  async getCellTextByColumnName(): Promise<MatRowHarnessColumnsText> {
    return getCellTextByColumnName(this);
  }
}


/** Harness for interacting with a standard Angular Material table footer row. */
export class MatFooterRowHarness extends ComponentHarness {
  /** The selector for the host element of a `MatFooterRowHarness` instance. */
  static hostSelector = '.mat-footer-row';

  /**
   * Gets a `HarnessPredicate` that can be used to search for
   * a table footer row cell with specific attributes.
   * @param options Options for narrowing the search
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: RowHarnessFilters = {}): HarnessPredicate<MatFooterRowHarness> {
    return new HarnessPredicate(MatFooterRowHarness, options);
  }

  /** Gets a list of `MatFooterCellHarness` for all cells in the row. */
  async getCells(filter: CellHarnessFilters = {}): Promise<MatFooterCellHarness[]> {
    return this.locatorForAll(MatFooterCellHarness.with(filter))();
  }

  /** Gets the text of the cells in the footer row. */
  async getCellTextByIndex(filter: CellHarnessFilters = {}): Promise<string[]> {
    return getCellTextByIndex(this, filter);
  }

  /** Gets the text inside the footer row organized by columns. */
  async getCellTextByColumnName(): Promise<MatRowHarnessColumnsText> {
    return getCellTextByColumnName(this);
  }
}


async function getCellTextByIndex(harness: {
  getCells: (filter?: CellHarnessFilters) => Promise<MatCellHarness[]>
}, filter: CellHarnessFilters): Promise<string[]> {
  const cells = await harness.getCells(filter);
  return Promise.all(cells.map(cell => cell.getText()));
}

async function getCellTextByColumnName(harness: {
  getCells: () => Promise<MatCellHarness[]>
}): Promise<MatRowHarnessColumnsText> {
  const output: MatRowHarnessColumnsText = {};
  const cells = await harness.getCells();
  const cellsData = await Promise.all(cells.map(cell => {
    return Promise.all([cell.getColumnName(), cell.getText()]);
  }));
  cellsData.forEach(([columnName, text]) => output[columnName] = text);
  return output;
}
