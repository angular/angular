/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {
  DefaultEnabledColumnResizeExampleModule,
  DefaultEnabledColumnResizeFlexExampleModule,
  OptInColumnResizeExampleModule,
} from '@angular/components-examples/material-experimental/column-resize';
import {MatExpansionModule} from '@angular/material/expansion';

@Component({
  templateUrl: 'column-resize-home.html',
  standalone: true,
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
  ],
})
export class ColumnResizeHome {}
