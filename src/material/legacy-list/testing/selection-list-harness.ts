/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessPredicate, parallel} from '@angular/cdk/testing';
import {MatLegacyListOptionCheckboxPosition} from '@angular/material/legacy-list';
import {MatLegacyListHarnessBase} from './list-harness-base';
import {
  LegacyListItemHarnessFilters,
  LegacyListOptionHarnessFilters,
  LegacySelectionListHarnessFilters,
} from './list-harness-filters';
import {getListItemPredicate, MatLegacyListItemHarnessBase} from './list-item-harness-base';

/**
 * Harness for interacting with a standard mat-selection-list in tests.
 * @deprecated Use `MatSelectionListHarness` from `@angular/material/list/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export class MatLegacySelectionListHarness extends MatLegacyListHarnessBase<
  typeof MatLegacyListOptionHarness,
  MatLegacyListOptionHarness,
  LegacyListOptionHarnessFilters
> {
  /** The selector for the host element of a `MatSelectionList` instance. */
  static hostSelector = '.mat-selection-list';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatSelectionListHarness` that meets
   * certain criteria.
   * @param options Options for filtering which selection list instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(
    options: LegacySelectionListHarnessFilters = {},
  ): HarnessPredicate<MatLegacySelectionListHarness> {
    return new HarnessPredicate(MatLegacySelectionListHarness, options);
  }

  override _itemHarness = MatLegacyListOptionHarness;

  /** Whether the selection list is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await (await this.host()).getAttribute('aria-disabled')) === 'true';
  }

  /**
   * Selects all items matching any of the given filters.
   * @param filters Filters that specify which items should be selected.
   */
  async selectItems(...filters: LegacyListOptionHarnessFilters[]): Promise<void> {
    const items = await this._getItems(filters);
    await parallel(() => items.map(item => item.select()));
  }

  /**
   * Deselects all items matching any of the given filters.
   * @param filters Filters that specify which items should be deselected.
   */
  async deselectItems(...filters: LegacyListItemHarnessFilters[]): Promise<void> {
    const items = await this._getItems(filters);
    await parallel(() => items.map(item => item.deselect()));
  }

  /** Gets all items matching the given list of filters. */
  private async _getItems(
    filters: LegacyListOptionHarnessFilters[],
  ): Promise<MatLegacyListOptionHarness[]> {
    if (!filters.length) {
      return this.getItems();
    }
    const matches = await parallel(() => {
      return filters.map(filter => this.locatorForAll(MatLegacyListOptionHarness.with(filter))());
    });
    return matches.reduce((result, current) => [...result, ...current], []);
  }
}

/**
 * Harness for interacting with a list option.
 * @deprecated Use `MatListOptionHarness` from `@angular/material/list/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export class MatLegacyListOptionHarness extends MatLegacyListItemHarnessBase {
  /** The selector for the host element of a `MatListOption` instance. */
  static hostSelector = '.mat-list-option';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatListOptionHarness` that
   * meets certain criteria.
   * @param options Options for filtering which list option instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(
    options: LegacyListOptionHarnessFilters = {},
  ): HarnessPredicate<MatLegacyListOptionHarness> {
    return getListItemPredicate(MatLegacyListOptionHarness, options).addOption(
      'is selected',
      options.selected,
      async (harness, selected) => (await harness.isSelected()) === selected,
    );
  }

  private _itemContent = this.locatorFor('.mat-list-item-content');

  /** Gets the position of the checkbox relative to the list option content. */
  async getCheckboxPosition(): Promise<MatLegacyListOptionCheckboxPosition> {
    return (await (await this._itemContent()).hasClass('mat-list-item-content-reverse'))
      ? 'after'
      : 'before';
  }

  /** Whether the list option is selected. */
  async isSelected(): Promise<boolean> {
    return (await (await this.host()).getAttribute('aria-selected')) === 'true';
  }

  /** Focuses the list option. */
  async focus(): Promise<void> {
    return (await this.host()).focus();
  }

  /** Blurs the list option. */
  async blur(): Promise<void> {
    return (await this.host()).blur();
  }

  /** Whether the list option is focused. */
  async isFocused(): Promise<boolean> {
    return (await this.host()).isFocused();
  }

  /** Toggles the checked state of the checkbox. */
  async toggle() {
    return (await this.host()).click();
  }

  /**
   * Puts the list option in a checked state by toggling it if it is currently unchecked, or doing
   * nothing if it is already checked.
   */
  async select() {
    if (!(await this.isSelected())) {
      return this.toggle();
    }
  }

  /**
   * Puts the list option in an unchecked state by toggling it if it is currently checked, or doing
   * nothing if it is already unchecked.
   */
  async deselect() {
    if (await this.isSelected()) {
      return this.toggle();
    }
  }
}
