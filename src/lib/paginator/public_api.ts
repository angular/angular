/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MdButtonModule} from '@angular/material/button';
import {MdSelectModule} from '@angular/material/select';
import {MdTooltipModule} from '@angular/material/tooltip';
import {MdPaginator} from './paginator';
import {MdPaginatorIntl} from './paginator-intl';


@NgModule({
  imports: [
    CommonModule,
    MdButtonModule,
    MdSelectModule,
    MdTooltipModule,
  ],
  exports: [MdPaginator],
  declarations: [MdPaginator],
  providers: [MdPaginatorIntl],
})
export class MdPaginatorModule {}


export * from './paginator';
export * from './paginator-intl';
