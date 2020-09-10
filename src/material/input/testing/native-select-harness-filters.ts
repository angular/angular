/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BaseHarnessFilters} from '@angular/cdk/testing';

/** A set of criteria that can be used to filter a list of `MatNativeSelectHarness` instances. */
export interface NativeSelectHarnessFilters extends BaseHarnessFilters {}

/** A set of criteria that can be used to filter a list of `MatNativeOptionHarness` instances. */
export interface NativeOptionHarnessFilters extends BaseHarnessFilters {
  text?: string | RegExp;
  index?: number;
  isSelected?: boolean;
}
