/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BaseHarnessFilters} from '@angular/cdk/testing';

export interface AccordionHarnessFilters extends BaseHarnessFilters {}

export interface ExpansionPanelHarnessFilters extends BaseHarnessFilters {
  title?: string | RegExp | null;
  description?: string | RegExp | null;
  content?: string | RegExp;
  expanded?: boolean;
  disabled?: boolean;
}
