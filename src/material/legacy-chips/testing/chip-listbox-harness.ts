/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessPredicate, parallel} from '@angular/cdk/testing';
import {MatLegacyChipOptionHarness} from './chip-option-harness';
import {
  LegacyChipListboxHarnessFilters,
  LegacyChipOptionHarnessFilters,
} from './chip-harness-filters';
import {_MatChipListHarnessBase} from './chip-list-harness';

/**
 * Harness for interacting with a standard selectable chip list in tests.
 * @deprecated Use `MatChipListboxHarness` from `@angular/material/chips/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export class MatLegacyChipListboxHarness extends _MatChipListHarnessBase {
  /** The selector for the host element of a `MatChipList` instance. */
  static hostSelector = '.mat-chip-list';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatChipListHarness` that meets
   * certain criteria.
   * @param options Options for filtering which chip list instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(
    options: LegacyChipListboxHarnessFilters = {},
  ): HarnessPredicate<MatLegacyChipListboxHarness> {
    return new HarnessPredicate(MatLegacyChipListboxHarness, options);
  }

  /**
   * Gets the list of chips inside the chip list.
   * @param filter Optionally filters which chips are included.
   */
  async getChips(
    filter: LegacyChipOptionHarnessFilters = {},
  ): Promise<MatLegacyChipOptionHarness[]> {
    return this.locatorForAll(MatLegacyChipOptionHarness.with(filter))();
  }

  /**
   * Selects a chip inside the chip list.
   * @param filter An optional filter to apply to the child chips.
   *    All the chips matching the filter will be selected.
   */
  async selectChips(filter: LegacyChipOptionHarnessFilters = {}): Promise<void> {
    const chips = await this.getChips(filter);
    if (!chips.length) {
      throw Error(`Cannot find chip matching filter ${JSON.stringify(filter)}`);
    }
    await parallel(() => chips.map(chip => chip.select()));
  }
}
