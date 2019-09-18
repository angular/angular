/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {ChipGridHarnessFilters} from './chip-harness-filters';
import {MatChipInputHarness} from './chip-input-harness';
import {MatChipRowHarness} from './chip-row-harness';

/**
 * Harness for interacting with a mat-chip-grid in tests.
 * @dynamic
 */
export class MatChipGridHarness extends ComponentHarness {
  static hostSelector = 'mat-chip-grid';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a chip grid with specific attributes.
   */
  static with(options: ChipGridHarnessFilters = {}): HarnessPredicate<MatChipGridHarness> {
    return new HarnessPredicate(MatChipGridHarness, options);
  }

  private _rows = this.locatorForAll(MatChipRowHarness);
  private _input = this.locatorFor(MatChipInputHarness);

  /** Gets promise of the harnesses for the chip rows. */
  async getRows(): Promise<MatChipRowHarness[]> {
    return await this._rows();
  }

  /** Gets promise of the chip text input harness. */
  async getTextInput(): Promise<MatChipInputHarness|null> {
    return await this._input();
  }
}
