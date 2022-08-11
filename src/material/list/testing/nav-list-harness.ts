/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarnessConstructor, HarnessPredicate} from '@angular/cdk/testing';
import {MatListHarnessBase} from './list-harness-base';
import {NavListHarnessFilters, NavListItemHarnessFilters} from './list-harness-filters';
import {getListItemPredicate, MatListItemHarnessBase} from './list-item-harness-base';

/** Harness for interacting with a MDC-based mat-nav-list in tests. */
export class MatNavListHarness extends MatListHarnessBase<
  typeof MatNavListItemHarness,
  MatNavListItemHarness,
  NavListItemHarnessFilters
> {
  /** The selector for the host element of a `MatNavList` instance. */
  static hostSelector = '.mat-mdc-nav-list';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a nav list with specific
   * attributes.
   * @param options Options for filtering which nav list instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatNavListHarness>(
    this: ComponentHarnessConstructor<T>,
    options: NavListHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options);
  }

  override _itemHarness = MatNavListItemHarness;
}

/** Harness for interacting with a MDC-based nav-list item. */
export class MatNavListItemHarness extends MatListItemHarnessBase {
  /** The selector for the host element of a `MatListItem` instance. */
  static hostSelector = `${MatNavListHarness.hostSelector} .mat-mdc-list-item`;

  /**
   * Gets a `HarnessPredicate` that can be used to search for a nav list item with specific
   * attributes.
   * @param options Options for filtering which nav list item instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatNavListItemHarness>(
    this: ComponentHarnessConstructor<T>,
    options: NavListItemHarnessFilters = {},
  ): HarnessPredicate<T> {
    return getListItemPredicate(this, options)
      .addOption('href', options.href, async (harness, href) =>
        HarnessPredicate.stringMatches(harness.getHref(), href),
      )
      .addOption(
        'activated',
        options.activated,
        async (harness, activated) => (await harness.isActivated()) === activated,
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

  /** Whether the list item is activated. Should only be used for nav list items. */
  async isActivated(): Promise<boolean> {
    return (await this.host()).hasClass('mdc-list-item--activated');
  }
}
