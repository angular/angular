/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {DividerHarnessFilters} from './divider-harness-filters';

/**
 * Harness for interacting with a `mat-divider`.
 * @dynamic
 */
export class MatDividerHarness extends ComponentHarness {
  static hostSelector = 'mat-divider';

  static with(options: DividerHarnessFilters = {}) {
    return new HarnessPredicate(MatDividerHarness, options);
  }

  async getOrientation(): Promise<'horizontal' | 'vertical'> {
    return (await this.host()).getAttribute('aria-orientation') as
        Promise<'horizontal' | 'vertical'>;
  }

  async isInset(): Promise<boolean> {
    return (await this.host()).hasClass('mat-divider-inset');
  }
}
