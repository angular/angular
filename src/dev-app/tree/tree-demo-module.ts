/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CdkTreeModule} from '@angular/cdk/tree';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatTreeModule} from '@angular/material/tree';
import {RouterModule} from '@angular/router';

import {ExampleModule} from '../example/example-module';

import {ChecklistNestedTreeDemo} from './checklist-tree-demo/checklist-nested-tree-demo';
import {ChecklistTreeDemo} from './checklist-tree-demo/checklist-tree-demo';
import {DynamicTreeDemo} from './dynamic-tree-demo/dynamic-tree-demo';
import {LoadmoreTreeDemo} from './loadmore-tree-demo/loadmore-tree-demo';
import {TreeDemo} from './tree-demo';

@NgModule({
  imports: [
    CdkTreeModule,
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTreeModule,
    MatProgressBarModule,
    ExampleModule,
    RouterModule.forChild([{path: '', component: TreeDemo}]),
  ],
  declarations:
      [ChecklistNestedTreeDemo, ChecklistTreeDemo, TreeDemo, DynamicTreeDemo, LoadmoreTreeDemo],
})
export class TreeDemoModule {
}
