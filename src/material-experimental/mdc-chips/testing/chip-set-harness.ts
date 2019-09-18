/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {MatChipHarness} from './chip-harness';
import {ChipSetHarnessFilters} from './chip-harness-filters';

/**
 * Harness for interacting with a mat-chip-set in tests.
 * @dynamic
 */
export class MatChipSetHarness extends ComponentHarness {
  static hostSelector = 'mat-chip-set';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a chip set with specific attributes.
   */
  static with(options: ChipSetHarnessFilters = {}): HarnessPredicate<MatChipSetHarness> {
    return new HarnessPredicate(MatChipSetHarness, options);
  }

  private _chips = this.locatorForAll(MatChipHarness);

  /** Gets promise of the harnesses for the chips. */
  async getChips(): Promise<MatChipHarness[]> {
    return await this._chips();
  }
}
