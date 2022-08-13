/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material/core';
import {MatLegacyButtonModule} from '@angular/material/legacy-button';
import {MatLegacySelectModule} from '@angular/material/legacy-select';
import {MatLegacyTooltipModule} from '@angular/material/legacy-tooltip';
import {MatLegacyPaginator} from './paginator';
import {MAT_PAGINATOR_INTL_PROVIDER} from '@angular/material/paginator';

@NgModule({
  imports: [
    CommonModule,
    MatLegacyButtonModule,
    MatLegacySelectModule,
    MatLegacyTooltipModule,
    MatCommonModule,
  ],
  exports: [MatLegacyPaginator],
  declarations: [MatLegacyPaginator],
  providers: [MAT_PAGINATOR_INTL_PROVIDER],
})
export class MatLegacyPaginatorModule {}
