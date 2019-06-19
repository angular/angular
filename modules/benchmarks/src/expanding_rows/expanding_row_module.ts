/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {ExpandingRow} from './expanding_row';
import {ExpandingRowBlacklist} from './expanding_row_blacklist';
import {ExpandingRowDetailsCaption} from './expanding_row_details_caption';
import {ExpandingRowDetailsContent} from './expanding_row_details_content';
import {ExpandingRowHost} from './expanding_row_host';
import {ExpandingRowSummary} from './expanding_row_summary';

/** The main module for the cfc-expanding-row component. */
@NgModule({
  declarations: [
    ExpandingRow,
    ExpandingRowDetailsCaption,
    ExpandingRowDetailsContent,
    ExpandingRowHost,
    ExpandingRowSummary,
    ExpandingRowBlacklist,
  ],
  exports: [
    ExpandingRow,
    ExpandingRowDetailsCaption,
    ExpandingRowDetailsContent,
    ExpandingRowHost,
    ExpandingRowSummary,
    ExpandingRowBlacklist,
  ],
  imports: [
    CommonModule,
  ],
})
export class ExpandingRowModule {
}
