/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatLegacyCardModule} from '@angular/material/legacy-card';
import {MatLegacyCheckboxModule} from '@angular/material/legacy-checkbox';
import {MatLegacyFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule} from '@angular/material/legacy-input';
import {MatLegacyRadioModule} from '@angular/material/legacy-radio';
import {MatLegacySelectModule} from '@angular/material/legacy-select';
import {MatToolbarModule} from '@angular/material/toolbar';

@Component({
  selector: 'baseline-demo',
  templateUrl: 'baseline-demo.html',
  styleUrls: ['baseline-demo.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatLegacyCardModule,
    MatLegacyCheckboxModule,
    MatLegacyFormFieldModule,
    MatLegacyInputModule,
    MatLegacyRadioModule,
    MatLegacySelectModule,
    MatToolbarModule,
  ],
})
export class BaselineDemo {
  name: string;
}
