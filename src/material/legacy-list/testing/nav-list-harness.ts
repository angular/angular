/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessPredicate} from '@angular/cdk/testing';
import {MatLegacyListHarnessBase} from './list-harness-base';
import {LegacyNavListHarnessFilters, LegacyNavListItemHarnessFilters} from './list-harness-filters';
import {getListItemPredicate, MatLegacyListItemHarnessBase} from './list-item-harness-base';

/**
 * Harness for interacting with a standard mat-nav-list in tests.
 * @deprecated Use `MatNavListHarness` from `@angular/material/list/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export class MatLegacyNavListHarness extends MatLegacyListHarnessBase<
  typeof MatLegacyNavListItemHarness,
  MatLegacyNavListItemHarness,
  LegacyNavListItemHarnessFilters
> {
  /** The selector for the host element of a `MatNavList` instance. */
  static hostSelector = '.mat-nav-list';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatNavListHarness` that meets
   * certain criteria.
   * @param options Options for filtering which nav list instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(
    options: LegacyNavListHarnessFilters = {},
  ): HarnessPredicate<MatLegacyNavListHarness> {
    return new HarnessPredicate(MatLegacyNavListHarness, options);
  }

  override _itemHarness = MatLegacyNavListItemHarness;
}

/**
 * Harness for interacting with a nav list item.
 * @deprecated Use `MatNavListItemHarness` from `@angular/material/list/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export class MatLegacyNavListItemHarness extends MatLegacyListItemHarnessBase {
  /** The selector for the host element of a `MatListItem` instance. */
  static hostSelector = `${MatLegacyNavListHarness.hostSelector} .mat-list-item`;

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatNavListItemHarness` that
   * meets certain criteria.
   * @param options Options for filtering which nav list item instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(
    options: LegacyNavListItemHarnessFilters = {},
  ): HarnessPredicate<MatLegacyNavListItemHarness> {
    return getListItemPredicate(MatLegacyNavListItemHarness, options).addOption(
      'href',
      options.href,
      async (harness, href) => HarnessPredicate.stringMatches(harness.getHref(), href),
    );
  }

  /** Gets the href for this nav list item. */
  async getHref(): Promise<string | null> {
    return (await this.host()).getAttribute('href');
  }

  /** Clicks on the nav list item. */
  async click(): Promise<void> {
    return (await this.host()).click();
  }

  /** Focuses the nav list item. */
  async focus(): Promise<void> {
    return (await this.host()).focus();
  }

  /** Blurs the nav list item. */
  async blur(): Promise<void> {
    return (await this.host()).blur();
  }

  /** Whether the nav list item is focused. */
  async isFocused(): Promise<boolean> {
    return (await this.host()).isFocused();
  }
}
