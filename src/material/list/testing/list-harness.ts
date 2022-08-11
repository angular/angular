/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarnessConstructor, HarnessPredicate} from '@angular/cdk/testing';
import {MatListHarnessBase} from './list-harness-base';
import {ListHarnessFilters, ListItemHarnessFilters} from './list-harness-filters';
import {getListItemPredicate, MatListItemHarnessBase} from './list-item-harness-base';

/** Harness for interacting with a MDC-based list in tests. */
export class MatListHarness extends MatListHarnessBase<
  typeof MatListItemHarness,
  MatListItemHarness,
  ListItemHarnessFilters
> {
  /** The selector for the host element of a `MatList` instance. */
  static hostSelector = '.mat-mdc-list';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a list with specific attributes.
   * @param options Options for filtering which list instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatListHarness>(
    this: ComponentHarnessConstructor<T>,
    options: ListHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options);
  }

  override _itemHarness = MatListItemHarness;
}

/** Harness for interacting with a list item. */
export class MatListItemHarness extends MatListItemHarnessBase {
  /** The selector for the host element of a `MatListItem` instance. */
  static hostSelector = `${MatListHarness.hostSelector} .mat-mdc-list-item`;

  /**
   * Gets a `HarnessPredicate` that can be used to search for a list item with specific attributes.
   * @param options Options for filtering which list item instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatListItemHarness>(
    this: ComponentHarnessConstructor<T>,
    options: ListItemHarnessFilters = {},
  ): HarnessPredicate<T> {
    return getListItemPredicate(this, options);
  }
}
