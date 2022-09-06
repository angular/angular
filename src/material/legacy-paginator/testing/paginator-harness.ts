/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessPredicate} from '@angular/cdk/testing';
import {MatLegacySelectHarness} from '@angular/material/legacy-select/testing';
import {
  _MatPaginatorHarnessBase,
  PaginatorHarnessFilters,
} from '@angular/material/paginator/testing';

/**
 * Harness for interacting with a standard mat-paginator in tests.
 * @deprecated Use `MatPaginatorHarness` from `@angular/material/paginator/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export class MatLegacyPaginatorHarness extends _MatPaginatorHarnessBase {
  /** Selector used to find paginator instances. */
  static hostSelector = '.mat-paginator';
  protected _nextButton = this.locatorFor('.mat-paginator-navigation-next');
  protected _previousButton = this.locatorFor('.mat-paginator-navigation-previous');
  protected _firstPageButton = this.locatorForOptional('.mat-paginator-navigation-first');
  protected _lastPageButton = this.locatorForOptional('.mat-paginator-navigation-last');
  protected _select = this.locatorForOptional(
    MatLegacySelectHarness.with({
      ancestor: '.mat-paginator-page-size',
    }),
  );
  protected _pageSizeFallback = this.locatorFor('.mat-paginator-page-size-value');
  protected _rangeLabel = this.locatorFor('.mat-paginator-range-label');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatPaginatorHarness` that meets
   * certain criteria.
   * @param options Options for filtering which paginator instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: PaginatorHarnessFilters = {}): HarnessPredicate<MatLegacyPaginatorHarness> {
    return new HarnessPredicate(MatLegacyPaginatorHarness, options);
  }
}
