import {Directive, Renderer, ElementRef} from 'angular2/angular2';
import {NgControl} from './ng_control';
import {ControlValueAccessor} from './control_value_accessor';
import {isPresent} from 'angular2/src/facade/lang';
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
    '[class.ng-untouched]': 'ngClassUntouched',
    '[class.ng-touched]': 'ngClassTouched',
    '[class.ng-pristine]': 'ngClassPristine',
    '[class.ng-dirty]': 'ngClassDirty',
    '[class.ng-valid]': 'ngClassValid',
    '[class.ng-invalid]': 'ngClassInvalid'
  }
})
export class CheckboxControlValueAccessor implements ControlValueAccessor {
  checked: boolean;
  onChange = (_) => {};
  onTouched = () => {};

  constructor(private cd: NgControl, private renderer: Renderer, private elementRef: ElementRef) {
    cd.valueAccessor = this;
  }

  writeValue(value) {
    // both this.checked and setProperty are required at the moment
    // remove when a proper imperative API is provided
    this.checked = value;
    setProperty(this.renderer, this.elementRef, "checked", value);
  }

  get ngClassUntouched(): boolean {
    return isPresent(this.cd.control) ? this.cd.control.untouched : false;
  }
  get ngClassTouched(): boolean {
    return isPresent(this.cd.control) ? this.cd.control.touched : false;
  }
  get ngClassPristine(): boolean {
    return isPresent(this.cd.control) ? this.cd.control.pristine : false;
  }
  get ngClassDirty(): boolean { return isPresent(this.cd.control) ? this.cd.control.dirty : false; }
  get ngClassValid(): boolean { return isPresent(this.cd.control) ? this.cd.control.valid : false; }
  get ngClassInvalid(): boolean {
    return isPresent(this.cd.control) ? !this.cd.control.valid : false;
  }

  registerOnChange(fn): void { this.onChange = fn; }
  registerOnTouched(fn): void { this.onTouched = fn; }
}
