import {Directive} from 'angular2/angular2';
import {ControlDirective} from './control_directive';
import {ControlValueAccessor} from './control_value_accessor';

/**
 * The accessor for writing a value and listening to changes on a checkbox input element.
 *
 *
 *  # Example
 *  ```
 *  <input type="checkbox" [ng-control]="rememberLogin">
 *  ```
 *
 * @exportedAs angular2/forms
 */
@Directive({
  selector:
      'input[type=checkbox][ng-control],input[type=checkbox][ng-form-control],input[type=checkbox][ng-model]',
  hostListeners: {'change': 'onChange($event.target.checked)', 'blur': 'onTouched()'},
  hostProperties: {
    'checked': 'checked',
    'cd.control?.untouched == true': 'class.ng-untouched',
    'cd.control?.touched == true': 'class.ng-touched',
    'cd.control?.pristine == true': 'class.ng-pristine',
    'cd.control?.dirty == true': 'class.ng-dirty',
    'cd.control?.valid == true': 'class.ng-valid',
    'cd.control?.valid == false': 'class.ng-invalid'
  }
})
export class CheckboxControlValueAccessor implements ControlValueAccessor {
  checked: boolean;
  onChange: Function;
  onTouched: Function;

  constructor(private cd: ControlDirective) {
    this.onChange = (_) => {};
    this.onTouched = (_) => {};
    cd.valueAccessor = this;
  }

  writeValue(value) { this.checked = value; }

  registerOnChange(fn): void { this.onChange = fn; }
  registerOnTouched(fn): void { this.onTouched = fn; }
}