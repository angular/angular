import {Directive, ElementRef, Renderer, Self, forwardRef, Provider} from 'angular2/core';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from './control_value_accessor';
import {isBlank, CONST_EXPR} from 'angular2/src/facade/lang';

const DEFAULT_VALUE_ACCESSOR = CONST_EXPR(new Provider(
    NG_VALUE_ACCESSOR, {useExisting: forwardRef(() => DefaultValueAccessor), multi: true}));

/**
 * The default accessor for writing a value and listening to changes that is used by the
 * {@link NgModel}, {@link NgFormControl}, and {@link NgControlName} directives.
 *
 *  ### Example
 *  ```
 *  <input type="text" ngControl="searchQuery">
 *  ```
 */
@Directive({
  selector:
      'input:not([type=checkbox])[ngControl],textarea[ngControl],input:not([type=checkbox])[ngFormControl],textarea[ngFormControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]',
  // TODO: vsavkin replace the above selector with the one below it once
  // https://github.com/angular/angular/issues/3011 is implemented
  // selector: '[ngControl],[ngModel],[ngFormControl]',
  host: {'(input)': 'onChange($event.target.value)', '(blur)': 'onTouched()'},
  bindings: [DEFAULT_VALUE_ACCESSOR]
})
export class DefaultValueAccessor implements ControlValueAccessor {
  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(private _renderer: Renderer, private _elementRef: ElementRef) {}

  writeValue(value: any): void {
    var normalizedValue = isBlank(value) ? '' : value;
    this._renderer.setElementProperty(this._elementRef.nativeElement, 'value', normalizedValue);
  }

  registerOnChange(fn: (_: any) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
}
