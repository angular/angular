/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BaseHarnessFilters} from '@angular/cdk/testing';

// TODO(mmalerba): Add additional options that make sense for each harness type.

export interface ChipGridHarnessFilters extends BaseHarnessFilters {}

export interface ChipHarnessFilters extends BaseHarnessFilters {}

export interface ChipInputHarnessFilters extends BaseHarnessFilters {}

export interface ChipListboxHarnessFilters extends BaseHarnessFilters {}

export interface ChipOptionHarnessFilters extends ChipHarnessFilters {}

export interface ChipRowHarnessFilters extends ChipHarnessFilters {}

export interface ChipSetHarnessFilters extends BaseHarnessFilters {}
