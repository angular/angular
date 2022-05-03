/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Component} from '@angular/core';
import {CdkTreeModule} from '@angular/cdk/tree';
import {CommonModule} from '@angular/common';
import {CdkTreeExamplesModule} from '@angular/components-examples/cdk/tree';
import {TreeExamplesModule} from '@angular/components-examples/material/tree';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatTreeModule} from '@angular/material/tree';

@Component({
  selector: 'tree-demo',
  templateUrl: 'tree-demo.html',
  styleUrls: ['tree-demo.css'],
  standalone: true,
  imports: [
    CdkTreeModule,
    CdkTreeExamplesModule,
    CommonModule,
    FormsModule,
    TreeExamplesModule,
    MatButtonModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTreeModule,
    MatProgressBarModule,
  ],
})
export class TreeDemo {}
