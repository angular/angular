/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {BaseHarnessFilters} from '@angular/cdk/testing';

/** A set of criteria that can be used to filter a list of chip instances. */
export interface ChipHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose text matches the given value. */
  text?: string | RegExp;
  /**
   * Only find chip instances whose selected state matches the given value.
   * @deprecated Use `MatChipOptionHarness` together with `ChipOptionHarnessFilters`.
   * @breaking-change 12.0.0
   */
  selected?: boolean;
}

/** A set of criteria that can be used to filter a list of selectable chip instances. */
export interface ChipOptionHarnessFilters extends ChipHarnessFilters {
  /** Only find chip instances whose selected state matches the given value. */
  selected?: boolean;
}

/** A set of criteria that can be used to filter chip list instances. */
export interface ChipListHarnessFilters extends BaseHarnessFilters {}

/** A set of criteria that can be used to filter selectable chip list instances. */
export interface ChipListboxHarnessFilters extends BaseHarnessFilters {}

/** A set of criteria that can be used to filter a list of `MatChipListInputHarness` instances. */
export interface ChipInputHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the value of the input. */
  value?: string | RegExp;
  /** Filters based on the placeholder text of the input. */
  placeholder?: string | RegExp;
}

/** A set of criteria that can be used to filter a list of `MatChipRemoveHarness` instances. */
export interface ChipRemoveHarnessFilters extends BaseHarnessFilters {}

/** A set of criteria that can be used to filter a list of `MatChipAvatarHarness` instances. */
export interface ChipAvatarHarnessFilters extends BaseHarnessFilters {}
