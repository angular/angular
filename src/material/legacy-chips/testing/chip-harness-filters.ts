/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {BaseHarnessFilters} from '@angular/cdk/testing';

/** A set of criteria that can be used to filter a list of chip instances. */
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

/** A set of criteria that can be used to filter a list of selectable chip instances. */
export interface LegacyChipOptionHarnessFilters extends LegacyChipHarnessFilters {
  /** Only find chip instances whose selected state matches the given value. */
  selected?: boolean;
}

/** A set of criteria that can be used to filter chip list instances. */
export interface LegacyChipListHarnessFilters extends BaseHarnessFilters {}

/** A set of criteria that can be used to filter selectable chip list instances. */
export interface LegacyChipListboxHarnessFilters extends BaseHarnessFilters {}

/** A set of criteria that can be used to filter a list of `MatChipListInputHarness` instances. */
export interface LegacyChipInputHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the value of the input. */
  value?: string | RegExp;
  /** Filters based on the placeholder text of the input. */
  placeholder?: string | RegExp;
}

/** A set of criteria that can be used to filter a list of `MatChipRemoveHarness` instances. */
export interface LegacyChipRemoveHarnessFilters extends BaseHarnessFilters {}

/** A set of criteria that can be used to filter a list of `MatChipAvatarHarness` instances. */
export interface LegacyChipAvatarHarnessFilters extends BaseHarnessFilters {}
