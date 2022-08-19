/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {ThemePalette} from '@angular/material/core';
import {FormsModule} from '@angular/forms';
import {MatLegacyButtonModule} from '@angular/material/legacy-button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatLegacyCheckboxModule} from '@angular/material/legacy-checkbox';
import {MatLegacyProgressSpinnerModule} from '@angular/material/legacy-progress-spinner';

@Component({
  selector: 'progress-spinner-demo',
  templateUrl: 'progress-spinner-demo.html',
  styleUrls: ['progress-spinner-demo.css'],
  standalone: true,
  imports: [
    FormsModule,
    MatLegacyButtonModule,
    MatButtonToggleModule,
    MatLegacyCheckboxModule,
    MatLegacyProgressSpinnerModule,
  ],
})
export class ProgressSpinnerDemo {
  progressValue = 60;
  color: ThemePalette = 'primary';
  isDeterminate = true;

  step(val: number) {
    this.progressValue = Math.max(0, Math.min(100, val + this.progressValue));
  }
}
