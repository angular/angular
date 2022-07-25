/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {TooltipPosition, MatTooltipModule} from '@angular/material/tooltip';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material-experimental/mdc-button';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material-experimental/mdc-select';

@Component({
  selector: 'mdc-tooltip-demo',
  templateUrl: 'mdc-tooltip-demo.html',
  styleUrls: ['mdc-tooltip-demo.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTooltipModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
  ],
})
export class MdcTooltipDemo {
  message = new FormControl('Info about the action');
  showDelay = new FormControl(0);
  hideDelay = new FormControl(0);
  positionOptions: TooltipPosition[] = ['below', 'after', 'before', 'above', 'left', 'right'];
  position = new FormControl(this.positionOptions[0]);
}
