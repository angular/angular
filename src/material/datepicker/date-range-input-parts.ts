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
  Optional,
  InjectionToken,
  Inject,
  OnInit,
  Injector,
  InjectFlags,
  DoCheck,
} from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  NgForm,
  FormGroupDirective,
  NgControl,
  ValidatorFn,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import {
  CanUpdateErrorState,
  CanUpdateErrorStateCtor,
  mixinErrorState,
  MAT_DATE_FORMATS,
  DateAdapter,
  MatDateFormats,
  ErrorStateMatcher,
} from '@angular/material/core';
import {BooleanInput} from '@angular/cdk/coercion';
import {BACKSPACE} from '@angular/cdk/keycodes';
import {MatDatepickerInputBase, DateFilterFn} from './datepicker-input-base';
import {DateRange} from './date-selection-model';

/** Parent component that should be wrapped around `MatStartDate` and `MatEndDate`. */
export interface MatDateRangeInputParent<D> {
  id: string;
  min: D | null;
  max: D | null;
  dateFilter: DateFilterFn<D>;
  rangePicker: {
    opened: boolean;
    id: string;
  };
  _startInput: MatDateRangeInputPartBase<D>;
  _endInput: MatDateRangeInputPartBase<D>;
  _groupDisabled: boolean;
  _ariaDescribedBy: string | null;
  _ariaLabelledBy: string | null;
  _handleChildValueChange: () => void;
  _openDatepicker: () => void;
}

/**
 * Used to provide the date range input wrapper component
 * to the parts without circular dependencies.
 */
export const MAT_DATE_RANGE_INPUT_PARENT =
    new InjectionToken<MatDateRangeInputParent<unknown>>('MAT_DATE_RANGE_INPUT_PARENT');

/**
 * Base class for the individual inputs that can be projected inside a `mat-date-range-input`.
 */
@Directive()
abstract class MatDateRangeInputPartBase<D>
  extends MatDatepickerInputBase<DateRange<D>> implements OnInit, DoCheck {

  /** @docs-private */
  ngControl: NgControl;

  /** @docs-private */
  abstract updateErrorState(): void;

  protected abstract _validator: ValidatorFn | null;
  protected abstract _assignValueToModel(value: D | null): void;
  protected abstract _getValueFromModel(modelValue: DateRange<D>): D | null;

  constructor(
    @Inject(MAT_DATE_RANGE_INPUT_PARENT) public _rangeInput: MatDateRangeInputParent<D>,
    elementRef: ElementRef<HTMLInputElement>,
    public _defaultErrorStateMatcher: ErrorStateMatcher,
    private _injector: Injector,
    @Optional() public _parentForm: NgForm,
    @Optional() public _parentFormGroup: FormGroupDirective,
    @Optional() dateAdapter: DateAdapter<D>,
    @Optional() @Inject(MAT_DATE_FORMATS) dateFormats: MatDateFormats) {
    super(elementRef, dateAdapter, dateFormats);
  }

  ngOnInit() {
    // We need the date input to provide itself as a `ControlValueAccessor` and a `Validator`, while
    // injecting its `NgControl` so that the error state is handled correctly. This introduces a
    // circular dependency, because both `ControlValueAccessor` and `Validator` depend on the input
    // itself. Usually we can work around it for the CVA, but there's no API to do it for the
    // validator. We work around it here by injecting the `NgControl` in `ngOnInit`, after
    // everything has been resolved.
    const ngControl = this._injector.get(NgControl, null, InjectFlags.Self);

    if (ngControl) {
      this.ngControl = ngControl;
    }
  }

  ngDoCheck() {
    if (this.ngControl) {
      // We need to re-evaluate this on every change detection cycle, because there are some
      // error triggers that we can't subscribe to (e.g. parent form submissions). This means
      // that whatever logic is in here has to be super lean or we risk destroying the performance.
      this.updateErrorState();
    }
  }

  /** Gets whether the input is empty. */
  isEmpty(): boolean {
    return this._elementRef.nativeElement.value.length === 0;
  }

  /** Gets the placeholder of the input. */
  _getPlaceholder() {
    return this._elementRef.nativeElement.placeholder;
  }

  /** Focuses the input. */
  focus(): void {
    this._elementRef.nativeElement.focus();
  }

  /** Handles `input` events on the input element. */
  _onInput(value: string) {
    super._onInput(value);
    this._rangeInput._handleChildValueChange();
  }

  /** Opens the datepicker associated with the input. */
  protected _openPopup(): void {
    this._rangeInput._openDatepicker();
  }

  /** Gets the minimum date from the range input. */
  _getMinDate() {
    return this._rangeInput.min;
  }

  /** Gets the maximum date from the range input. */
  _getMaxDate() {
    return this._rangeInput.max;
  }

  /** Gets the date filter function from the range input. */
  protected _getDateFilter() {
    return this._rangeInput.dateFilter;
  }

  protected _outsideValueChanged = () => {
    // Whenever the value changes outside the input we need to revalidate, because
    // the validation state of each of the inputs depends on the other one.
    this._validatorOnChange();
  }

  protected _parentDisabled() {
    return this._rangeInput._groupDisabled;
  }
}

