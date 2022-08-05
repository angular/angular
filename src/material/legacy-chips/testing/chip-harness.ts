/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ContentContainerComponentHarness, HarnessPredicate, TestKey} from '@angular/cdk/testing';
import {MatLegacyChipAvatarHarness} from './chip-avatar-harness';
import {
  ChipAvatarHarnessFilters,
  ChipHarnessFilters,
  ChipRemoveHarnessFilters,
} from './chip-harness-filters';
import {MatLegacyChipRemoveHarness} from './chip-remove-harness';

/** Harness for interacting with a standard selectable Angular Material chip in tests. */
export class MatLegacyChipHarness extends ContentContainerComponentHarness {
  /** The selector for the host element of a `MatChip` instance. */
  static hostSelector = '.mat-chip';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatChipHarness` that meets
   * certain criteria.
   * @param options Options for filtering which chip instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: ChipHarnessFilters = {}): HarnessPredicate<MatLegacyChipHarness> {
    return new HarnessPredicate(MatLegacyChipHarness, options)
      .addOption('text', options.text, (harness, label) =>
        HarnessPredicate.stringMatches(harness.getText(), label),
      )
      .addOption(
        'selected',
        options.selected,
        async (harness, selected) => (await harness.isSelected()) === selected,
      );
  }

  /** Gets the text of the chip. */
  async getText(): Promise<string> {
    return (await this.host()).text({
      exclude: '.mat-chip-avatar, .mat-chip-trailing-icon, .mat-icon',
    });
  }

  /**
   * Whether the chip is selected.
   * @deprecated Use `MatChipOptionHarness.isSelected` instead.
   * @breaking-change 12.0.0
   */
  async isSelected(): Promise<boolean> {
    return (await this.host()).hasClass('mat-chip-selected');
  }

  /** Whether the chip is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await this.host()).hasClass('mat-chip-disabled');
  }

  /**
   * Selects the given chip. Only applies if it's selectable.
   * @deprecated Use `MatChipOptionHarness.select` instead.
   * @breaking-change 12.0.0
   */
  async select(): Promise<void> {
    if (!(await this.isSelected())) {
      await this.toggle();
    }
  }

  /**
   * Deselects the given chip. Only applies if it's selectable.
   * @deprecated Use `MatChipOptionHarness.deselect` instead.
   * @breaking-change 12.0.0
   */
  async deselect(): Promise<void> {
    if (await this.isSelected()) {
      await this.toggle();
    }
  }

  /**
   * Toggles the selected state of the given chip. Only applies if it's selectable.
   * @deprecated Use `MatChipOptionHarness.toggle` instead.
   * @breaking-change 12.0.0
   */
  async toggle(): Promise<void> {
    return (await this.host()).sendKeys(' ');
  }

  /** Removes the given chip. Only applies if it's removable. */
  async remove(): Promise<void> {
    await (await this.host()).sendKeys(TestKey.DELETE);
  }

  /**
   * Gets the remove button inside of a chip.
   * @param filter Optionally filters which remove buttons are included.
   */
  async getRemoveButton(
    filter: ChipRemoveHarnessFilters = {},
  ): Promise<MatLegacyChipRemoveHarness> {
    return this.locatorFor(MatLegacyChipRemoveHarness.with(filter))();
  }

  /**
   * Gets the avatar inside a chip.
   * @param filter Optionally filters which avatars are included.
   */
  async getAvatar(
    filter: ChipAvatarHarnessFilters = {},
  ): Promise<MatLegacyChipAvatarHarness | null> {
    return this.locatorForOptional(MatLegacyChipAvatarHarness.with(filter))();
  }
}
