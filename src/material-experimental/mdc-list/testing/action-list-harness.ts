/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarnessConstructor, HarnessPredicate} from '@angular/cdk/testing';
import {MatListHarnessBase} from './list-harness-base';
import {ActionListHarnessFilters, ActionListItemHarnessFilters} from './list-harness-filters';
import {getListItemPredicate, MatListItemHarnessBase} from './list-item-harness-base';

/** Harness for interacting with a MDC-based action-list in tests. */
export class MatActionListHarness extends MatListHarnessBase<
  typeof MatActionListItemHarness,
  MatActionListItemHarness,
  ActionListItemHarnessFilters
> {
  /** The selector for the host element of a `MatActionList` instance. */
  static hostSelector = '.mat-mdc-action-list';

  /**
   * Gets a `HarnessPredicate` that can be used to search for an action list with specific
   * attributes.
   * @param options Options for filtering which action list instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatActionListHarness>(
    this: ComponentHarnessConstructor<T>,
    options: ActionListHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options);
  }

  override _itemHarness = MatActionListItemHarness;
}

/** Harness for interacting with an action list item. */
export class MatActionListItemHarness extends MatListItemHarnessBase {
  /** The selector for the host element of a `MatListItem` instance. */
  static hostSelector = `${MatActionListHarness.hostSelector} .mat-mdc-list-item`;

  /**
   * Gets a `HarnessPredicate` that can be used to search for a list item with specific
   * attributes.
   * @param options Options for filtering which action list item instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatActionListItemHarness>(
    this: ComponentHarnessConstructor<T>,
    options: ActionListItemHarnessFilters = {},
  ): HarnessPredicate<T> {
    return getListItemPredicate(this, options);
  }

  /** Clicks on the action list item. */
  async click(): Promise<void> {
    return (await this.host()).click();
  }

  /** Focuses the action list item. */
  async focus(): Promise<void> {
    return (await this.host()).focus();
  }

  /** Blurs the action list item. */
  async blur(): Promise<void> {
    return (await this.host()).blur();
  }

  /** Whether the action list item is focused. */
  async isFocused(): Promise<boolean> {
    return (await this.host()).isFocused();
  }
}
