/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ScrollingModule as ExperimentalScrollingModule} from '@angular/cdk-experimental/scrolling';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {RouterModule} from '@angular/router';
import {VirtualScrollDemo} from './virtual-scroll-demo';

@NgModule({
  imports: [
    CommonModule,
    ExperimentalScrollingModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ScrollingModule,
    RouterModule.forChild([{path: '', component: VirtualScrollDemo}]),
  ],
  declarations: [VirtualScrollDemo],
})
export class VirtualScrollDemoModule {
}
