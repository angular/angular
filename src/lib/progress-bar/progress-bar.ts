/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ChangeDetectionStrategy, Input, ViewEncapsulation} from '@angular/core';

// TODO(josephperrott): Benchpress tests.
// TODO(josephperrott): Add ARIA attributes for progressbar "for".


/**
 * <mat-progress-bar> component.
 */
@Component({
  moduleId: module.id,
  selector: 'mat-progress-bar',
  host: {
    'role': 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    '[attr.aria-valuenow]': 'value',
    '[attr.mode]': 'mode',
    '[class.mat-primary]': 'color == "primary"',
    '[class.mat-accent]': 'color == "accent"',
    '[class.mat-warn]': 'color == "warn"',
    'class': 'mat-progress-bar',
  },
  templateUrl: 'progress-bar.html',
  styleUrls: ['progress-bar.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class MatProgressBar {
  /** Color of the progress bar. */
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';

  private _value: number = 0;

  /** Value of the progressbar. Defaults to zero. Mirrored to aria-valuenow. */
  @Input()
  get value() { return this._value; }
  set value(v: number) { this._value = clamp(v || 0); }

  private _bufferValue: number = 0;

  /** Buffer value of the progress bar. Defaults to zero. */
  @Input()
  get bufferValue() { return this._bufferValue; }
  set bufferValue(v: number) { this._bufferValue = clamp(v || 0); }

  /**
   * Mode of the progress bar.
   *
   * Input must be one of these values: determinate, indeterminate, buffer, query, defaults to
   * 'determinate'.
   * Mirrored to mode attribute.
   */
  @Input() mode: 'determinate' | 'indeterminate' | 'buffer' | 'query' = 'determinate';

  /** Gets the current transform value for the progress bar's primary indicator. */
  _primaryTransform() {
    let scale = this.value / 100;
    return {transform: `scaleX(${scale})`};
  }

  /**
   * Gets the current transform value for the progress bar's buffer indicator.  Only used if the
   * progress mode is set to buffer, otherwise returns an undefined, causing no transformation.
   */
  _bufferTransform() {
    if (this.mode == 'buffer') {
      let scale = this.bufferValue / 100;
      return {transform: `scaleX(${scale})`};
    }
  }
}

/** Clamps a value to be between two numbers, by default 0 and 100. */
function clamp(v: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}
