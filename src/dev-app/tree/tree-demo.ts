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
import {MatLegacyButtonModule} from '@angular/material/legacy-button';
import {MatLegacyCheckboxModule} from '@angular/material/legacy-checkbox';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatLegacyFormFieldModule} from '@angular/material/legacy-form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyInputModule} from '@angular/material/legacy-input';
import {MatLegacyProgressBarModule} from '@angular/material/legacy-progress-bar';
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
    MatLegacyButtonModule,
    MatExpansionModule,
    MatLegacyCheckboxModule,
    MatLegacyFormFieldModule,
    MatIconModule,
    MatLegacyInputModule,
    MatTreeModule,
    MatLegacyProgressBarModule,
  ],
})
export class TreeDemo {}
