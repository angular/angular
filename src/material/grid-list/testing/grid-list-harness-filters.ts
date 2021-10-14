/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BaseHarnessFilters} from '@angular/cdk/testing';

/** A set of criteria that can be used to filter a list of `MatGridListHarness` instances. */
export interface GridListHarnessFilters extends BaseHarnessFilters {}

/** A set of criteria that can be used to filter a list of `MatTileHarness` instances. */
export interface GridTileHarnessFilters extends BaseHarnessFilters {
  /** Text the grid-tile header should match. */
  headerText?: string | RegExp;
  /** Text the grid-tile footer should match. */
  footerText?: string | RegExp;
}
