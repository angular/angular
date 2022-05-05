/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MatChipHarness} from './chip-harness';

// TODO(crisbeto): add harness for the chip edit input inside the row.

/** Harness for interacting with a mat-chip-row in tests. */
export class MatChipRowHarness extends MatChipHarness {
  static override hostSelector = '.mat-mdc-chip-row';

  /** Whether the chip is editable. */
  async isEditable(): Promise<boolean> {
    return (await this.host()).hasClass('mat-mdc-chip-editable');
  }

  /** Whether the chip is currently being edited. */
  async isEditing(): Promise<boolean> {
    return (await this.host()).hasClass('mat-mdc-chip-editing');
  }
}
