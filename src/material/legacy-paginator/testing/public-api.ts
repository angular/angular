/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {MatLegacyPaginatorHarness} from './paginator-harness';
export {
  /**
   * @deprecated Use `_MatPaginatorHarnessBase` from `@angular/material/paginator/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  _MatPaginatorHarnessBase as _MatLegacyPaginatorHarnessBase,

  /**
   * @deprecated Use `PaginatorHarnessFilters` from `@angular/material/paginator/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  PaginatorHarnessFilters as LegacyPaginatorHarnessFilters,
} from '@angular/material/paginator/testing';
