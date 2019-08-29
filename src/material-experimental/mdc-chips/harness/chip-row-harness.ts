/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MatChipHarness} from './chip-harness';

/**
 * Harness for interacting with a mat-chip-row in tests.
 * @dynamic
 */
export class MatChipRowHarness extends MatChipHarness {
  static hostSelector = 'mat-chip-row, mat-basic-chip-row';
}
