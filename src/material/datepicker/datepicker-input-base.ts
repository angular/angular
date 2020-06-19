/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {DOWN_ARROW} from '@angular/cdk/keycodes';
import {
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  Optional,
  Output,
  AfterViewInit,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  ValidationErrors,
  Validator,
  ValidatorFn,
} from '@angular/forms';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MatDateFormats,
} from '@angular/material/core';
import {Subscription} from 'rxjs';
import {createMissingDateImplError} from './datepicker-errors';
import {ExtractDateTypeFromSelection, MatDateSelectionModel} from './date-selection-model';

/**
 * An event used for datepicker input and change events. We don't always have access to a native
 * input or change event because the event may have been triggered by the user clicking on the
 * calendar popup. For consistency, we always use MatDatepickerInputEvent instead.
 */
export class MatDatepickerInputEvent<D, S = unknown> {
  /** The new value for the target datepicker input. */
  value: D | null;

  constructor(
      /** Reference to the datepicker input component that emitted the event. */
      public target: MatDatepickerInputBase<S, D>,
      /** Reference to the native input element associated with the datepicker input. */
      public targetElement: HTMLElement) {
    this.value = this.target.value;
  }
}

/** Function that can be used to filter out dates from a calendar. */
export type DateFilterFn<D> = (date: D | null) => boolean;

