import {Directive} from 'angular2/src/core/metadata';
import {ElementRef} from 'angular2/src/core/linker';
import {Renderer} from 'angular2/src/core/render';
import {Self, forwardRef, Provider} from 'angular2/src/core/di';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from './control_value_accessor';
import {isBlank, CONST_EXPR, NumberWrapper} from 'angular2/src/facade/lang';
import {setProperty} from './shared';

const NUMBER_VALUE_ACCESSOR = CONST_EXPR(new Provider(
    NG_VALUE_ACCESSOR, {useExisting: forwardRef(() => NumberValueAccessor), multi: true}));

/**
 * The accessor for writing a number value and listening to changes that is used by the
 * {@link NgModel}, {@link NgFormControl}, and {@link NgControlName} directives.
 *
 *  ### Example
 *  ```
 *  <input type="number" [(ng-model)]="age">
 *  ```
 */
@Directive({
  selector:
      'input[type=number][ng-control],input[type=number][ng-form-control],input[type=number][ng-model]',
  host: {
    '(change)': 'onChange($event.target.value)',
    '(input)': 'onChange($event.target.value)',
    '(blur)': 'onTouched()'
  },
  bindings: [NUMBER_VALUE_ACCESSOR]
})
export class NumberValueAccessor implements ControlValueAccessor {
  onChange = (_) => {};
  onTouched = () => {};

  constructor(private _renderer: Renderer, private _elementRef: ElementRef) {}

  writeValue(value: number): void { setProperty(this._renderer, this._elementRef, 'value', value); }

  registerOnChange(fn: (_: number) => void): void {
    this.onChange = (value) => { fn(NumberWrapper.parseFloat(value)); };
  }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
}
