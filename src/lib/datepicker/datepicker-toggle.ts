/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import {MdDatepicker} from './datepicker';
import {MdDatepickerIntl} from './datepicker-intl';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {Subscription} from 'rxjs/Subscription';
import {merge} from 'rxjs/observable/merge';
import {of as observableOf} from 'rxjs/observable/of';


@Component({
  moduleId: module.id,
  selector: 'md-datepicker-toggle, mat-datepicker-toggle',
  templateUrl: 'datepicker-toggle.html',
  host: {
    'class': 'mat-datepicker-toggle',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdDatepickerToggle<D> implements OnChanges, OnDestroy {
  private _stateChanges = Subscription.EMPTY;

  /** Datepicker instance that the button will toggle. */
  @Input('for') datepicker: MdDatepicker<D>;

  /** Whether the toggle button is disabled. */
  @Input()
  get disabled() {
    return this._disabled === undefined ? this.datepicker.disabled : this._disabled;
  }
  set disabled(value) {
    this._disabled = coerceBooleanProperty(value);
  }
  private _disabled: boolean;

  constructor(
    public _intl: MdDatepickerIntl,
    private _changeDetectorRef: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.datepicker) {
      const datepicker: MdDatepicker<D> = changes.datepicker.currentValue;
      const datepickerDisabled = datepicker ? datepicker._disabledChange : observableOf();
      const inputDisabled = datepicker && datepicker._datepickerInput ?
        datepicker._datepickerInput._disabledChange :
        observableOf();

      this._stateChanges.unsubscribe();
      this._stateChanges = merge(this._intl.changes, datepickerDisabled, inputDisabled)
        .subscribe(() => this._changeDetectorRef.markForCheck());
    }
  }

  ngOnDestroy() {
    this._stateChanges.unsubscribe();
  }

  _open(event: Event): void {
    if (this.datepicker && !this.disabled) {
      this.datepicker.open();
      event.stopPropagation();
    }
  }
}
