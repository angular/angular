/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {MatDefaultEnabledColumnResizeModule} from '@angular/material-experimental/column-resize';

import {DefaultEnabledColumnResizeExample} from './default-enabled-column-resize-example';

@NgModule({
  imports: [
    MatDefaultEnabledColumnResizeModule,
    MatTableModule,
  ],
  declarations: [DefaultEnabledColumnResizeExample],
  exports: [DefaultEnabledColumnResizeExample],
})
export class DefaultEnabledColumnResizeExampleModule {
}
