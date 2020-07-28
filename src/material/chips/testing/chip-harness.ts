/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate, TestKey} from '@angular/cdk/testing';
import {ChipHarnessFilters, ChipRemoveHarnessFilters} from './chip-harness-filters';
import {MatChipRemoveHarness} from './chip-remove-harness';

/** Harness for interacting with a standard Angular Material chip in tests. */
export class MatChipHarness extends ComponentHarness {
  /** The selector for the host element of a `MatChip` instance. */
  static hostSelector = '.mat-chip';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatChipHarness` that meets
   * certain criteria.
   * @param options Options for filtering which chip instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: ChipHarnessFilters = {}): HarnessPredicate<MatChipHarness> {
    return new HarnessPredicate(MatChipHarness, options)
        .addOption('text', options.text,
            (harness, label) => HarnessPredicate.stringMatches(harness.getText(), label))
        .addOption('selected', options.selected,
            async (harness, selected) => (await harness.isSelected()) === selected);
  }

  /** Gets the text of the chip. */
  async getText(): Promise<string> {
    return (await this.host()).text();
  }

  /** Whether the chip is selected. */
  async isSelected(): Promise<boolean> {
    return (await this.host()).hasClass('mat-chip-selected');
  }

  /** Whether the chip is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await this.host()).hasClass('mat-chip-disabled');
  }

  /** Selects the given chip. Only applies if it's selectable. */
  async select(): Promise<void> {
    if (!(await this.isSelected())) {
      await this.toggle();
    }
  }

  /** Deselects the given chip. Only applies if it's selectable. */
  async deselect(): Promise<void> {
    if (await this.isSelected()) {
      await this.toggle();
    }
  }

  /** Toggles the selected state of the given chip. Only applies if it's selectable. */
  async toggle(): Promise<void> {
    return (await this.host()).sendKeys(' ');
  }

  /** Removes the given chip. Only applies if it's removable. */
  async remove(): Promise<void> {
    await (await this.host()).sendKeys(TestKey.DELETE);
  }

  /**
   * Gets the remove button inside of a chip.
   * @param filter Optionally filters which chips are included.
   */
  async getRemoveButton(filter: ChipRemoveHarnessFilters = {}): Promise<MatChipRemoveHarness> {
    return this.locatorFor(MatChipRemoveHarness.with(filter))();
  }
}
