/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatLegacyButtonModule} from '@angular/material/legacy-button';
import {MatLegacyCheckboxModule} from '@angular/material/legacy-checkbox';
import {MatLegacyRadioModule} from '@angular/material/legacy-radio';

@Component({
  selector: 'legacy-radio-demo',
  templateUrl: 'legacy-radio-demo.html',
  styleUrls: ['legacy-radio-demo.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatLegacyButtonModule,
    MatLegacyCheckboxModule,
    MatLegacyRadioModule,
  ],
})
export class LegacyRadioDemo {
  isAlignEnd: boolean = false;
  isDisabled: boolean = false;
  isRequired: boolean = false;
  favoriteSeason: string = 'Autumn';
  seasonOptions = ['Winter', 'Spring', 'Summer', 'Autumn'];
}
