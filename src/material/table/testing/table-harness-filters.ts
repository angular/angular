/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {BaseHarnessFilters} from '@angular/cdk/testing';

/** A set of criteria that can be used to filter a list of cell harness instances. */
export interface CellHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose text matches the given value. */
  text?: string | RegExp;
}

/** A set of criteria that can be used to filter a list of row harness instances. */
export interface RowHarnessFilters extends BaseHarnessFilters {
}

/** A set of criteria that can be used to filter a list of table harness instances. */
export interface TableHarnessFilters extends BaseHarnessFilters {
}
