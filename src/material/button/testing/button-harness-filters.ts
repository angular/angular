/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BaseHarnessFilters} from '@angular/cdk/testing';

/** Possible button appearances. */
export type ButtonVariant = 'basic' | 'raised' | 'flat' | 'icon' | 'stroked' | 'fab' | 'mini-fab';

/** A set of criteria that can be used to filter a list of button harness instances. */
export interface ButtonHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose text matches the given value. */
  text?: string | RegExp;

  /** Only find instances with a variant. */
  variant?: ButtonVariant;
}
