/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness} from '../../component-harness';

export class FakeOverlayHarness extends ComponentHarness {
  static readonly hostSelector = '.fake-overlay';

  /** Gets the description of the fake overlay. */
  async getDescription(): Promise<string> {
    return (await this.host()).text();
  }
}
