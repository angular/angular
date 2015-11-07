import {Directive} from 'angular2/src/core/metadata';
import {Renderer} from 'angular2/src/core/render';
import {ElementRef} from 'angular2/src/core/linker';
import {Self, forwardRef, Provider} from 'angular2/src/core/di';

import {NG_VALUE_ACCESSOR, ControlValueAccessor} from './control_value_accessor';
import {CONST_EXPR} from 'angular2/src/facade/lang';
import {setProperty} from './shared';

const CHECKBOX_VALUE_ACCESSOR = CONST_EXPR(new Provider(
    NG_VALUE_ACCESSOR, {useExisting: forwardRef(() => CheckboxControlValueAccessor), multi: true}));

/**
 * The accessor for writing a value and listening to changes on a checkbox input element.
 *
 *  ### Example
 *  ```
 *  <input type="checkbox" ng-control="rememberLogin">
 *  ```
 */
@Directive({
  selector:
      'input[type=checkbox][ng-control],input[type=checkbox][ng-form-control],input[type=checkbox][ng-model]',
  host: {'(change)': 'onChange($event.target.checked)', '(blur)': 'onTouched()'},
  bindings: [CHECKBOX_VALUE_ACCESSOR]
})
export class CheckboxControlValueAccessor implements ControlValueAccessor {
  onChange = (_) => {};
  onTouched = () => {};

  constructor(private _renderer: Renderer, private _elementRef: ElementRef) {}

  writeValue(value: any): void { setProperty(this._renderer, this._elementRef, "checked", value); }
  registerOnChange(fn: (_: any) => {}): void { this.onChange = fn; }
  registerOnTouched(fn: () => {}): void { this.onTouched = fn; }
}
