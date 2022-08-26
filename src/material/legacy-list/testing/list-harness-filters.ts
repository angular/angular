/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BaseHarnessFilters} from '@angular/cdk/testing';

export interface LegacyListHarnessFilters extends BaseHarnessFilters {}

export interface LegacyActionListHarnessFilters extends BaseHarnessFilters {}

export interface LegacyNavListHarnessFilters extends BaseHarnessFilters {}

export interface LegacySelectionListHarnessFilters extends BaseHarnessFilters {}

export interface LegacyBaseListItemHarnessFilters extends BaseHarnessFilters {
  text?: string | RegExp;
}

export interface LegacyListItemHarnessFilters extends LegacyBaseListItemHarnessFilters {}

export interface LegacyActionListItemHarnessFilters extends LegacyBaseListItemHarnessFilters {}

export interface LegacyNavListItemHarnessFilters extends LegacyBaseListItemHarnessFilters {
  href?: string | RegExp | null;
}

export interface LegacyListOptionHarnessFilters extends LegacyBaseListItemHarnessFilters {
  selected?: boolean;
}

export interface LegacySubheaderHarnessFilters extends BaseHarnessFilters {
  text?: string | RegExp;
}
