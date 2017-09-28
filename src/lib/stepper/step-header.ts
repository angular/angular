/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty, coerceNumberProperty} from '@angular/cdk/coercion';
import {Component, Input, ViewEncapsulation} from '@angular/core';
import {MatStepLabel} from './step-label';


@Component({
  moduleId: module.id,
  selector: 'mat-step-header',
  templateUrl: 'step-header.html',
  styleUrls: ['step-header.css'],
  host: {
    'class': 'mat-step-header',
    'role': 'tab',
  },
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class MatStepHeader {
  /** Icon for the given step. */
  @Input() icon: string;

  /** Label of the given step. */
  @Input() label: MatStepLabel | string;

  /** Index of the given step. */
  @Input()
  get index() { return this._index; }
  set index(value: any) {
    this._index = coerceNumberProperty(value);
  }
  private _index: number;

  /** Whether the given step is selected. */
  @Input()
  get selected() { return this._selected; }
  set selected(value: any) {
    this._selected = coerceBooleanProperty(value);
  }
  private _selected: boolean;

  /** Whether the given step label is active. */
  @Input()
  get active() { return this._active; }
  set active(value: any) {
    this._active = coerceBooleanProperty(value);
  }
  private _active: boolean;

  /** Whether the given step is optional. */
  @Input()
  get optional() { return this._optional; }
  set optional(value: any) {
    this._optional = coerceBooleanProperty(value);
  }
  private _optional: boolean;

  /** Returns string label of given step if it is a text label. */
  _stringLabel(): string | null {
    return this.label instanceof MatStepLabel ? null : this.label;
  }

  /** Returns MatStepLabel if the label of given step is a template label. */
  _templateLabel(): MatStepLabel | null {
    return this.label instanceof MatStepLabel ? this.label : null;
  }
}
