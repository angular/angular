/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {ThemePalette} from '@angular/material/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

@Component({
  selector: 'progress-bar-demo',
  templateUrl: 'progress-bar-demo.html',
  styleUrls: ['progress-bar-demo.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatProgressBarModule,
    MatButtonModule,
    MatButtonToggleModule,
  ],
})
export class ProgressBarDemo {
  color: ThemePalette = 'primary';
  determinateProgressValue: number = 30;
  determinateAnimationEndValue: number;
  bufferAnimationEndValue: number;
  bufferProgressValue: number = 30;
  bufferBufferValue: number = 40;

  stepDeterminateProgressVal(val: number) {
    this.determinateProgressValue = this._clampValue(val + this.determinateProgressValue);
  }

  stepBufferProgressVal(val: number) {
    this.bufferProgressValue = this._clampValue(val + this.bufferProgressValue);
  }

  stepBufferBufferVal(val: number) {
    this.bufferBufferValue = this._clampValue(val + this.bufferBufferValue);
  }

  private _clampValue(value: number) {
    return Math.max(0, Math.min(100, value));
  }
}