const _MatDateRangeInputBase:
    CanUpdateErrorStateCtor & typeof MatDateRangeInputPartBase =
    // Needs to be `as any`, because the base class is abstract.
    mixinErrorState(MatDateRangeInputPartBase as any);

/** Input for entering the start date in a `mat-date-range-input`. */
@Directive({
  selector: 'input[matStartDate]',
  host: {
    'class': 'mat-date-range-input-inner',
    '[disabled]': 'disabled',
    '(input)': '_onInput($event.target.value)',
    '(change)': '_onChange()',
    '(keydown)': '_onKeydown($event)',
    '[attr.id]': '_rangeInput.id',
    '[attr.aria-labelledby]': '_rangeInput._ariaLabelledBy',
    '[attr.aria-describedby]': '_rangeInput._ariaDescribedBy',
    '[attr.aria-haspopup]': '_rangeInput.rangePicker ? "dialog" : null',
    '[attr.aria-owns]': '(_rangeInput.rangePicker?.opened && _rangeInput.rangePicker.id) || null',
    '[attr.min]': '_getMinDate() ? _dateAdapter.toIso8601(_getMinDate()) : null',
    '[attr.max]': '_getMaxDate() ? _dateAdapter.toIso8601(_getMaxDate()) : null',
    '(blur)': '_onBlur()',
    'type': 'text',
  },
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: MatStartDate, multi: true},
    {provide: NG_VALIDATORS, useExisting: MatStartDate, multi: true}
  ]
})
export class MatStartDate<D> extends _MatDateRangeInputBase<D> implements CanUpdateErrorState {
  /** Validator that checks that the start date isn't after the end date. */
  private _startValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const start = this._getValidDateOrNull(this._dateAdapter.deserialize(control.value));
    const end = this._model ? this._model.selection.end : null;
    return (!start || !end ||
        this._dateAdapter.compareDate(start, end) <= 0) ?
        null : {'matStartDateInvalid': {'end': end, 'actual': start}};
  }

  constructor(
    @Inject(MAT_DATE_RANGE_INPUT_PARENT) rangeInput: MatDateRangeInputParent<D>,
    elementRef: ElementRef<HTMLInputElement>,
    defaultErrorStateMatcher: ErrorStateMatcher,
    injector: Injector,
    @Optional() parentForm: NgForm,
    @Optional() parentFormGroup: FormGroupDirective,
    @Optional() dateAdapter: DateAdapter<D>,
    @Optional() @Inject(MAT_DATE_FORMATS) dateFormats: MatDateFormats) {

    // TODO(crisbeto): this constructor shouldn't be necessary, but ViewEngine doesn't seem to
    // handle DI correctly when it is inherited from `MatDateRangeInputPartBase`. We can drop this
    // constructor once ViewEngine is removed.
    super(rangeInput, elementRef, defaultErrorStateMatcher, injector, parentForm, parentFormGroup,
        dateAdapter, dateFormats);
  }

  protected _validator = Validators.compose([...super._getValidators(), this._startValidator]);

  protected _getValueFromModel(modelValue: DateRange<D>) {
    return modelValue.start;
  }

  protected _assignValueToModel(value: D | null) {
    if (this._model) {
      const range = new DateRange(value, this._model.selection.end);
      this._model.updateSelection(range, this);
      this._cvaOnChange(value);
    }
  }

  protected _formatValue(value: D | null) {
    super._formatValue(value);

    // Any time the input value is reformatted we need to tell the parent.
    this._rangeInput._handleChildValueChange();
  }

  /** Gets the value that should be used when mirroring the input's size. */
  getMirrorValue(): string {
    const element = this._elementRef.nativeElement;
    const value = element.value;
    return value.length > 0 ? value : element.placeholder;
  }

  static ngAcceptInputType_disabled: BooleanInput;
}


