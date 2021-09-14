/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Input,
  Optional,
  OnDestroy,
  ContentChild,
  AfterContentInit,
  ChangeDetectorRef,
  Self,
  ElementRef,
  Inject,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {MatFormFieldControl, MatFormField, MAT_FORM_FIELD} from '@angular/material/form-field';
import {ThemePalette, DateAdapter} from '@angular/material/core';
import {NgControl, ControlContainer} from '@angular/forms';
import {Subject, merge, Subscription} from 'rxjs';
import {FocusOrigin} from '@angular/cdk/a11y';
import {coerceBooleanProperty, BooleanInput} from '@angular/cdk/coercion';
import {
  MatStartDate,
  MatEndDate,
  MatDateRangeInputParent,
  MAT_DATE_RANGE_INPUT_PARENT,
} from './date-range-input-parts';
import {MatDatepickerControl, MatDatepickerPanel} from './datepicker-base';
import {createMissingDateImplError} from './datepicker-errors';
import {DateFilterFn, dateInputsHaveChanged} from './datepicker-input-base';
import {MatDateRangePickerInput} from './date-range-picker';
import {DateRange, MatDateSelectionModel} from './date-selection-model';

let nextUniqueId = 0;

@Component({
  selector: 'mat-date-range-input',
  templateUrl: 'date-range-input.html',
  styleUrls: ['date-range-input.css'],
  exportAs: 'matDateRangeInput',
  host: {
    'class': 'mat-date-range-input',
    '[class.mat-date-range-input-hide-placeholders]': '_shouldHidePlaceholders()',
    '[class.mat-date-range-input-required]': 'required',
    '[attr.id]': 'null',
    'role': 'group',
    '[attr.aria-labelledby]': '_getAriaLabelledby()',
    '[attr.aria-describedby]': '_ariaDescribedBy',
    // Used by the test harness to tie this input to its calendar. We can't depend on
    // `aria-owns` for this, because it's only defined while the calendar is open.
    '[attr.data-mat-calendar]': 'rangePicker ? rangePicker.id : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {provide: MatFormFieldControl, useExisting: MatDateRangeInput},
    {provide: MAT_DATE_RANGE_INPUT_PARENT, useExisting: MatDateRangeInput},
  ]
})
export class MatDateRangeInput<D> implements MatFormFieldControl<DateRange<D>>,
  MatDatepickerControl<D>, MatDateRangeInputParent<D>, MatDateRangePickerInput<D>,
  AfterContentInit, OnChanges, OnDestroy {
  private _closedSubscription = Subscription.EMPTY;

  /** Current value of the range input. */
  get value() {
    return this._model ? this._model.selection : null;
  }

  /** Unique ID for the input. */
  id = `mat-date-range-input-${nextUniqueId++}`;

  /** Whether the control is focused. */
  focused = false;

  /** Whether the control's label should float. */
  get shouldLabelFloat(): boolean {
    return this.focused || !this.empty;
  }

  /** Name of the form control. */
  controlType = 'mat-date-range-input';

  /**
   * Implemented as a part of `MatFormFieldControl`.
   * Set the placeholder attribute on `matStartDate` and `matEndDate`.
   * @docs-private
   */
  get placeholder() {
    const start = this._startInput?._getPlaceholder() || '';
    const end = this._endInput?._getPlaceholder() || '';
    return (start || end) ? `${start} ${this.separator} ${end}` : '';
  }

  /** The range picker that this input is associated with. */
  @Input()
  get rangePicker() { return this._rangePicker; }
  set rangePicker(rangePicker: MatDatepickerPanel<MatDatepickerControl<D>, DateRange<D>, D>) {
    if (rangePicker) {
      this._model = rangePicker.registerInput(this);
      this._rangePicker = rangePicker;
      this._closedSubscription.unsubscribe();
      this._closedSubscription = rangePicker.closedStream.subscribe(() => {
        this._startInput?._onTouched();
        this._endInput?._onTouched();
      });
      this._registerModel(this._model!);
    }
  }
  private _rangePicker: MatDatepickerPanel<MatDatepickerControl<D>, DateRange<D>, D>;

  /** Whether the input is required. */
  @Input()
  get required(): boolean { return !!this._required; }
  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
  }
  private _required: boolean;

  /** Function that can be used to filter out dates within the date range picker. */
  @Input()
  get dateFilter() { return this._dateFilter; }
  set dateFilter(value: DateFilterFn<D>) {
    const start = this._startInput;
    const end = this._endInput;
    const wasMatchingStart = start && start._matchesFilter(start.value);
    const wasMatchingEnd = end && end._matchesFilter(start.value);
    this._dateFilter = value;

    if (start && start._matchesFilter(start.value) !== wasMatchingStart) {
      start._validatorOnChange();
    }

    if (end && end._matchesFilter(end.value) !== wasMatchingEnd) {
      end._validatorOnChange();
    }
  }
  private _dateFilter: DateFilterFn<D>;

  /** The minimum valid date. */
  @Input()
  get min(): D | null { return this._min; }
  set min(value: D | null) {
    const validValue = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));

    if (!this._dateAdapter.sameDate(validValue, this._min)) {
      this._min = validValue;
      this._revalidate();
    }
  }
  private _min: D | null;

  /** The maximum valid date. */
  @Input()
  get max(): D | null { return this._max; }
  set max(value: D | null) {
    const validValue = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));

    if (!this._dateAdapter.sameDate(validValue, this._max)) {
      this._max = validValue;
      this._revalidate();
    }
  }
  private _max: D | null;

  /** Whether the input is disabled. */
  @Input()
  get disabled(): boolean {
    return (this._startInput && this._endInput) ?
      (this._startInput.disabled && this._endInput.disabled) :
      this._groupDisabled;
  }
  set disabled(value: boolean) {
    const newValue = coerceBooleanProperty(value);

    if (newValue !== this._groupDisabled) {
      this._groupDisabled = newValue;
      this.stateChanges.next(undefined);
    }
  }
  _groupDisabled = false;

  /** Whether the input is in an error state. */
  get errorState(): boolean {
    if (this._startInput && this._endInput) {
      return this._startInput.errorState || this._endInput.errorState;
    }

    return false;
  }

  /** Whether the datepicker input is empty. */
  get empty(): boolean {
    const startEmpty = this._startInput ? this._startInput.isEmpty() : false;
    const endEmpty = this._endInput ? this._endInput.isEmpty() : false;
    return startEmpty && endEmpty;
  }

  /** Value for the `aria-describedby` attribute of the inputs. */
  _ariaDescribedBy: string | null = null;

  /** Date selection model currently registered with the input. */
  private _model: MatDateSelectionModel<DateRange<D>> | undefined;

  /** Separator text to be shown between the inputs. */
  @Input() separator = '–';

  /** Start of the comparison range that should be shown in the calendar. */
  @Input() comparisonStart: D | null = null;

  /** End of the comparison range that should be shown in the calendar. */
  @Input() comparisonEnd: D | null = null;

  @ContentChild(MatStartDate) _startInput: MatStartDate<D>;
  @ContentChild(MatEndDate) _endInput: MatEndDate<D>;

  /**
   * Implemented as a part of `MatFormFieldControl`.
   * TODO(crisbeto): change type to `AbstractControlDirective` after #18206 lands.
   * @docs-private
   */
  ngControl: NgControl | null;

  /** Emits when the input's state has changed. */
  readonly stateChanges = new Subject<void>();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _elementRef: ElementRef<HTMLElement>,
    @Optional() @Self() control: ControlContainer,
    @Optional() private _dateAdapter: DateAdapter<D>,
    @Optional() @Inject(MAT_FORM_FIELD) private _formField?: MatFormField) {

    if (!_dateAdapter && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw createMissingDateImplError('DateAdapter');
    }

    // The datepicker module can be used both with MDC and non-MDC form fields. We have
    // to conditionally add the MDC input class so that the range picker looks correctly.
    if (_formField?._elementRef.nativeElement.classList.contains('mat-mdc-form-field')) {
      const classList = _elementRef.nativeElement.classList;
      classList.add('mat-mdc-input-element');
      classList.add('mat-mdc-form-field-input-control');
    }

    // TODO(crisbeto): remove `as any` after #18206 lands.
    this.ngControl = control as any;
  }

  /**
   * Implemented as a part of `MatFormFieldControl`.
   * @docs-private
   */
  setDescribedByIds(ids: string[]): void {
    this._ariaDescribedBy = ids.length ? ids.join(' ') : null;
  }

  /**
   * Implemented as a part of `MatFormFieldControl`.
   * @docs-private
   */
  onContainerClick(): void {
    if (!this.focused && !this.disabled) {
      if (!this._model || !this._model.selection.start) {
        this._startInput.focus();
      } else {
        this._endInput.focus();
      }
    }
  }

  ngAfterContentInit() {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (!this._startInput) {
        throw Error('mat-date-range-input must contain a matStartDate input');
      }

      if (!this._endInput) {
        throw Error('mat-date-range-input must contain a matEndDate input');
      }
    }

    if (this._model) {
      this._registerModel(this._model);
    }

    // We don't need to unsubscribe from this, because we
    // know that the input streams will be completed on destroy.
    merge(this._startInput.stateChanges, this._endInput.stateChanges).subscribe(() => {
      this.stateChanges.next(undefined);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (dateInputsHaveChanged(changes, this._dateAdapter)) {
      this.stateChanges.next(undefined);
    }
  }

  ngOnDestroy() {
    this._closedSubscription.unsubscribe();
    this.stateChanges.complete();
  }

  /** Gets the date at which the calendar should start. */
  getStartValue(): D | null {
    return this.value ? this.value.start : null;
  }

  /** Gets the input's theme palette. */
  getThemePalette(): ThemePalette {
    return this._formField ? this._formField.color : undefined;
  }

  /** Gets the element to which the calendar overlay should be attached. */
  getConnectedOverlayOrigin(): ElementRef {
    return this._formField ? this._formField.getConnectedOverlayOrigin() : this._elementRef;
  }

  /** Gets the ID of an element that should be used a description for the calendar overlay. */
  getOverlayLabelId(): string | null {
    return this._formField ? this._formField.getLabelId() : null;
  }

  /** Gets the value that is used to mirror the state input. */
  _getInputMirrorValue() {
    return this._startInput ? this._startInput.getMirrorValue() : '';
  }

  /** Whether the input placeholders should be hidden. */
  _shouldHidePlaceholders() {
    return this._startInput ? !this._startInput.isEmpty() : false;
  }

  /** Handles the value in one of the child inputs changing. */
  _handleChildValueChange() {
    this.stateChanges.next(undefined);
    this._changeDetectorRef.markForCheck();
  }

  /** Opens the date range picker associated with the input. */
  _openDatepicker() {
    if (this._rangePicker) {
      this._rangePicker.open();
    }
  }

  /** Whether the separate text should be hidden. */
  _shouldHideSeparator() {
    return (!this._formField || (this._formField.getLabelId() &&
      !this._formField._shouldLabelFloat())) && this.empty;
  }

  /** Gets the value for the `aria-labelledby` attribute of the inputs. */
  _getAriaLabelledby() {
    const formField = this._formField;
    return formField && formField._hasFloatingLabel() ? formField._labelId : null;
  }

  /** Updates the focused state of the range input. */
  _updateFocus(origin: FocusOrigin) {
    this.focused = origin !== null;
    this.stateChanges.next();
  }

  /** Re-runs the validators on the start/end inputs. */
  private _revalidate() {
    if (this._startInput) {
      this._startInput._validatorOnChange();
    }

    if (this._endInput) {
      this._endInput._validatorOnChange();
    }
  }

  /** Registers the current date selection model with the start/end inputs. */
  private _registerModel(model: MatDateSelectionModel<DateRange<D>>) {
    if (this._startInput) {
      this._startInput._registerModel(model);
    }

    if (this._endInput) {
      this._endInput._registerModel(model);
    }
  }

  static ngAcceptInputType_required: BooleanInput;
  static ngAcceptInputType_disabled: BooleanInput;
}
