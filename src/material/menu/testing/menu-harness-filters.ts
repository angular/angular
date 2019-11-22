/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BaseHarnessFilters} from '@angular/cdk/testing';

/** A set of criteria that can be used to filter a list of `MatMenuHarness` instances. */
export interface MenuHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose trigger text matches the given value. */
  triggerText?: string | RegExp;
}

/** A set of criteria that can be used to filter a list of `MatMenuItemHarness` instances. */
export interface MenuItemHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose text matches the given value. */
  text?: string | RegExp;
  /** Only find instances that have a sub-menu. */
  hasSubmenu?: boolean;
}
