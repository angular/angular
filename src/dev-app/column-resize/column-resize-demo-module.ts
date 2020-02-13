/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MatExpansionModule} from '@angular/material/expansion';

import {ColumnResizeHome} from './column-resize-home';
import {
  DefaultEnabledColumnResizeDemoModule,
  DefaultEnabledColumnResizeFlexDemoModule,
  OptInColumnResizeDemoModule,
} from '@angular/components-examples/material-experimental/column-resize';

@NgModule({
  imports: [
    MatExpansionModule,
    DefaultEnabledColumnResizeDemoModule,
    DefaultEnabledColumnResizeFlexDemoModule,
    OptInColumnResizeDemoModule,
    RouterModule.forChild([{path: '', component: ColumnResizeHome}]),
  ],
  declarations: [ColumnResizeHome],
})
export class ColumnResizeDemoModule {
}
