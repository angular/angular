/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Directive,
  ElementRef,
  forwardRef,
  Inject,
  Input,
  Optional,
} from '@angular/core';
import {
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MatDateFormats,
  ThemePalette,
} from '@angular/material/core';
import {MatFormField, MAT_FORM_FIELD} from '@angular/material/form-field';
import {MAT_INPUT_VALUE_ACCESSOR} from '@angular/material/input';
import {MatDatepicker} from './datepicker';
import {MatDatepickerInputBase, DateFilterFn} from './datepicker-input-base';
import {MatDatepickerControl} from './datepicker-base';

/** @docs-private */
export const MAT_DATEPICKER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MatDatepickerInput),
  multi: true
};

/** @docs-private */
export const MAT_DATEPICKER_VALIDATORS: any = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => MatDatepickerInput),
  multi: true
};

/** Directive used to connect an input to a MatDatepicker. */
@Directive({
  selector: 'input[matDatepicker]',
  providers: [
    MAT_DATEPICKER_VALUE_ACCESSOR,
    MAT_DATEPICKER_VALIDATORS,
    {provide: MAT_INPUT_VALUE_ACCESSOR, useExisting: MatDatepickerInput},
  ],
  host: {
    '[attr.aria-haspopup]': '_datepicker ? "dialog" : null',
    '[attr.aria-owns]': '(_datepicker?.opened && _datepicker.id) || null',
    '[attr.min]': 'min ? _dateAdapter.toIso8601(min) : null',
    '[attr.max]': 'max ? _dateAdapter.toIso8601(max) : null',
    '[disabled]': 'disabled',
    '(input)': '_onInput($event.target.value)',
    '(change)': '_onChange()',
    '(blur)': '_onBlur()',
    '(keydown)': '_onKeydown($event)',
  },
  exportAs: 'matDatepickerInput',
})
export class MatDatepickerInput<D> extends MatDatepickerInputBase<D | null, D>
  implements MatDatepickerControl<D | null> {
  /** The datepicker that this input is associated with. */
  @Input()
  set matDatepicker(datepicker: MatDatepicker<D>) {
    if (datepicker) {
      this._datepicker = datepicker;
      this._registerModel(datepicker._registerInput(this));
    }
  }
  _datepicker: MatDatepicker<D>;

  /** The minimum valid date. */
  @Input()
  get min(): D | null { return this._min; }
  set min(value: D | null) {
    this._min = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
    this._validatorOnChange();
  }
  private _min: D | null;

  /** The maximum valid date. */
  @Input()
  get max(): D | null { return this._max; }
  set max(value: D | null) {
    this._max = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
    this._validatorOnChange();
  }
  private _max: D | null;

  /** Function that can be used to filter out dates within the datepicker. */
  @Input('matDatepickerFilter')
  get dateFilter() { return this._dateFilter; }
  set dateFilter(value: DateFilterFn<D | null>) {
    this._dateFilter = value;
    this._validatorOnChange();
  }
  private _dateFilter: DateFilterFn<D | null>;

  /** The combined form control validator for this input. */
  protected _validator: ValidatorFn | null;

  constructor(
      elementRef: ElementRef<HTMLInputElement>,
      @Optional() dateAdapter: DateAdapter<D>,
      @Optional() @Inject(MAT_DATE_FORMATS) dateFormats: MatDateFormats,
      @Optional() @Inject(MAT_FORM_FIELD) private _formField: MatFormField) {
    super(elementRef, dateAdapter, dateFormats);
    this._validator = Validators.compose(super._getValidators());
  }

  /**
   * Gets the element that the datepicker popup should be connected to.
   * @return The element to connect the popup to.
   */
  getConnectedOverlayOrigin(): ElementRef {
    return this._formField ? this._formField.getConnectedOverlayOrigin() : this._elementRef;
  }

  /** Returns the palette used by the input's form field, if any. */
  getThemePalette(): ThemePalette {
    return this._formField ? this._formField.color : undefined;
  }

  /** Gets the value at which the calendar should start. */
  getStartValue(): D | null {
    return this.value;
  }

  /**
   * @deprecated
   * @breaking-change 8.0.0 Use `getConnectedOverlayOrigin` instead
   */
  getPopupConnectionElementRef(): ElementRef {
    return this.getConnectedOverlayOrigin();
  }

  /** Opens the associated datepicker. */
  protected _openPopup(): void {
    if (this._datepicker) {
      this._datepicker.open();
    }
  }

  protected _getValueFromModel(modelValue: D | null): D | null {
    return modelValue;
  }

  protected _assignValueToModel(value: D | null): void {
    if (this._model) {
      this._model.updateSelection(value, this);
    }
  }

  /** Gets the input's minimum date. */
  protected _getMinDate() {
    return this._min;
  }

  /** Gets the input's maximum date. */
  protected _getMaxDate() {
    return this._max;
  }

  /** Gets the input's date filtering function. */
  protected _getDateFilter() {
    return this._dateFilter;
  }

  // Unnecessary when selecting a single date.
  protected _outsideValueChanged: undefined;

  // Accept `any` to avoid conflicts with other directives on `<input>` that
  // may accept different types.
  static ngAcceptInputType_value: any;
}
