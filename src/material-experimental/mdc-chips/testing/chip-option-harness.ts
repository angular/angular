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

/** Harness for interacting with a mat-chip-option in tests. */
export class MatChipOptionHarness extends MatChipHarness {
  static override hostSelector = '.mat-mdc-chip-option';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a chip option with specific
   * attributes.
   */
  // Note(mmalerba): generics are used as a workaround for lack of polymorphic `this` in static
  // methods. See https://github.com/microsoft/TypeScript/issues/5863
  static override with<T extends typeof MatChipHarness>(
    this: T,
    options: ChipOptionHarnessFilters = {},
  ): HarnessPredicate<InstanceType<T>> {
    return new HarnessPredicate(MatChipOptionHarness, options)
      .addOption('text', options.text, (harness, label) =>
        HarnessPredicate.stringMatches(harness.getText(), label),
      )
      .addOption(
        'selected',
        options.selected,
        async (harness, selected) => (await harness.isSelected()) === selected,
      ) as unknown as HarnessPredicate<InstanceType<T>>;
  }

  /** Whether the chip is selected. */
  async isSelected(): Promise<boolean> {
    return (await this.host()).hasClass('mat-mdc-chip-selected');
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
    return (await this._primaryAction()).click();
  }
}
