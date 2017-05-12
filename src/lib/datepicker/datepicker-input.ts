import {
  AfterContentInit,
  Directive,
  ElementRef,
  EventEmitter,
  forwardRef,
  Inject,
  Input,
  OnDestroy,
  Optional,
  Renderer2
} from '@angular/core';
import {MdDatepicker} from './datepicker';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {Subscription} from 'rxjs/Subscription';
import {MdInputContainer} from '../input/input-container';
import {DOWN_ARROW} from '../core/keyboard/keycodes';
import {DateAdapter} from '../core/datetime/index';
import {createMissingDateImplError} from './datepicker-errors';
import {MD_DATE_FORMATS, MdDateFormats} from '../core/datetime/date-formats';


export const MD_DATEPICKER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MdDatepickerInput),
  multi: true
};


export const MD_DATEPICKER_VALIDATORS: any = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => MdDatepickerInput),
  multi: true
};


/** Directive used to connect an input to a MdDatepicker. */
@Directive({
  selector: 'input[mdDatepicker], input[matDatepicker]',
  providers: [MD_DATEPICKER_VALUE_ACCESSOR, MD_DATEPICKER_VALIDATORS],
  host: {
    '[attr.aria-expanded]': '_datepicker?.opened || "false"',
    '[attr.aria-haspopup]': 'true',
    '[attr.aria-owns]': '_datepicker?.id',
    '[attr.min]': 'min ? _dateAdapter.getISODateString(min) : null',
    '[attr.max]': 'max ? _dateAdapter.getISODateString(max) : null',
    '(input)': '_onInput($event.target.value)',
    '(blur)': '_onTouched()',
    '(keydown)': '_onKeydown($event)',
  }
})
export class MdDatepickerInput<D> implements AfterContentInit, ControlValueAccessor, OnDestroy,
    Validator {
  /** The datepicker that this input is associated with. */
  @Input()
  set mdDatepicker(value: MdDatepicker<D>) {
    if (value) {
      this._datepicker = value;
      this._datepicker._registerInput(this);
    }
  }
  _datepicker: MdDatepicker<D>;

  @Input() set matDatepicker(value: MdDatepicker<D>) { this.mdDatepicker = value; }

  @Input() set mdDatepickerFilter(filter: (date: D | null) => boolean) {
    this._dateFilter = filter;
    this._validatorOnChange();
  }
  _dateFilter: (date: D | null) => boolean;

  @Input() set matDatepickerFilter(filter: (date: D | null) => boolean) {
    this.mdDatepickerFilter = filter;
  }

  /** The value of the input. */
  @Input()
  get value(): D {
    return this._dateAdapter.parse(this._elementRef.nativeElement.value,
        this._dateFormats.parse.dateInput);
  }
  set value(value: D) {
    let date = this._dateAdapter.parse(value, this._dateFormats.parse.dateInput);
    let oldDate = this.value;
    this._renderer.setProperty(this._elementRef.nativeElement, 'value',
        date ? this._dateAdapter.format(date, this._dateFormats.display.dateInput) : '');
    if (!this._dateAdapter.sameDate(oldDate, date)) {
      this._valueChange.emit(date);
    }
  }

  /** The minimum valid date. */
  @Input()
  get min(): D { return this._min; }
  set min(value: D) {
    this._min = value;
    this._validatorOnChange();
  }
  private _min: D;

  /** The maximum valid date. */
  @Input()
  get max(): D { return this._max; }
  set max(value: D) {
    this._max = value;
    this._validatorOnChange();
  }
  private _max: D;

  /** Emits when the value changes (either due to user input or programmatic change). */
  _valueChange = new EventEmitter<D>();

  _onTouched = () => {};

  private _cvaOnChange = (value: any) => {};

  private _validatorOnChange = () => {};

  private _datepickerSubscription: Subscription;

  /** The form control validator for the min date. */
  private _minValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    return (!this.min || !control.value ||
        this._dateAdapter.compareDate(this.min, control.value) < 0) ?
        null : {'mdDatepickerMin': {'min': this.min, 'actual': control.value}};
  }

  /** The form control validator for the max date. */
  private _maxValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    return (!this.max || !control.value ||
        this._dateAdapter.compareDate(this.max, control.value) > 0) ?
        null : {'mdDatepickerMax': {'max': this.max, 'actual': control.value}};
  }

  /** The form control validator for the date filter. */
  private _filterValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    return !this._dateFilter || !control.value || this._dateFilter(control.value) ?
        null : {'mdDatepickerFilter': true};
  }

  /** The combined form control validator for this input. */
  private _validator: ValidatorFn =
      Validators.compose([this._minValidator, this._maxValidator, this._filterValidator]);

  constructor(
      private _elementRef: ElementRef,
      private _renderer: Renderer2,
      @Optional() private _dateAdapter: DateAdapter<D>,
      @Optional() @Inject(MD_DATE_FORMATS) private _dateFormats: MdDateFormats,
      @Optional() private _mdInputContainer: MdInputContainer) {
    if (!this._dateAdapter) {
      throw createMissingDateImplError('DateAdapter');
    }
    if (!this._dateFormats) {
      throw createMissingDateImplError('MD_DATE_FORMATS');
    }
  }

  ngAfterContentInit() {
    if (this._datepicker) {
      this._datepickerSubscription =
          this._datepicker.selectedChanged.subscribe((selected: D) => {
            this.value = selected;
            this._cvaOnChange(selected);
          });
    }
  }

  ngOnDestroy() {
    if (this._datepickerSubscription) {
      this._datepickerSubscription.unsubscribe();
    }
  }

  registerOnValidatorChange(fn: () => void): void {
    this._validatorOnChange = fn;
  }

  validate(c: AbstractControl): ValidationErrors | null {
    return this._validator ? this._validator(c) : null;
  }

  /**
   * Gets the element that the datepicker popup should be connected to.
   * @return The element to connect the popup to.
   */
  getPopupConnectionElementRef(): ElementRef {
    return this._mdInputContainer ? this._mdInputContainer.underlineRef : this._elementRef;
  }

  // Implemented as part of ControlValueAccessor
  writeValue(value: D): void {
    this.value = value;
  }

  // Implemented as part of ControlValueAccessor
  registerOnChange(fn: (value: any) => void): void {
    this._cvaOnChange = fn;
  }

  // Implemented as part of ControlValueAccessor
  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  // Implemented as part of ControlValueAccessor
  setDisabledState(disabled: boolean): void {
    this._renderer.setProperty(this._elementRef.nativeElement, 'disabled', disabled);
  }

  _onKeydown(event: KeyboardEvent) {
    if (event.altKey && event.keyCode === DOWN_ARROW) {
      this._datepicker.open();
      event.preventDefault();
    }
  }

  _onInput(value: string) {
    let date = this._dateAdapter.parse(value, this._dateFormats.parse.dateInput);
    this._cvaOnChange(date);
    this._valueChange.emit(date);
  }
}
