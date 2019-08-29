/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MatChipHarness} from './chip-harness';

/**
 * Harness for interacting with a mat-chip-option in tests.
 * @dynamic
 */
export class MatChipOptionHarness extends MatChipHarness {
  static hostSelector = 'mat-basic-chip-option, mat-chip-option';

  /** Gets a promise for the selected state. */
  async isSelected(): Promise<boolean> {
    return await ((await this.host()).getAttribute('aria-selected')) === 'true';
  }

  /** Gets a promise for the disabled state. */
  async isDisabled(): Promise<boolean> {
    return await ((await this.host()).getAttribute('aria-disabled')) === 'true';
  }
}
