/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {ChipHarnessFilters} from './chip-harness-filters';

/**
 * Harness for interacting with a mat-chip in tests.
 * @dynamic
 */
export class MatChipHarness extends ComponentHarness {
  static hostSelector = 'mat-basic-chip, mat-chip';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a chip with specific attributes.
   */
  // Note(mmalerba): generics are used as a workaround for lack of polymorphic `this` in static
  // methods. See https://github.com/microsoft/TypeScript/issues/5863
  static with<T extends typeof MatChipHarness>(this: T, options: ChipHarnessFilters = {}):
      HarnessPredicate<InstanceType<T>> {
    return new HarnessPredicate(MatChipHarness, options) as
        unknown as HarnessPredicate<InstanceType<T>>;
  }

  /** Gets a promise for the text content the option. */
  async getText(): Promise<string> {
    return (await this.host()).text();
  }
}
