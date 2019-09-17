/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BaseHarnessFilters} from '@angular/cdk/testing';

export interface RadioGroupHarnessFilters extends BaseHarnessFilters {
  name?: string;
}

export interface RadioButtonHarnessFilters extends BaseHarnessFilters {
  label?: string | RegExp;
  name?: string;
}
