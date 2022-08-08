/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {MatRadioModule} from '@angular/material/radio';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material-experimental/mdc-button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'mdc-radio-demo',
  templateUrl: 'mdc-radio-demo.html',
  styleUrls: ['mdc-radio-demo.css'],
  standalone: true,
  imports: [CommonModule, MatRadioModule, FormsModule, MatButtonModule, MatCheckboxModule],
})
export class MdcRadioDemo {
  isAlignEnd: boolean = false;
  isDisabled: boolean = false;
  isRequired: boolean = false;
  favoriteSeason: string = 'Autumn';
  seasonOptions = ['Winter', 'Spring', 'Summer', 'Autumn'];
}