/** Base class for datepicker inputs. */
@Directive()
export abstract class MatDatepickerInputBase<S, D = ExtractDateTypeFromSelection<S>>
  implements ControlValueAccessor, AfterViewInit, OnDestroy, Validator {

  /** Whether the component has been initialized. */
  private _isInitialized: boolean;

  /** The value of the input. */
  @Input()
  get value(): D | null {
    return this._model ? this._getValueFromModel(this._model.selection) : this._pendingValue;
  }
  set value(value: D | null) {
    value = this._dateAdapter.deserialize(value);
    this._lastValueValid = this._isValidValue(value);
    value = this._getValidDateOrNull(value);
    const oldDate = this.value;
    this._assignValue(value);
    this._formatValue(value);

    if (!this._dateAdapter.sameDate(oldDate, value)) {
      this._valueChange.emit(value);
    }
  }
  protected _model: MatDateSelectionModel<S, D> | undefined;

  /** Whether the datepicker-input is disabled. */
  @Input()
  get disabled(): boolean { return !!this._disabled || this._parentDisabled(); }
  set disabled(value: boolean) {
    const newValue = coerceBooleanProperty(value);
    const element = this._elementRef.nativeElement;

    if (this._disabled !== newValue) {
      this._disabled = newValue;
      this._disabledChange.emit(newValue);
    }

    // We need to null check the `blur` method, because it's undefined during SSR.
    // In Ivy static bindings are invoked earlier, before the element is attached to the DOM.
    // This can cause an error to be thrown in some browsers (IE/Edge) which assert that the
    // element has been inserted.
    if (newValue && this._isInitialized && element.blur) {
      // Normally, native input elements automatically blur if they turn disabled. This behavior
      // is problematic, because it would mean that it triggers another change detection cycle,
      // which then causes a changed after checked error if the input element was focused before.
      element.blur();
    }
  }
  private _disabled: boolean;

  /** Emits when a `change` event is fired on this `<input>`. */
  @Output() readonly dateChange: EventEmitter<MatDatepickerInputEvent<D, S>> =
      new EventEmitter<MatDatepickerInputEvent<D, S>>();

  /** Emits when an `input` event is fired on this `<input>`. */
  @Output() readonly dateInput: EventEmitter<MatDatepickerInputEvent<D, S>> =
      new EventEmitter<MatDatepickerInputEvent<D, S>>();

  /** Emits when the value changes (either due to user input or programmatic change). */
  _valueChange = new EventEmitter<D | null>();

  /** Emits when the disabled state has changed */
  _disabledChange = new EventEmitter<boolean>();

  _onTouched = () => {};
  _validatorOnChange = () => {};

  protected _cvaOnChange: (value: any) => void = () => {};
  private _valueChangesSubscription = Subscription.EMPTY;
  private _localeSubscription = Subscription.EMPTY;

  /**
   * Since the value is kept on the model which is assigned in an Input,
   * we might get a value before we have a model. This property keeps track
   * of the value until we have somewhere to assign it.
   */
  private _pendingValue: D | null;

  /** The form control validator for whether the input parses. */
  private _parseValidator: ValidatorFn = (): ValidationErrors | null => {
    return this._lastValueValid ?
        null : {'matDatepickerParse': {'text': this._elementRef.nativeElement.value}};
  }

  /** The form control validator for the date filter. */
  private _filterValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const controlValue = this._getValidDateOrNull(this._dateAdapter.deserialize(control.value));
    const dateFilter = this._getDateFilter();
    return !dateFilter || !controlValue || dateFilter(controlValue) ?
        null : {'matDatepickerFilter': true};
  }

  /** The form control validator for the min date. */
  private _minValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const controlValue = this._getValidDateOrNull(this._dateAdapter.deserialize(control.value));
    const min = this._getMinDate();
    return (!min || !controlValue ||
        this._dateAdapter.compareDate(min, controlValue) <= 0) ?
        null : {'matDatepickerMin': {'min': min, 'actual': controlValue}};
  }

  /** The form control validator for the max date. */
  private _maxValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const controlValue = this._getValidDateOrNull(this._dateAdapter.deserialize(control.value));
    const max = this._getMaxDate();
    return (!max || !controlValue ||
        this._dateAdapter.compareDate(max, controlValue) >= 0) ?
        null : {'matDatepickerMax': {'max': max, 'actual': controlValue}};
  }

  /** Gets the base validator functions. */
  protected _getValidators(): ValidatorFn[] {
    return [this._parseValidator, this._minValidator, this._maxValidator, this._filterValidator];
  }

  /** Gets the minimum date for the input. Used for validation. */
  abstract _getMinDate(): D | null;

  /** Gets the maximum date for the input. Used for validation. */
  abstract _getMaxDate(): D | null;

  /** Gets the date filter function. Used for validation. */
  protected abstract _getDateFilter(): DateFilterFn<D> | undefined;

  /** Registers a date selection model with the input. */
  _registerModel(model: MatDateSelectionModel<S, D>): void {
    this._model = model;
    this._valueChangesSubscription.unsubscribe();

    if (this._pendingValue) {
      this._assignValue(this._pendingValue);
    }

    this._valueChangesSubscription = this._model.selectionChanged.subscribe(event => {
      if (event.source !== this) {
        const value = this._getValueFromModel(event.selection);
        this._lastValueValid = this._isValidValue(value);
        this._cvaOnChange(value);
        this._onTouched();
        this._formatValue(value);
        this.dateInput.emit(new MatDatepickerInputEvent(this, this._elementRef.nativeElement));
        this.dateChange.emit(new MatDatepickerInputEvent(this, this._elementRef.nativeElement));

        if (this._outsideValueChanged) {
          this._outsideValueChanged();
        }
      }
    });
  }

  /** Opens the popup associated with the input. */
  protected abstract _openPopup(): void;

  /** Assigns a value to the input's model. */
  protected abstract _assignValueToModel(model: D | null): void;

  /** Converts a value from the model into a native value for the input. */
  protected abstract _getValueFromModel(modelValue: S): D | null;

  /** Combined form control validator for this input. */
  protected abstract _validator: ValidatorFn | null;

  /**
   * Callback that'll be invoked when the selection model is changed
   * from somewhere that's not the current datepicker input.
   */
  protected abstract _outsideValueChanged?: () => void;

  /** Whether the last value set on the input was valid. */
  protected _lastValueValid = false;

  constructor(
      protected _elementRef: ElementRef<HTMLInputElement>,
      @Optional() public _dateAdapter: DateAdapter<D>,
      @Optional() @Inject(MAT_DATE_FORMATS) private _dateFormats: MatDateFormats) {
    if (!this._dateAdapter) {
      throw createMissingDateImplError('DateAdapter');
    }
    if (!this._dateFormats) {
      throw createMissingDateImplError('MAT_DATE_FORMATS');
    }

    // Update the displayed date when the locale changes.
    this._localeSubscription = _dateAdapter.localeChanges.subscribe(() => {
      this.value = this.value;
    });
  }

  ngAfterViewInit() {
    this._isInitialized = true;
  }

  ngOnDestroy() {
    this._valueChangesSubscription.unsubscribe();
    this._localeSubscription.unsubscribe();
    this._valueChange.complete();
    this._disabledChange.complete();
  }

  /** @docs-private */
  registerOnValidatorChange(fn: () => void): void {
    this._validatorOnChange = fn;
  }

  /** @docs-private */
  validate(c: AbstractControl): ValidationErrors | null {
    return this._validator ? this._validator(c) : null;
  }

  // Implemented as part of ControlValueAccessor.
  writeValue(value: D): void {
    this.value = value;
  }

  // Implemented as part of ControlValueAccessor.
  registerOnChange(fn: (value: any) => void): void {
    this._cvaOnChange = fn;
  }

  // Implemented as part of ControlValueAccessor.
  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  // Implemented as part of ControlValueAccessor.
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  _onKeydown(event: KeyboardEvent) {
    const isAltDownArrow = event.altKey && event.keyCode === DOWN_ARROW;

    if (isAltDownArrow && !this._elementRef.nativeElement.readOnly) {
      this._openPopup();
      event.preventDefault();
    }
  }

  _onInput(value: string) {
    const lastValueWasValid = this._lastValueValid;
    let date = this._dateAdapter.parse(value, this._dateFormats.parse.dateInput);
    this._lastValueValid = this._isValidValue(date);
    date = this._getValidDateOrNull(date);

    if (!this._dateAdapter.sameDate(date, this.value)) {
      this._assignValue(date);
      this._cvaOnChange(date);
      this._valueChange.emit(date);
      this.dateInput.emit(new MatDatepickerInputEvent(this, this._elementRef.nativeElement));
    } else if (lastValueWasValid !== this._lastValueValid) {
      this._validatorOnChange();
    }
  }

  _onChange() {
    this.dateChange.emit(new MatDatepickerInputEvent(this, this._elementRef.nativeElement));
  }

  /** Handles blur events on the input. */
  _onBlur() {
    // Reformat the input only if we have a valid value.
    if (this.value) {
      this._formatValue(this.value);
    }

    this._onTouched();
  }

  /** Formats a value and sets it on the input element. */
  protected _formatValue(value: D | null) {
    this._elementRef.nativeElement.value =
        value ? this._dateAdapter.format(value, this._dateFormats.display.dateInput) : '';
  }

  /**
   * @param obj The object to check.
   * @returns The given object if it is both a date instance and valid, otherwise null.
   */
  protected _getValidDateOrNull(obj: any): D | null {
    return (this._dateAdapter.isDateInstance(obj) && this._dateAdapter.isValid(obj)) ? obj : null;
  }

  /** Assigns a value to the model. */
  private _assignValue(value: D | null) {
    // We may get some incoming values before the model was
    // assigned. Save the value so that we can assign it later.
    if (this._model) {
      this._assignValueToModel(value);
      this._pendingValue = null;
    } else {
      this._pendingValue = value;
    }
  }

  /** Whether a value is considered valid. */
  private _isValidValue(value: D | null): boolean {
    return !value || this._dateAdapter.isValid(value);
  }

  /**
   * Checks whether a parent control is disabled. This is in place so that it can be overridden
   * by inputs extending this one which can be placed inside of a group that can be disabled.
   */
  protected _parentDisabled() {
    return false;
  }

  // Accept `any` to avoid conflicts with other directives on `<input>` that
  // may accept different types.
  static ngAcceptInputType_value: any;
  static ngAcceptInputType_disabled: BooleanInput;
}
