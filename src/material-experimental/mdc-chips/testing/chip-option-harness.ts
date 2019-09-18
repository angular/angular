/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessPredicate} from '@angular/cdk/testing';
import {MatChipHarness} from './chip-harness';
import {ChipOptionHarnessFilters} from './chip-harness-filters';

/**
 * Harness for interacting with a mat-chip-option in tests.
 * @dynamic
 */
export class MatChipOptionHarness extends MatChipHarness {
  static hostSelector = 'mat-basic-chip-option, mat-chip-option';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a chip option with specific
   * attributes.
   */
  // Note(mmalerba): generics are used as a workaround for lack of polymorphic `this` in static
  // methods. See https://github.com/microsoft/TypeScript/issues/5863
  static with<T extends typeof MatChipHarness>(
      this: T, options: ChipOptionHarnessFilters = {}): HarnessPredicate<InstanceType<T>> {
    return new HarnessPredicate(MatChipOptionHarness, options) as
        unknown as HarnessPredicate<InstanceType<T>>;
  }

  /** Gets a promise for the selected state. */
  async isSelected(): Promise<boolean> {
    return await ((await this.host()).getAttribute('aria-selected')) === 'true';
  }

  /** Gets a promise for the disabled state. */
  async isDisabled(): Promise<boolean> {
    return await ((await this.host()).getAttribute('aria-disabled')) === 'true';
  }
}
