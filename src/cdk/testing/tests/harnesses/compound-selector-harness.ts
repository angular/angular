/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '../../component-harness';

export class CompoundSelectorHarness extends ComponentHarness {
  static readonly hostSelector = '.some-div, .some-span';

  static with(options = {}) {
    return new HarnessPredicate(CompoundSelectorHarness, options);
  }

  async getText(): Promise<string> {
    return (await this.host()).text();
  }
}
