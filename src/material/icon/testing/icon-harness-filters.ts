/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BaseHarnessFilters} from '@angular/cdk/testing';

/** Possible types of icons. */
export const enum IconType {
  SVG,
  FONT,
}

/** A set of criteria that can be used to filter a list of `MatIconHarness` instances. */
export interface IconHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the typef of the icon. */
  type?: IconType;
  /** Filters based on the name of the icon. */
  name?: string | RegExp;
  /** Filters based on the namespace of the icon. */
  namespace?: string | null | RegExp;
}
