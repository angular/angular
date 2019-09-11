/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness} from '@angular/cdk/testing';
import {MatChipRowHarness} from './chip-row-harness';
import {MatChipInputHarness} from './chip-input';

/**
 * Harness for interacting with a mat-chip-grid in tests.
 * @dynamic
 */
export class MatChipGridHarness extends ComponentHarness {
  static hostSelector = 'mat-chip-grid';

  private _rows = this.locatorForAll(MatChipRowHarness);
  private _input = this.locatorFor(MatChipInputHarness);

  /** Gets promise of the harnesses for the chip rows. */
  async getRows(): Promise<MatChipRowHarness[]> {
    return await this._rows();
  }

  /** Gets promise of the chip text input harness. */
  async getTextInput(): Promise<MatChipInputHarness|null> {
    return await this._input();
  }
}
