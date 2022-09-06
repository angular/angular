/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {BaseHarnessFilters} from '@angular/cdk/testing';

/**
 * A set of criteria that can be used to filter a list of `MatTabHarness` instances.
 * @deprecated Use `TabHarnessFilters` from `@angular/material/tabs/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export interface LegacyTabHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose label matches the given value. */
  label?: string | RegExp;
}

/**
 * A set of criteria that can be used to filter a list of `MatTabGroupHarness` instances.
 * @deprecated Use `TabGroupHarnessFilters` from `@angular/material/tabs/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export interface LegacyTabGroupHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose selected tab label matches the given value. */
  selectedTabLabel?: string | RegExp;
}

/**
 * A set of criteria that can be used to filter a list of `MatTabLinkHarness` instances.
 * @deprecated Use `TabLinkHarnessFilters` from `@angular/material/tabs/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export interface LegacyTabLinkHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose label matches the given value. */
  label?: string | RegExp;
}

/**
 * A set of criteria that can be used to filter a list of `MatTabNavBarHarness` instances.
 * @deprecated Use `TabNavBarHarnessFilters` from `@angular/material/tabs/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export interface LegacyTabNavBarHarnessFilters extends BaseHarnessFilters {}

/**
 * A set of criteria that can be used to filter a list of `MatTabNavBarHarness` instances.
 * @deprecated Use `TabNavPanelHarnessFilters` from `@angular/material/tabs/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export interface LegacyTabNavPanelHarnessFilters extends BaseHarnessFilters {}
