/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness} from '@angular/cdk/testing';
import {MatChipHarness} from './chip-harness';

/**
 * Harness for interacting with a mat-chip-set in tests.
 * @dynamic
 */
export class MatChipSetHarness extends ComponentHarness {
  static hostSelector = 'mat-chip-set';

  private _chips = this.locatorForAll(MatChipHarness);

  /** Gets promise of the harnesses for the chips. */
  async getChips(): Promise<MatChipHarness[]> {
    return await this._chips();
  }
}
