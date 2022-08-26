/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessPredicate, ComponentHarness} from '@angular/cdk/testing';
import {LegacyChipRemoveHarnessFilters} from './chip-harness-filters';

/** Harness for interacting with a standard Material chip remove button in tests. */
export class MatLegacyChipRemoveHarness extends ComponentHarness {
  static hostSelector = '.mat-chip-remove';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatChipRemoveHarness` that meets
   * certain criteria.
   * @param options Options for filtering which input instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(
    options: LegacyChipRemoveHarnessFilters = {},
  ): HarnessPredicate<MatLegacyChipRemoveHarness> {
    return new HarnessPredicate(MatLegacyChipRemoveHarness, options);
  }

  /** Clicks the remove button. */
  async click(): Promise<void> {
    return (await this.host()).click();
  }
}
