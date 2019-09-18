/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessPredicate} from '@angular/cdk/testing';
import {ChipRowHarnessFilters} from './chip-harness-filters';
import {MatChipHarness} from './chip-harness';

/**
 * Harness for interacting with a mat-chip-row in tests.
 * @dynamic
 */
export class MatChipRowHarness extends MatChipHarness {
  static hostSelector = 'mat-chip-row, mat-basic-chip-row';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a chip row with specific attributes.
   */
  // Note(mmalerba): generics are used as a workaround for lack of polymorphic `this` in static
  // methods. See https://github.com/microsoft/TypeScript/issues/5863
  static with<T extends typeof MatChipHarness>(
      this: T, options: ChipRowHarnessFilters = {}): HarnessPredicate<InstanceType<T>> {
    return new HarnessPredicate(MatChipRowHarness, options) as
        unknown as HarnessPredicate<InstanceType<T>>;
  }
}
