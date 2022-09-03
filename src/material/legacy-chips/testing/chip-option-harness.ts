/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessPredicate} from '@angular/cdk/testing';
import {MatLegacyChipHarness} from './chip-harness';
import {LegacyChipOptionHarnessFilters} from './chip-harness-filters';

/**
 * @deprecated Use `MatChipOptionHarness` from `@angular/material/chips/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export class MatLegacyChipOptionHarness extends MatLegacyChipHarness {
  /** The selector for the host element of a selectable chip instance. */
  static override hostSelector = '.mat-chip';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatChipOptionHarness`
   * that meets certain criteria.
   * @param options Options for filtering which chip instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static override with(
    options: LegacyChipOptionHarnessFilters = {},
  ): HarnessPredicate<MatLegacyChipOptionHarness> {
    return new HarnessPredicate(MatLegacyChipOptionHarness, options)
      .addOption('text', options.text, (harness, label) =>
        HarnessPredicate.stringMatches(harness.getText(), label),
      )
      .addOption(
        'selected',
        options.selected,
        async (harness, selected) => (await harness.isSelected()) === selected,
      );
  }

  /** Whether the chip is selected. */
  override async isSelected(): Promise<boolean> {
    return (await this.host()).hasClass('mat-chip-selected');
  }

  /** Selects the given chip. Only applies if it's selectable. */
  override async select(): Promise<void> {
    if (!(await this.isSelected())) {
      await this.toggle();
    }
  }

  /** Deselects the given chip. Only applies if it's selectable. */
  override async deselect(): Promise<void> {
    if (await this.isSelected()) {
      await this.toggle();
    }
  }

  /** Toggles the selected state of the given chip. */
  override async toggle(): Promise<void> {
    return (await this.host()).sendKeys(' ');
  }
}
