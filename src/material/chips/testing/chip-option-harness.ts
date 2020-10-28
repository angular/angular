/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessPredicate} from '@angular/cdk/testing';
import {MatChipHarness} from './chip-harness';
import {ChipOptionHarnessFilters} from './chip-harness-filters';

export class MatChipOptionHarness extends MatChipHarness {
  /** The selector for the host element of a selectable chip instance. */
  static hostSelector = '.mat-chip';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatChipOptionHarness`
   * that meets certain criteria.
   * @param options Options for filtering which chip instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: ChipOptionHarnessFilters = {}):
    HarnessPredicate<MatChipOptionHarness> {
    return new HarnessPredicate(MatChipOptionHarness, options)
        .addOption('text', options.text,
            (harness, label) => HarnessPredicate.stringMatches(harness.getText(), label))
        .addOption('selected', options.selected,
            async (harness, selected) => (await harness.isSelected()) === selected);
  }

  /** Whether the chip is selected. */
  async isSelected(): Promise<boolean> {
    return (await this.host()).hasClass('mat-chip-selected');
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

  /** Toggles the selected state of the given chip. */
  async toggle(): Promise<void> {
    return (await this.host()).sendKeys(' ');
  }
}
