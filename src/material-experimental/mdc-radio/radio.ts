/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation, Input} from '@angular/core';

// Increasing integer for generating unique ids for radio components.
let nextUniqueId = 0;

@Component({
  moduleId: module.id,
  selector: 'mat-radio',
  templateUrl: 'radio.html',
  styleUrls: ['radio.css'],
  host: {
    'class': 'mat-mdc-radio',
    '[attr.id]': 'id',
  },
  exportAs: 'matRadio',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatRadio {

  private _uniqueId: string = `mat-radio-${++nextUniqueId}`;

  /** The unique ID for the radio button. */
  @Input() id: string = this._uniqueId;

  /** ID of the native input element inside `<mat-radio-button>` */
  get inputId(): string { return `${this.id || this._uniqueId}-input`; }

  // TODO: set up MDC foundation class.
}
