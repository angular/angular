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
import {ChipAvatarHarnessFilters} from './chip-harness-filters';

/** Harness for interacting with a standard Material chip avatar in tests. */
export class MatChipAvatarHarness extends ComponentHarness {
  static hostSelector = '.mat-mdc-chip-avatar';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a chip avatar with specific
   * attributes.
   * @param options Options for filtering which input instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatChipAvatarHarness>(
    this: ComponentHarnessConstructor<T>,
    options: ChipAvatarHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options);
  }
}
