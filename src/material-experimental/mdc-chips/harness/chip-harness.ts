/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness} from '@angular/cdk-experimental/testing';

/**
 * Harness for interacting with a mat-chip in tests.
 * @dynamic
 */
export class MatChipHarness extends ComponentHarness {
  static hostSelector = 'mat-basic-chip, mat-chip';

  /** Gets a promise for the text content the option. */
  async getText(): Promise<string> {
    return (await this.host()).text();
  }
}
