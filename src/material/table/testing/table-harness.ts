/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {TableHarnessFilters, RowHarnessFilters} from './table-harness-filters';
import {
  MatRowHarness,
  MatHeaderRowHarness,
  MatFooterRowHarness,
  MatRowHarnessColumnsText,
} from './row-harness';

/** Text extracted from a table organized by columns. */
export interface MatTableHarnessColumnsText {
  [columnName: string]: {
    text: string[];
    headerText: string[];
    footerText: string[];
  };
}

/** Harness for interacting with a standard mat-table in tests. */
export class MatTableHarness extends ComponentHarness {
  /** The selector for the host element of a `MatTableHarness` instance. */
  static hostSelector = '.mat-table';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a table with specific attributes.
   * @param options Options for narrowing the search
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: TableHarnessFilters = {}): HarnessPredicate<MatTableHarness> {
    return new HarnessPredicate(MatTableHarness, options);
  }

  /** Gets all of the header rows in a table. */
  async getHeaderRows(filter: RowHarnessFilters = {}): Promise<MatHeaderRowHarness[]> {
    return this.locatorForAll(MatHeaderRowHarness.with(filter))();
  }

  /** Gets all of the regular data rows in a table. */
  async getRows(filter: RowHarnessFilters = {}): Promise<MatRowHarness[]> {
    return this.locatorForAll(MatRowHarness.with(filter))();
  }

  /** Gets all of the footer rows in a table. */
  async getFooterRows(filter: RowHarnessFilters = {}): Promise<MatFooterRowHarness[]> {
    return this.locatorForAll(MatFooterRowHarness.with(filter))();
  }

  /** Gets the text inside the entire table organized by rows. */
  async getCellTextByIndex(): Promise<string[][]> {
    const rows = await this.getRows();
    return Promise.all(rows.map(row => row.getCellTextByIndex()));
  }

  /** Gets the text inside the entire table organized by columns. */
  async getCellTextByColumnName(): Promise<MatTableHarnessColumnsText> {
    const [headerRows, footerRows, dataRows] = await Promise.all([
      this.getHeaderRows(),
      this.getFooterRows(),
      this.getRows()
    ]);

    const text: MatTableHarnessColumnsText = {};
    const [headerData, footerData, rowsData] = await Promise.all([
      Promise.all(headerRows.map(row => row.getCellTextByColumnName())),
      Promise.all(footerRows.map(row => row.getCellTextByColumnName())),
      Promise.all(dataRows.map(row => row.getCellTextByColumnName())),
    ]);

    rowsData.forEach(data => {
      Object.keys(data).forEach(columnName => {
        const cellText = data[columnName];

        if (!text[columnName]) {
          text[columnName] = {
            headerText: getCellTextsByColumn(headerData, columnName),
            footerText: getCellTextsByColumn(footerData, columnName),
            text: []
          };
        }

        text[columnName].text.push(cellText);
      });
    });

    return text;
  }
}

/** Extracts the text of cells only under a particular column. */
function getCellTextsByColumn(rowsData: MatRowHarnessColumnsText[], column: string): string[] {
  const columnTexts: string[] = [];

  rowsData.forEach(data => {
    Object.keys(data).forEach(columnName => {
      if (columnName === column) {
        columnTexts.push(data[columnName]);
      }
    });
  });

  return columnTexts;
}
