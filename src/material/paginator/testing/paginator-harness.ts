/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AsyncFactoryFn,
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessPredicate,
  TestElement,
} from '@angular/cdk/testing';
import {MatSelectHarness} from '@angular/material/select/testing';
import {coerceNumberProperty} from '@angular/cdk/coercion';
import {PaginatorHarnessFilters} from './paginator-harness-filters';

export abstract class _MatPaginatorHarnessBase extends ComponentHarness {
  protected abstract _nextButton: AsyncFactoryFn<TestElement>;
  protected abstract _previousButton: AsyncFactoryFn<TestElement>;
  protected abstract _firstPageButton: AsyncFactoryFn<TestElement | null>;
  protected abstract _lastPageButton: AsyncFactoryFn<TestElement | null>;
  protected abstract _select: AsyncFactoryFn<
    | (ComponentHarness & {
        getValueText(): Promise<string>;
        clickOptions(...filters: unknown[]): Promise<void>;
      })
    | null
  >;
  protected abstract _pageSizeFallback: AsyncFactoryFn<TestElement>;
  protected abstract _rangeLabel: AsyncFactoryFn<TestElement>;

  /** Goes to the next page in the paginator. */
  async goToNextPage(): Promise<void> {
    return (await this._nextButton()).click();
  }

  /** Returns whether or not the next page button is disabled. */
  async isNextPageDisabled(): Promise<boolean> {
    const disabledValue = await (await this._nextButton()).getAttribute('disabled');
    return disabledValue == 'true';
  }

  /* Returns whether or not the previous page button is disabled. */
  async isPreviousPageDisabled(): Promise<boolean> {
    const disabledValue = await (await this._previousButton()).getAttribute('disabled');
    return disabledValue == 'true';
  }

  /** Goes to the previous page in the paginator. */
  async goToPreviousPage(): Promise<void> {
    return (await this._previousButton()).click();
  }

  /** Goes to the first page in the paginator. */
  async goToFirstPage(): Promise<void> {
    const button = await this._firstPageButton();

    // The first page button isn't enabled by default so we need to check for it.
    if (!button) {
      throw Error(
        'Could not find first page button inside paginator. ' +
          'Make sure that `showFirstLastButtons` is enabled.',
      );
    }

    return button.click();
  }

  /** Goes to the last page in the paginator. */
  async goToLastPage(): Promise<void> {
    const button = await this._lastPageButton();

    // The last page button isn't enabled by default so we need to check for it.
    if (!button) {
      throw Error(
        'Could not find last page button inside paginator. ' +
          'Make sure that `showFirstLastButtons` is enabled.',
      );
    }

    return button.click();
  }

  /**
   * Sets the page size of the paginator.
   * @param size Page size that should be select.
   */
  async setPageSize(size: number): Promise<void> {
    const select = await this._select();

    // The select is only available if the `pageSizeOptions` are
    // set to an array with more than one item.
    if (!select) {
      throw Error(
        'Cannot find page size selector in paginator. ' +
          'Make sure that the `pageSizeOptions` have been configured.',
      );
    }

    return select.clickOptions({text: `${size}`});
  }

  /** Gets the page size of the paginator. */
  async getPageSize(): Promise<number> {
    const select = await this._select();
    const value = select ? select.getValueText() : (await this._pageSizeFallback()).text();
    return coerceNumberProperty(await value);
  }

  /** Gets the text of the range labe of the paginator. */
  async getRangeLabel(): Promise<string> {
    return (await this._rangeLabel()).text();
  }
}

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
