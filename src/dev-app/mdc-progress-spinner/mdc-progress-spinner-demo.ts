/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {ThemePalette} from '@angular/material/core';
import {MatProgressSpinnerModule} from '@angular/material-experimental/mdc-progress-spinner';
import {MatButtonModule} from '@angular/material-experimental/mdc-button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'mdc-progress-spinner-demo',
  templateUrl: 'mdc-progress-spinner-demo.html',
  styleUrls: ['mdc-progress-spinner-demo.css'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    MatButtonToggleModule,
    FormsModule,
    MatProgressSpinnerModule,
  ],
})
export class MdcProgressSpinnerDemo {
  progressValue = 60;
  color: ThemePalette = 'primary';
  isDeterminate = true;

  step(val: number) {
    this.progressValue = Math.max(0, Math.min(100, val + this.progressValue));
  }
}
