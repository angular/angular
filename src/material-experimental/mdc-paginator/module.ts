/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MAT_PAGINATOR_INTL_PROVIDER} from '@angular/material/paginator';
import {MatButtonModule} from '@angular/material-experimental/mdc-button';
import {MatSelectModule} from '@angular/material/select';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatPaginator} from './paginator';

@NgModule({
  imports: [CommonModule, MatButtonModule, MatSelectModule, MatTooltipModule],
  exports: [MatPaginator],
  declarations: [MatPaginator],
  providers: [MAT_PAGINATOR_INTL_PROVIDER],
})
export class MatPaginatorModule {}
