/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

function numToChar(num: number): string {
  return String.fromCharCode('a'.charCodeAt(0) + num);
}

function generateTableColumnNames(numColumns: number) {
  return Array(numColumns)
    .fill(null)
    .map((_, index) => numToChar(index));
}

function generateTableData(numRows: number, cols: string[]): Record<string, string>[] {
  return Array(numRows)
    .fill(null)
    .map((_, index) => generateTableDataRow(cols, `${index + 1}`));
}

function generateTableDataRow(cols: string[], value: string): Record<string, string> {
  return cols.reduce((rowData, columnName) => ({...rowData, [columnName]: value}), {});
}

export const fiveCols = generateTableColumnNames(5);
export const tenCols = generateTableColumnNames(10);
export const twentyCols = generateTableColumnNames(20);

export const tenRows = generateTableData(10, twentyCols);
export const oneHundredRows = generateTableData(100, twentyCols);
export const oneThousandRows = generateTableData(1000, twentyCols);
