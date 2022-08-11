/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarnessConstructor, HarnessPredicate, parallel} from '@angular/cdk/testing';
import {MatListOptionCheckboxPosition} from '@angular/material/list';
import {MatListHarnessBase} from './list-harness-base';
import {
  ListItemHarnessFilters,
  ListOptionHarnessFilters,
  SelectionListHarnessFilters,
} from './list-harness-filters';
import {getListItemPredicate, MatListItemHarnessBase} from './list-item-harness-base';

/** Harness for interacting with a MDC_based selection-list in tests. */
export class MatSelectionListHarness extends MatListHarnessBase<
  typeof MatListOptionHarness,
  MatListOptionHarness,
  ListOptionHarnessFilters
> {
  /** The selector for the host element of a `MatSelectionList` instance. */
  static hostSelector = '.mat-mdc-selection-list';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a selection list with specific
   * attributes.
   * @param options Options for filtering which selection list instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatSelectionListHarness>(
    this: ComponentHarnessConstructor<T>,
    options: SelectionListHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options);
  }

  override _itemHarness = MatListOptionHarness;

  /** Whether the selection list is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await (await this.host()).getAttribute('aria-disabled')) === 'true';
  }

  /**
   * Selects all items matching any of the given filters.
   * @param filters Filters that specify which items should be selected.
   */
  async selectItems(...filters: ListOptionHarnessFilters[]): Promise<void> {
    const items = await this._getItems(filters);
    await parallel(() => items.map(item => item.select()));
  }

  /**
   * Deselects all items matching any of the given filters.
   * @param filters Filters that specify which items should be deselected.
   */
  async deselectItems(...filters: ListItemHarnessFilters[]): Promise<void> {
    const items = await this._getItems(filters);
    await parallel(() => items.map(item => item.deselect()));
  }

  /** Gets all items matching the given list of filters. */
  private async _getItems(filters: ListOptionHarnessFilters[]): Promise<MatListOptionHarness[]> {
    if (!filters.length) {
      return this.getItems();
    }
    const matches = await parallel(() =>
      filters.map(filter => this.locatorForAll(MatListOptionHarness.with(filter))()),
    );
    return matches.reduce((result, current) => [...result, ...current], []);
  }
}

/** Harness for interacting with a MDC-based list option. */
export class MatListOptionHarness extends MatListItemHarnessBase {
  /** The selector for the host element of a `MatListOption` instance. */
  static hostSelector = '.mat-mdc-list-option';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a list option with specific
   * attributes.
   * @param options Options for filtering which list option instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatListOptionHarness>(
    this: ComponentHarnessConstructor<T>,
    options: ListOptionHarnessFilters = {},
  ): HarnessPredicate<T> {
    return getListItemPredicate(this, options).addOption(
      'is selected',
      options.selected,
      async (harness, selected) => (await harness.isSelected()) === selected,
    );
  }

  private _beforeCheckbox = this.locatorForOptional('.mdc-list-item__start .mdc-checkbox');

  /** Gets the position of the checkbox relative to the list option content. */
  async getCheckboxPosition(): Promise<MatListOptionCheckboxPosition> {
    return (await this._beforeCheckbox()) !== null ? 'before' : 'after';
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
   * Puts the list option in a checked state by toggling it if it is currently
   * unchecked, or doing nothing if it is already checked.
   */
  async select() {
    if (!(await this.isSelected())) {
      return this.toggle();
    }
  }

  /**
   * Puts the list option in an unchecked state by toggling it if it is currently
   * checked, or doing nothing if it is already unchecked.
   */
  async deselect() {
    if (await this.isSelected()) {
      return this.toggle();
    }
  }
}
