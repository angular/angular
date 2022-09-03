/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {BaseHarnessFilters} from '@angular/cdk/testing';

/**
 * A set of criteria that can be used to filter a list of chip instances.
 * @deprecated Use `ChipHarnessFilters` from `@angular/material/chips/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export interface LegacyChipHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose text matches the given value. */
  text?: string | RegExp;
  /**
   * Only find chip instances whose selected state matches the given value.
   * @deprecated Use Legacy Chip Option Harness together with Legacy Chip Option Harness Filters.
   * @breaking-change 12.0.0
   */
  selected?: boolean;
}

/**
 * A set of criteria that can be used to filter a list of selectable chip instances.
 * @deprecated Use `ChipOptionHarnessFilters` from `@angular/material/chips/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export interface LegacyChipOptionHarnessFilters extends LegacyChipHarnessFilters {
  /** Only find chip instances whose selected state matches the given value. */
  selected?: boolean;
}

/**
 * A set of criteria that can be used to filter chip list instances.
 * @deprecated Use `ChipListHarnessFilters` from `@angular/material/chips/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export interface LegacyChipListHarnessFilters extends BaseHarnessFilters {}

/**
 * A set of criteria that can be used to filter selectable chip list instances.
 * @deprecated Use `ChipListboxHarnessFilters` from `@angular/material/chips/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export interface LegacyChipListboxHarnessFilters extends BaseHarnessFilters {}

/**
 * A set of criteria that can be used to filter a list of `MatChipListInputHarness` instances.
 * @deprecated Use `ChipInputHarnessFilters` from `@angular/material/chips/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export interface LegacyChipInputHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the value of the input. */
  value?: string | RegExp;
  /** Filters based on the placeholder text of the input. */
  placeholder?: string | RegExp;
}

/**
 * A set of criteria that can be used to filter a list of `MatChipRemoveHarness` instances.
 * @deprecated Use `ChipRemoveHarnessFilters` from `@angular/material/chips/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export interface LegacyChipRemoveHarnessFilters extends BaseHarnessFilters {}

/**
 * A set of criteria that can be used to filter a list of `MatChipAvatarHarness` instances.
 * @deprecated Use `ChipAvatarHarnessFilters` from `@angular/material/chips/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export interface LegacyChipAvatarHarnessFilters extends BaseHarnessFilters {}
