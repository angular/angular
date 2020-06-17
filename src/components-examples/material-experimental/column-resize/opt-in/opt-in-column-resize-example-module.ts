/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {MatColumnResizeModule} from '@angular/material-experimental/column-resize';

import {OptInColumnResizeExample} from './opt-in-column-resize-example';

@NgModule({
  imports: [
    MatColumnResizeModule,
    MatTableModule,
  ],
  declarations: [OptInColumnResizeExample],
  exports: [OptInColumnResizeExample],
})
export class OptInColumnResizeExampleModule {
}
