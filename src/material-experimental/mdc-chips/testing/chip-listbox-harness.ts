/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {ChipListboxHarnessFilters} from './chip-harness-filters';
import {MatChipOptionHarness} from './chip-option-harness';

/**
 * Harness for interacting with a mat-chip-listbox in tests.
 * @dynamic
 */
export class MatChipListboxHarness extends ComponentHarness {
  static hostSelector = 'mat-chip-listbox';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a chip listbox with specific
   * attributes.
   */
  static with(options: ChipListboxHarnessFilters = {}): HarnessPredicate<MatChipListboxHarness> {
    return new HarnessPredicate(MatChipListboxHarness, options);
  }

  private _options = this.locatorForAll(MatChipOptionHarness);

  /** Gets promise of the harnesses for the chip options in the listbox. */
  async getOptions(): Promise<MatChipOptionHarness[]> {
    return await this._options();
  }

  /** Gets promise of the selected options. */
  async getSelected(): Promise<MatChipOptionHarness[]> {
    const options = await this._options();
    return Promise.all(options.map(o => o.isSelected())).then(isSelectedStates => {
      const selectedOptions: MatChipOptionHarness[] = [];
      isSelectedStates.forEach((isSelectedOption, index) => {
        if (isSelectedOption) {
          selectedOptions.push(options[index]);
        }
      });
      return selectedOptions;
    });
  }
}
