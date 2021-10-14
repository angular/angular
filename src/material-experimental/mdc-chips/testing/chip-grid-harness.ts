/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {
  ChipGridHarnessFilters,
  ChipInputHarnessFilters,
  ChipRowHarnessFilters,
} from './chip-harness-filters';
import {MatChipInputHarness} from './chip-input-harness';
import {MatChipRowHarness} from './chip-row-harness';

/** Harness for interacting with a mat-chip-grid in tests. */
export class MatChipGridHarness extends ComponentHarness {
  static hostSelector = '.mat-mdc-chip-grid';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a chip grid with specific attributes.
   */
  static with(options: ChipGridHarnessFilters = {}): HarnessPredicate<MatChipGridHarness> {
    return new HarnessPredicate(MatChipGridHarness, options);
  }

  /** Gets whether the chip grid is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await (await this.host()).getAttribute('aria-disabled')) === 'true';
  }

  /** Gets whether the chip grid is required. */
  async isRequired(): Promise<boolean> {
    return await (await this.host()).hasClass('mat-mdc-chip-list-required');
  }

  /** Gets whether the chip grid is invalid. */
  async isInvalid(): Promise<boolean> {
    return (await (await this.host()).getAttribute('aria-invalid')) === 'true';
  }

  /** Gets promise of the harnesses for the chip rows. */
  getRows(filter: ChipRowHarnessFilters = {}): Promise<MatChipRowHarness[]> {
    return this.locatorForAll(MatChipRowHarness.with(filter))();
  }

  /** Gets promise of the chip text input harness. */
  getInput(filter: ChipInputHarnessFilters = {}): Promise<MatChipInputHarness | null> {
    return this.locatorFor(MatChipInputHarness.with(filter))();
  }
}
