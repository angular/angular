/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BaseHarnessFilters} from '@angular/cdk/testing';

/** Criteria that can be used to filter a list of `MatButtonToggleHarness` instances. */
export interface ButtonToggleHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose text matches the given value. */
  text?: string | RegExp;
  /** Only find instances whose name matches the given value. */
  name?: string | RegExp;
  /** Only find instances that are checked. */
  checked?: boolean;
}
