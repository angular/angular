/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Input, ViewEncapsulation} from '@angular/core';
import {coerceBooleanProperty, coerceNumberProperty} from '@angular/cdk/coercion';
import {MdStepLabel} from './step-label';
import {MATERIAL_COMPATIBILITY_MODE} from '../core/compatibility/compatibility';

@Component({
  moduleId: module.id,
  selector: 'md-step-header, mat-step-header',
  templateUrl: 'step-header.html',
  styleUrls: ['step-header.css'],
  host: {
    'class': 'mat-step-header',
    'role': 'tab',
  },
  encapsulation: ViewEncapsulation.None,
  providers: [{provide: MATERIAL_COMPATIBILITY_MODE, useValue: false}],
})
export class MdStepHeader {
  /** Icon for the given step. */
  @Input() icon: string;

  /** Label of the given step. */
  @Input() label: MdStepLabel | string;

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
    return this.label instanceof MdStepLabel ? null : this.label;
  }

  /** Returns MdStepLabel if the label of given step is a template label. */
  _templateLabel(): MdStepLabel | null {
    return this.label instanceof MdStepLabel ? this.label : null;
  }
}
