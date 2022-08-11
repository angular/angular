/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BaseHarnessFilters} from '@angular/cdk/testing';

export interface ListHarnessFilters extends BaseHarnessFilters {}

export interface ActionListHarnessFilters extends BaseHarnessFilters {}

export interface NavListHarnessFilters extends BaseHarnessFilters {}

export interface SelectionListHarnessFilters extends BaseHarnessFilters {}

export interface BaseListItemHarnessFilters extends BaseHarnessFilters {
  text?: string | RegExp;
}

export interface ListItemHarnessFilters extends BaseListItemHarnessFilters {}

export interface ActionListItemHarnessFilters extends BaseListItemHarnessFilters {}

export interface NavListItemHarnessFilters extends BaseListItemHarnessFilters {
  href?: string | RegExp | null;
}

export interface ListOptionHarnessFilters extends BaseListItemHarnessFilters {
  selected?: boolean;
}

export interface SubheaderHarnessFilters extends BaseHarnessFilters {
  text?: string | RegExp;
}
