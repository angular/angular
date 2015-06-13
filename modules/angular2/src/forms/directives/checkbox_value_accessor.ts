import {Directive, Renderer, ElementRef} from 'angular2/angular2';
import {NgControl} from './ng_control';
import {ControlValueAccessor} from './control_value_accessor';
import {setProperty} from './shared';

/**
 * The accessor for writing a value and listening to changes on a checkbox input element.
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
  host: {
    '(change)': 'onChange($event.target.checked)',
    '(blur)': 'onTouched()',
    '[checked]': 'checked',
    '[class.ng-untouched]': 'cd.control?.untouched == true',
    '[class.ng-touched]': 'cd.control?.touched == true',
    '[class.ng-pristine]': 'cd.control?.pristine == true',
    '[class.ng-dirty]': 'cd.control?.dirty == true',
    '[class.ng-valid]': 'cd.control?.valid == true',
    '[class.ng-invalid]': 'cd.control?.valid == false'
  }
})
export class CheckboxControlValueAccessor implements ControlValueAccessor {
  checked: boolean;
  onChange: Function;
  onTouched: Function;

  constructor(private cd: NgControl, private renderer: Renderer, private elementRef: ElementRef) {
    this.onChange = (_) => {};
    this.onTouched = (_) => {};
    cd.valueAccessor = this;
  }

  writeValue(value) {
    // both this.checked and setProperty are required at the moment
    // remove when a proper imperative API is provided
    this.checked = value;
    setProperty(this.renderer, this.elementRef, "checked", value);
  }

  registerOnChange(fn): void { this.onChange = fn; }
  registerOnTouched(fn): void { this.onTouched = fn; }
}
