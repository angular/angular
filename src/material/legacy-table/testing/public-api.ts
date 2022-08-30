/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {MatLegacyTableHarness} from './table-harness';
export {
  MatLegacyRowHarness,
  MatLegacyHeaderRowHarness,
  MatLegacyFooterRowHarness,
} from './row-harness';
export {
  MatLegacyCellHarness,
  MatLegacyHeaderCellHarness,
  MatLegacyFooterCellHarness,
} from './cell-harness';
export {
  CellHarnessFilters as LegacyCellHarnessFilters,
  RowHarnessFilters as LegacyRowHarnessFilters,
  TableHarnessFilters as LegacyTableHarnessFilters,
  MatRowHarnessColumnsText as MatLegacyRowHarnessColumnsText,
  MatTableHarnessColumnsText as MatLegacyTableHarnessColumnsText,
  _MatCellHarnessBase as _MatLegacyCellHarnessBase,
  _MatRowHarnessBase as _MatLegacyRowHarnessBase,
  _MatTableHarnessBase as _MatLegacyTableHarnessBase,
} from '@angular/material/table/testing';
