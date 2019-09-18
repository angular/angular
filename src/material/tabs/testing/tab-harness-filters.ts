/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {BaseHarnessFilters} from '@angular/cdk/testing';

export interface TabHarnessFilters extends BaseHarnessFilters {}

export interface TabGroupHarnessFilters extends BaseHarnessFilters {
  selectedTabLabel?: string | RegExp;
}
