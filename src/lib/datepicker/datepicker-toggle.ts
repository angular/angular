/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from '@angular/core';
import {MdDatepicker} from './datepicker';
import {MdDatepickerIntl} from './datepicker-intl';
import {coerceBooleanProperty} from '@angular/cdk';


@Component({
  moduleId: module.id,
  selector: 'button[mdDatepickerToggle], button[matDatepickerToggle]',
  template: '',
  styleUrls: ['datepicker-toggle.css'],
  host: {
    'type': 'button',
    'class': 'mat-datepicker-toggle',
    '[attr.aria-label]': '_intl.openCalendarLabel',
    '[disabled]': 'disabled',
    '(click)': '_open($event)',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdDatepickerToggle<D> {
  /** Datepicker instance that the button will toggle. */
  @Input('mdDatepickerToggle') datepicker: MdDatepicker<D>;

  @Input('matDatepickerToggle')
  get _datepicker() { return this.datepicker; }
  set _datepicker(v: MdDatepicker<D>) { this.datepicker = v; }

  /** Whether the toggle button is disabled. */
  @Input()
  get disabled() {
    return this._disabled === undefined ? this.datepicker.disabled : this._disabled;
  }
  set disabled(value) {
    this._disabled = coerceBooleanProperty(value);
  }
  private _disabled: boolean;

  constructor(public _intl: MdDatepickerIntl) {}

  _open(event: Event): void {
    if (this.datepicker && !this.disabled) {
      this.datepicker.open();
      event.stopPropagation();
    }
  }
}
