import {
  Directive,
  ElementRef,
  Renderer,
  Self,
  forwardRef,
  Provider,
  Attribute,
  Input
} from 'angular2/core';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor
} from 'angular2/src/common/forms/directives/control_value_accessor';
import {CONST_EXPR} from 'angular2/src/facade/lang';

const RADIO_VALUE_ACCESSOR = CONST_EXPR(new Provider(
    NG_VALUE_ACCESSOR, {useExisting: forwardRef(() => RadioControlValueAccessor), multi: true}));

/**
 * The accessor for writing a radio control value and listening to changes that is used by the
 * {@link NgModel}, {@link NgFormControl}, and {@link NgControlName} directives.
 *
 *  ### Example
 *  ```
 *  <input type="radio" name="food" [(ng-model)]="food" value="chicken">
 *  <input type="radio" name="food" [(ng-model)]="food" value="fish">
 *  ```
 */
@Directive({
  selector:
      'input[type=radio][ng-control],input[type=radio][ng-form-control],input[type=radio][ng-model]',
  host: {
    '(click)': 'onChange($event.target.value)',
    '(input)': 'onChange($event.target.value)',
    '(blur)': 'onTouched()'
  },
  bindings: [RADIO_VALUE_ACCESSOR]
})
export class RadioControlValueAccessor implements ControlValueAccessor {
  @Input('value') optionValue: any;
  value: any;
  onChange = (_) => {};
  onTouched = () => {};

  constructor(private _renderer: Renderer, private _elementRef: ElementRef) {}

  private _updateCheckedState() {
    if (this.value == this.optionValue) {
      this._renderer.setElementProperty(this._elementRef, 'checked', true);
    }
  }

  writeValue(value: any): void {
    this.value = value;
    this._updateCheckedState();
  }

  registerOnChange(fn: (_: any) => void): void {
    this.onChange = (value) => { fn(this.optionValue); };
  }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
}
