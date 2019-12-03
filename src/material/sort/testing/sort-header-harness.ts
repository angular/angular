/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {SortDirection} from '@angular/material/sort';
import {SortHeaderHarnessFilters} from './sort-harness-filters';

/** Harness for interacting with a standard Angular Material sort header in tests. */
export class MatSortHeaderHarness extends ComponentHarness {
  static hostSelector = '.mat-sort-header';
  private _button = this.locatorFor('.mat-sort-header-button');

  /**
   * Gets a `HarnessPredicate` that can be used to
   * search for a sort header with specific attributes.
   */
  static with(options: SortHeaderHarnessFilters = {}): HarnessPredicate<MatSortHeaderHarness> {
    return new HarnessPredicate(MatSortHeaderHarness, options)
        .addOption('label', options.label,
            (harness, label) => HarnessPredicate.stringMatches(harness.getLabel(), label))
        .addOption('sortDirection', options.sortDirection, (harness, sortDirection) => {
          return HarnessPredicate.stringMatches(harness.getSortDirection(), sortDirection);
        });
  }

  /** Gets the label of the sort header. */
  async getLabel(): Promise<string> {
    return (await this._button()).text();
  }

  /** Gets the sorting direction of the header. */
  async getSortDirection(): Promise<SortDirection> {
    const host = await this.host();
    const ariaSort = await host.getAttribute('aria-sort');

    if (ariaSort === 'ascending') {
      return 'asc';
    } else if (ariaSort === 'descending') {
      return 'desc';
    }

    return '';
  }

  /** Gets the aria-label of the sort header. */
  async getAriaLabel(): Promise<string|null> {
    return (await this._button()).getAttribute('aria-label');
  }

  /** Gets whether the sort header is currently being sorted by. */
  async isActive(): Promise<boolean> {
    return !!(await this.getSortDirection());
  }

  /** Whether the sort header is disabled. */
  async isDisabled(): Promise<boolean> {
    const button = await this._button();
    return (await button.getAttribute('disabled')) != null;
  }

  /** Clicks the header to change its sorting direction. Only works if the header is enabled. */
  async click(): Promise<void> {
    return (await this.host()).click();
  }
}
