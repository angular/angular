/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ExpandingRowModule} from './expanding_row_module';

import {BenchmarkableExpandingRow} from './benchmarkable_expanding_row';

@NgModule({
  declarations: [BenchmarkableExpandingRow],
  exports: [BenchmarkableExpandingRow],
  imports: [
    CommonModule,
    ExpandingRowModule,
  ],
})
export class BenchmarkableExpandingRowModule {
}
 