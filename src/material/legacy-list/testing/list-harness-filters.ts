/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BaseHarnessFilters} from '@angular/cdk/testing';

/**
 * @deprecated Use `ListHarnessFilters` from `@angular/material/list/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export interface LegacyListHarnessFilters extends BaseHarnessFilters {}

/**
 * @deprecated Use `ActionListHarnessFilters` from `@angular/material/list/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export interface LegacyActionListHarnessFilters extends BaseHarnessFilters {}

/**
 * @deprecated Use `NavListHarnessFilters` from `@angular/material/list/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export interface LegacyNavListHarnessFilters extends BaseHarnessFilters {}

/**
 * @deprecated Use `SelectionListHarnessFilters` from `@angular/material/list/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export interface LegacySelectionListHarnessFilters extends BaseHarnessFilters {}

/**
 * @deprecated Use `BaseListItemHarnessFilters` from `@angular/material/list/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export interface LegacyBaseListItemHarnessFilters extends BaseHarnessFilters {
  text?: string | RegExp;
}

/**
 * @deprecated Use `ListItemHarnessFilters` from `@angular/material/list/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export interface LegacyListItemHarnessFilters extends LegacyBaseListItemHarnessFilters {}

/**
 * @deprecated Use `ActionListItemHarnessFilters` from `@angular/material/list/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export interface LegacyActionListItemHarnessFilters extends LegacyBaseListItemHarnessFilters {}

/**
 * @deprecated Use `NavListItemHarnessFilters` from `@angular/material/list/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export interface LegacyNavListItemHarnessFilters extends LegacyBaseListItemHarnessFilters {
  href?: string | RegExp | null;
}

/**
 * @deprecated Use `ListOptionHarnessFilters` from `@angular/material/list/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export interface LegacyListOptionHarnessFilters extends LegacyBaseListItemHarnessFilters {
  selected?: boolean;
}

/**
 * @deprecated Use `SubheaderHarnessFilters` from `@angular/material/list/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export interface LegacySubheaderHarnessFilters extends BaseHarnessFilters {
  text?: string | RegExp;
}
