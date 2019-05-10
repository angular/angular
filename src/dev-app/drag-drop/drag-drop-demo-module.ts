/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DragDropModule} from '@angular/cdk/drag-drop';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import {RouterModule} from '@angular/router';
import {DragAndDropDemo} from './drag-drop-demo';

@NgModule({
  imports: [
    CommonModule,
    DragDropModule,
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    RouterModule.forChild([{path: '', component: DragAndDropDemo}]),
  ],
  declarations: [DragAndDropDemo],
})
export class DragDropDemoModule {
}
