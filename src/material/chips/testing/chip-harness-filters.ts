/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {BaseHarnessFilters} from '@angular/cdk/testing';

/** A set of criteria that can be used to filter a list of `MatChipHarness` instances. */
export interface ChipHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose text matches the given value. */
  text?: string | RegExp;
  /**
   * Only find chip instances whose selected state matches the given value.
   * @deprecated Will be moved into separate selection-specific harness.
   * @breaking-change 12.0.0
   */
  selected?: boolean;
}

/** A set of criteria that can be used to filter a list of `MatChipListHarness` instances. */
export interface ChipListHarnessFilters extends BaseHarnessFilters {}

/** A set of criteria that can be used to filter a list of `MatChipListInputHarness` instances. */
export interface ChipInputHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the value of the input. */
  value?: string | RegExp;
  /** Filters based on the placeholder text of the input. */
  placeholder?: string | RegExp;
}

/** A set of criteria that can be used to filter a list of `MatChipRemoveHarness` instances. */
export interface ChipRemoveHarnessFilters extends BaseHarnessFilters {}
