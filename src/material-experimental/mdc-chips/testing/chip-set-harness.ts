/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ComponentHarnessConstructor,
  ComponentHarness,
  HarnessPredicate,
} from '@angular/cdk/testing';
import {MatChipHarness} from './chip-harness';
import {ChipHarnessFilters, ChipSetHarnessFilters} from './chip-harness-filters';

/** Harness for interacting with a mat-chip-set in tests. */
export class MatChipSetHarness extends ComponentHarness {
  static hostSelector = '.mat-mdc-chip-set';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a chip set with specific attributes.
   * @param options Options for filtering which chip set instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatChipSetHarness>(
    this: ComponentHarnessConstructor<T>,
    options: ChipSetHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options);
  }

  /** Gets promise of the harnesses for the chips. */
  async getChips(filter: ChipHarnessFilters = {}): Promise<MatChipHarness[]> {
    return await this.locatorForAll(MatChipHarness.with(filter))();
  }
}
