/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate, parallel} from '@angular/cdk/testing';
import {MatLegacyChipHarness} from './chip-harness';
import {MatLegacyChipInputHarness} from './chip-input-harness';
import {
  ChipListHarnessFilters,
  ChipHarnessFilters,
  ChipInputHarnessFilters,
} from './chip-harness-filters';

/** Base class for chip list harnesses. */
export abstract class _MatChipListHarnessBase extends ComponentHarness {
  /** Gets whether the chip list is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await (await this.host()).getAttribute('aria-disabled')) === 'true';
  }

  /** Gets whether the chip list is required. */
  async isRequired(): Promise<boolean> {
    return (await (await this.host()).getAttribute('aria-required')) === 'true';
  }

  /** Gets whether the chip list is invalid. */
  async isInvalid(): Promise<boolean> {
    return (await (await this.host()).getAttribute('aria-invalid')) === 'true';
  }

  /** Gets whether the chip list is in multi selection mode. */
  async isMultiple(): Promise<boolean> {
    return (await (await this.host()).getAttribute('aria-multiselectable')) === 'true';
  }

  /** Gets whether the orientation of the chip list. */
  async getOrientation(): Promise<'horizontal' | 'vertical'> {
    const orientation = await (await this.host()).getAttribute('aria-orientation');
    return orientation === 'vertical' ? 'vertical' : 'horizontal';
  }
}

/** Harness for interacting with a standard chip list in tests. */
export class MatLegacyChipListHarness extends _MatChipListHarnessBase {
  /** The selector for the host element of a `MatChipList` instance. */
  static hostSelector = '.mat-chip-list';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatChipListHarness` that meets
   * certain criteria.
   * @param options Options for filtering which chip list instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: ChipListHarnessFilters = {}): HarnessPredicate<MatLegacyChipListHarness> {
    return new HarnessPredicate(MatLegacyChipListHarness, options);
  }

  /**
   * Gets the list of chips inside the chip list.
   * @param filter Optionally filters which chips are included.
   */
  async getChips(filter: ChipHarnessFilters = {}): Promise<MatLegacyChipHarness[]> {
    return this.locatorForAll(MatLegacyChipHarness.with(filter))();
  }

  /**
   * Selects a chip inside the chip list.
   * @param filter An optional filter to apply to the child chips.
   *    All the chips matching the filter will be selected.
   * @deprecated Use `MatChipListboxHarness.selectChips` instead.
   * @breaking-change 12.0.0
   */
  async selectChips(filter: ChipHarnessFilters = {}): Promise<void> {
    const chips = await this.getChips(filter);
    if (!chips.length) {
      throw Error(`Cannot find chip matching filter ${JSON.stringify(filter)}`);
    }
    await parallel(() => chips.map(chip => chip.select()));
  }

  /**
   * Gets the `MatChipInput` inside the chip list.
   * @param filter Optionally filters which chip input is included.
   */
  async getInput(filter: ChipInputHarnessFilters = {}): Promise<MatLegacyChipInputHarness> {
    // The input isn't required to be a descendant of the chip list so we have to look it up by id.
    const inputId = await (await this.host()).getAttribute('data-mat-chip-input');

    if (!inputId) {
      throw Error(`Chip list is not associated with an input`);
    }

    return this.documentRootLocatorFactory().locatorFor(
      MatLegacyChipInputHarness.with({...filter, selector: `#${inputId}`}),
    )();
  }
}
