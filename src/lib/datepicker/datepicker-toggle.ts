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
  ChangeDetectorRef,
} from '@angular/core';
import {MdDatepicker} from './datepicker';
import {MdDatepickerIntl} from './datepicker-intl';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {Subscription} from 'rxjs/Subscription';


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
export class MdDatepickerToggle<D> implements OnDestroy {
  private _intlChanges: Subscription;

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

  constructor(public _intl: MdDatepickerIntl, changeDetectorRef: ChangeDetectorRef) {
    this._intlChanges = _intl.changes.subscribe(() => changeDetectorRef.markForCheck());
  }

  ngOnDestroy() {
    this._intlChanges.unsubscribe();
  }

  _open(event: Event): void {
    if (this.datepicker && !this.disabled) {
      this.datepicker.open();
      event.stopPropagation();
    }
  }
}
