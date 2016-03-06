import {Directive, ElementRef, Renderer, Self, forwardRef, Provider} from 'angular2/core';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from './control_value_accessor';
import {isBlank, CONST_EXPR, NumberWrapper} from 'angular2/src/facade/lang';

const NUMBER_VALUE_ACCESSOR = CONST_EXPR(new Provider(
    NG_VALUE_ACCESSOR, {useExisting: forwardRef(() => NumberValueAccessor), multi: true}));

/**
 * The accessor for writing a number value and listening to changes that is used by the
 * {@link NgModel}, {@link NgFormControl}, and {@link NgControlName} directives.
 *
 *  ### Example
 *  ```
 *  <input type="number" [(ngModel)]="age">
 *  ```
 */
@Directive({
  selector:
      'input[type=number][ngControl],input[type=number][ngFormControl],input[type=number][ngModel]',
  host: {
    '(change)': 'onChange($event.target.value)',
    '(input)': 'onChange($event.target.value)',
    '(blur)': 'onTouched()'
  },
  bindings: [NUMBER_VALUE_ACCESSOR]
})
export class NumberValueAccessor implements ControlValueAccessor {
  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(private _renderer: Renderer, private _elementRef: ElementRef) {}

  writeValue(value: number): void {
    this._renderer.setElementProperty(this._elementRef.nativeElement, 'value', value);
  }

  registerOnChange(fn: (_: number) => void): void {
    this.onChange = (value) => { fn(NumberWrapper.parseFloat(value)); };
  }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
}
