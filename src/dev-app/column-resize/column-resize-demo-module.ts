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
  DefaultEnabledColumnResizeExampleModule,
  DefaultEnabledColumnResizeFlexExampleModule,
  OptInColumnResizeExampleModule,
} from '@angular/components-examples/material-experimental/column-resize';

@NgModule({
  imports: [
    MatExpansionModule,

    // TODO(crisbeto): currently the column resize is set up so that users import different
    // modules depending on whether they want resizing to be enabled by default. This forces us
    // to keep each example in its own module and import it separately, otherwise the default
    // enabled module will override the opt-in one. Once we refactor it so we only have one
    // set of directives, we should consolidate this into a single module.
    DefaultEnabledColumnResizeExampleModule,
    DefaultEnabledColumnResizeFlexExampleModule,
    OptInColumnResizeExampleModule,
    RouterModule.forChild([{path: '', component: ColumnResizeHome}]),
  ],
  declarations: [ColumnResizeHome],
})
export class ColumnResizeDemoModule {}
