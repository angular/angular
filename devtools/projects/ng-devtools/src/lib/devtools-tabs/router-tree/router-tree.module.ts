/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSelectModule} from '@angular/material/select';

import {RouterTreeComponent} from './router-tree.component';

@NgModule({
  declarations: [RouterTreeComponent],
  imports: [CommonModule, MatDialogModule, MatSelectModule],
  exports: [RouterTreeComponent],
  entryComponents: [],
})
export class RouterTreeModule {
}
