/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessPredicate,
} from '@angular/cdk/testing';
import {ChipRemoveHarnessFilters} from './chip-harness-filters';

/** Harness for interacting with a standard Material chip remove button in tests. */
export class MatChipRemoveHarness extends ComponentHarness {
  static hostSelector = '.mat-mdc-chip-remove';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a chip remove with specific
   * attributes.
   * @param options Options for filtering which input instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatChipRemoveHarness>(
    this: ComponentHarnessConstructor<T>,
    options: ChipRemoveHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options);
  }

  /** Clicks the remove button. */
  async click(): Promise<void> {
    return (await this.host()).click();
  }
}
