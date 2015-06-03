import {Directive} from 'angular2/angular2';
import {ControlDirective} from './control_directive';
import {ControlValueAccessor} from './control_value_accessor';

/**
 * The default accessor for writing a value and listening to changes that is used by a
 * {@link Control} directive.
 *
 * This is the default strategy that Angular uses when no other accessor is applied.
 *
 *  # Example
 *  ```
 *  <input type="text" [ng-form-control]="loginControl">
 *  ```
 *
 * @exportedAs angular2/forms
 */
@Directive({
  selector:
      'input:not([type=checkbox])[ng-control],textarea[ng-control],input:not([type=checkbox])[ng-form-control],textarea[ng-form-control],input:not([type=checkbox])[ng-model],textarea[ng-model]',
  hostListeners: {
    'change': 'onChange($event.target.value)',
    'input': 'onChange($event.target.value)',
    'blur': 'onTouched()'
  },
  hostProperties: {
    'value': 'value',
    'cd.control?.untouched == true': 'class.ng-untouched',
    'cd.control?.touched == true': 'class.ng-touched',
    'cd.control?.pristine == true': 'class.ng-pristine',
    'cd.control?.dirty == true': 'class.ng-dirty',
    'cd.control?.valid == true': 'class.ng-valid',
    'cd.control?.valid == false': 'class.ng-invalid'
  }
})
export class DefaultValueAccessor implements ControlValueAccessor {
  value = null;
  onChange: Function;
  onTouched: Function;

  constructor(private cd: ControlDirective) {
    this.onChange = (_) => {};
    this.onTouched = (_) => {};
    cd.valueAccessor = this;
  }

  writeValue(value) { this.value = value; }

  registerOnChange(fn): void { this.onChange = fn; }

  registerOnTouched(fn): void { this.onTouched = fn; }
}