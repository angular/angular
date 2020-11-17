/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {MatChipHarness} from './chip-harness';
import {ChipHarnessFilters, ChipSetHarnessFilters} from './chip-harness-filters';

/** Harness for interacting with a mat-chip-set in tests. */
export class MatChipSetHarness extends ComponentHarness {
  static hostSelector = '.mat-mdc-chip-set';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a chip set with specific attributes.
   */
  static with(options: ChipSetHarnessFilters = {}): HarnessPredicate<MatChipSetHarness> {
    return new HarnessPredicate(MatChipSetHarness, options);
  }

  /** Gets promise of the harnesses for the chips. */
  async getChips(filter: ChipHarnessFilters = {}): Promise<MatChipHarness[]> {
    return await this.locatorForAll(MatChipHarness.with(filter))();
  }
}
