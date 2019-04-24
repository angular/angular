/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatSortHeader} from './sort-header';
import {MatSort} from './sort';
import {MAT_SORT_HEADER_INTL_PROVIDER} from './sort-header-intl';
import {CommonModule} from '@angular/common';


@NgModule({
  imports: [CommonModule],
  exports: [MatSort, MatSortHeader],
  declarations: [MatSort, MatSortHeader],
  providers: [MAT_SORT_HEADER_INTL_PROVIDER]
})
export class MatSortModule {}
