/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BaseHarnessFilters} from '@angular/cdk/testing';

/** A set of criteria that can be used to filter a list of `MatSlideToggleHarness` instances. */
export interface SlideToggleHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose label matches the given value. */
  label?: string | RegExp;
  /** Only find instances whose name is the given value. */
  name?: string;
}
