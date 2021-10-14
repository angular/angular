/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BaseHarnessFilters} from '@angular/cdk/testing';

/** A set of criteria that can be used to filter a list of tree harness instances */
export interface TreeHarnessFilters extends BaseHarnessFilters {}

/** A set of criteria that can be used to filter a list of node harness instances. */
export interface TreeNodeHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose text matches the given value. */
  text?: string | RegExp;

  /** Only find instances whose disabled state matches the given value. */
  disabled?: boolean;

  /** Only find instances whose expansion state matches the given value. */
  expanded?: boolean;

  /** Only find instances whose level matches the given value. */
  level?: number;
}
