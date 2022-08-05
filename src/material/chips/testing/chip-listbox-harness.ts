/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessPredicate,
  parallel,
} from '@angular/cdk/testing';
import {ChipListboxHarnessFilters, ChipOptionHarnessFilters} from './chip-harness-filters';
import {MatChipOptionHarness} from './chip-option-harness';

/** Harness for interacting with a mat-chip-listbox in tests. */
export class MatChipListboxHarness extends ComponentHarness {
  static hostSelector = '.mat-mdc-chip-listbox';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a chip listbox with specific
   * attributes.
   * @param options Options for narrowing the search.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatChipListboxHarness>(
    this: ComponentHarnessConstructor<T>,
    options: ChipListboxHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options);
  }

  /** Gets whether the chip listbox is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await (await this.host()).getAttribute('aria-disabled')) === 'true';
  }

  /** Gets whether the chip listbox is required. */
  async isRequired(): Promise<boolean> {
    return (await (await this.host()).getAttribute('aria-required')) === 'true';
  }

  /** Gets whether the chip listbox is in multi selection mode. */
  async isMultiple(): Promise<boolean> {
    return (await (await this.host()).getAttribute('aria-multiselectable')) === 'true';
  }

  /** Gets whether the orientation of the chip list. */
  async getOrientation(): Promise<'horizontal' | 'vertical'> {
    const orientation = await (await this.host()).getAttribute('aria-orientation');
    return orientation === 'vertical' ? 'vertical' : 'horizontal';
  }

  /**
   * Gets the list of chips inside the chip list.
   * @param filter Optionally filters which chips are included.
   */
  async getChips(filter: ChipOptionHarnessFilters = {}): Promise<MatChipOptionHarness[]> {
    return this.locatorForAll(MatChipOptionHarness.with(filter))();
  }

  /**
   * Selects a chip inside the chip list.
   * @param filter An optional filter to apply to the child chips.
   *    All the chips matching the filter will be selected.
   */
  async selectChips(filter: ChipOptionHarnessFilters = {}): Promise<void> {
    const chips = await this.getChips(filter);
    if (!chips.length) {
      throw Error(`Cannot find chip matching filter ${JSON.stringify(filter)}`);
    }
    await parallel(() => chips.map(chip => chip.select()));
  }
}
