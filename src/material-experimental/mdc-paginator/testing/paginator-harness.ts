/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarnessConstructor, HarnessPredicate} from '@angular/cdk/testing';
import {MatSelectHarness} from '@angular/material/select/testing';
import {
  PaginatorHarnessFilters,
  _MatPaginatorHarnessBase,
} from '@angular/material/paginator/testing';

/** Harness for interacting with an MDC-based mat-paginator in tests. */
export class MatPaginatorHarness extends _MatPaginatorHarnessBase {
  /** Selector used to find paginator instances. */
  static hostSelector = '.mat-mdc-paginator';
  protected _nextButton = this.locatorFor('.mat-mdc-paginator-navigation-next');
  protected _previousButton = this.locatorFor('.mat-mdc-paginator-navigation-previous');
  protected _firstPageButton = this.locatorForOptional('.mat-mdc-paginator-navigation-first');
  protected _lastPageButton = this.locatorForOptional('.mat-mdc-paginator-navigation-last');
  protected _select = this.locatorForOptional(
    MatSelectHarness.with({
      ancestor: '.mat-mdc-paginator-page-size',
    }),
  );
  protected _pageSizeFallback = this.locatorFor('.mat-mdc-paginator-page-size-value');
  protected _rangeLabel = this.locatorFor('.mat-mdc-paginator-range-label');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a paginator with specific attributes.
   * @param options Options for filtering which paginator instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatPaginatorHarness>(
    this: ComponentHarnessConstructor<T>,
    options: PaginatorHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options);
  }
}
