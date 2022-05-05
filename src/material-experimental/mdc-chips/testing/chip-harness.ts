/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ComponentHarnessConstructor,
  ContentContainerComponentHarness,
  HarnessPredicate,
  TestKey,
} from '@angular/cdk/testing';
import {MatChipAvatarHarness} from './chip-avatar-harness';
import {
  ChipAvatarHarnessFilters,
  ChipHarnessFilters,
  ChipRemoveHarnessFilters,
} from './chip-harness-filters';
import {MatChipRemoveHarness} from './chip-remove-harness';

/** Harness for interacting with a mat-chip in tests. */
export class MatChipHarness extends ContentContainerComponentHarness {
  protected _primaryAction = this.locatorFor('.mdc-evolution-chip__action--primary');

  static hostSelector = '.mat-mdc-basic-chip, .mat-mdc-chip';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a chip with specific attributes.
   * @param options Options for narrowing the search.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatChipHarness>(
    this: ComponentHarnessConstructor<T>,
    options: ChipHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options).addOption('text', options.text, (harness, label) => {
      return HarnessPredicate.stringMatches(harness.getText(), label);
    });
  }

  /** Gets a promise for the text content the option. */
  async getText(): Promise<string> {
    return (await this.host()).text({
      exclude: '.mat-mdc-chip-avatar, .mat-mdc-chip-trailing-icon, .mat-icon',
    });
  }

  /** Whether the chip is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await this.host()).hasClass('mat-mdc-chip-disabled');
  }

  /** Delete a chip from the set. */
  async remove(): Promise<void> {
    const hostEl = await this.host();
    await hostEl.sendKeys(TestKey.DELETE);
  }

  /**
   * Gets the remove button inside of a chip.
   * @param filter Optionally filters which chips are included.
   */
  async getRemoveButton(filter: ChipRemoveHarnessFilters = {}): Promise<MatChipRemoveHarness> {
    return this.locatorFor(MatChipRemoveHarness.with(filter))();
  }

  /**
   * Gets the avatar inside a chip.
   * @param filter Optionally filters which avatars are included.
   */
  async getAvatar(filter: ChipAvatarHarnessFilters = {}): Promise<MatChipAvatarHarness | null> {
    return this.locatorForOptional(MatChipAvatarHarness.with(filter))();
  }
}