/** Input for entering the end date in a `mat-date-range-input`. */
@Directive({
  selector: 'input[matEndDate]',
  host: {
    'class': 'mat-date-range-input-inner',
    '[disabled]': 'disabled',
    '(input)': '_onInput($event.target.value)',
    '(change)': '_onChange()',
    '(keydown)': '_onKeydown($event)',
    '[attr.aria-labelledby]': '_rangeInput._ariaLabelledBy',
    '[attr.aria-describedby]': '_rangeInput._ariaDescribedBy',
    '[attr.aria-haspopup]': '_rangeInput.rangePicker ? "dialog" : null',
    '[attr.aria-owns]': '(_rangeInput.rangePicker?.opened && _rangeInput.rangePicker.id) || null',
    '[attr.min]': '_getMinDate() ? _dateAdapter.toIso8601(_getMinDate()) : null',
    '[attr.max]': '_getMaxDate() ? _dateAdapter.toIso8601(_getMaxDate()) : null',
    '(blur)': '_onBlur()',
    'type': 'text',
  },
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: MatEndDate, multi: true},
    {provide: NG_VALIDATORS, useExisting: MatEndDate, multi: true}
  ]
})
export class MatEndDate<D> extends _MatDateRangeInputBase<D> implements CanUpdateErrorState {
  /** Validator that checks that the end date isn't before the start date. */
  private _endValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const end = this._getValidDateOrNull(this._dateAdapter.deserialize(control.value));
    const start = this._model ? this._model.selection.start : null;
    return (!end || !start ||
        this._dateAdapter.compareDate(end, start) >= 0) ?
        null : {'matEndDateInvalid': {'start': start, 'actual': end}};
  }

  constructor(
    @Inject(MAT_DATE_RANGE_INPUT_PARENT) rangeInput: MatDateRangeInputParent<D>,
    elementRef: ElementRef<HTMLInputElement>,
    defaultErrorStateMatcher: ErrorStateMatcher,
    injector: Injector,
    @Optional() parentForm: NgForm,
    @Optional() parentFormGroup: FormGroupDirective,
    @Optional() dateAdapter: DateAdapter<D>,
    @Optional() @Inject(MAT_DATE_FORMATS) dateFormats: MatDateFormats) {

    // TODO(crisbeto): this constructor shouldn't be necessary, but ViewEngine doesn't seem to
    // handle DI correctly when it is inherited from `MatDateRangeInputPartBase`. We can drop this
    // constructor once ViewEngine is removed.
    super(rangeInput, elementRef, defaultErrorStateMatcher, injector, parentForm, parentFormGroup,
        dateAdapter, dateFormats);
  }

  protected _validator = Validators.compose([...super._getValidators(), this._endValidator]);

  protected _getValueFromModel(modelValue: DateRange<D>) {
    return modelValue.end;
  }

  protected _assignValueToModel(value: D | null) {
    if (this._model) {
      const range = new DateRange(this._model.selection.start, value);
      this._model.updateSelection(range, this);
      this._cvaOnChange(value);
    }
  }

  _onKeydown(event: KeyboardEvent) {
    // If the user is pressing backspace on an empty end input, move focus back to the start.
    if (event.keyCode === BACKSPACE && !this._elementRef.nativeElement.value) {
      this._rangeInput._startInput.focus();
    }

    super._onKeydown(event);
  }

  static ngAcceptInputType_disabled: BooleanInput;
}
