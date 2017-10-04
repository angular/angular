/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import {MatDatepicker} from './datepicker';
import {MatDatepickerIntl} from './datepicker-intl';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {Subscription} from 'rxjs/Subscription';
import {merge} from 'rxjs/observable/merge';
import {of as observableOf} from 'rxjs/observable/of';


@Component({
  moduleId: module.id,
  selector: 'mat-datepicker-toggle',
  templateUrl: 'datepicker-toggle.html',
  host: {
    'class': 'mat-datepicker-toggle',
  },
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatDatepickerToggle<D> implements OnChanges, OnDestroy {
  private _stateChanges = Subscription.EMPTY;

  /** Datepicker instance that the button will toggle. */
  @Input('for') datepicker: MatDatepicker<D>;

  /** Whether the toggle button is disabled. */
  @Input()
  get disabled(): boolean {
    return this._disabled === undefined ? this.datepicker.disabled : this._disabled;
  }
  set disabled(value) {
    this._disabled = coerceBooleanProperty(value);
  }
  private _disabled: boolean;

  constructor(
    public _intl: MatDatepickerIntl,
    private _changeDetectorRef: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.datepicker) {
      const datepicker: MatDatepicker<D> = changes.datepicker.currentValue;
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
