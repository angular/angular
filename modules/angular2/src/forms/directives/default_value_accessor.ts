import {Renderer} from 'angular2/render';
import {Directive} from 'angular2/metadata';
import {ElementRef} from 'angular2/core';
import {Self} from 'angular2/di';
import {NgControl} from './ng_control';
import {ControlValueAccessor} from './control_value_accessor';
import {isBlank, isPresent} from 'angular2/src/core/facade/lang';
import {setProperty} from './shared';

/**
 * The default accessor for writing a value and listening to changes that is used by the
 * {@link NgModel}, {@link NgFormControl}, and {@link NgControlName} directives.
 *
 *  # Example
 *  ```
 *  <input type="text" [(ng-model)]="searchQuery">
 *  ```
 */
@Directive({
  selector:
      'input:not([type=checkbox])[ng-control],textarea[ng-control],input:not([type=checkbox])[ng-form-control],textarea[ng-form-control],input:not([type=checkbox])[ng-model],textarea[ng-model]',
  host: {
    '(change)': 'onChange($event.target.value)',
    '(input)': 'onChange($event.target.value)',
    '(blur)': 'onTouched()',
    '[class.ng-untouched]': 'ngClassUntouched',
    '[class.ng-touched]': 'ngClassTouched',
    '[class.ng-pristine]': 'ngClassPristine',
    '[class.ng-dirty]': 'ngClassDirty',
    '[class.ng-valid]': 'ngClassValid',
    '[class.ng-invalid]': 'ngClassInvalid'
  }
})
export class DefaultValueAccessor implements ControlValueAccessor {
  private cd: NgControl;
  onChange = (_) => {};
  onTouched = () => {};

  constructor(@Self() cd: NgControl, private renderer: Renderer, private elementRef: ElementRef) {
    this.cd = cd;
    cd.valueAccessor = this;
  }

  writeValue(value: any) {
    // both this.value and setProperty are required at the moment
    // remove when a proper imperative API is provided
    var normalizedValue = isBlank(value) ? '' : value;
    setProperty(this.renderer, this.elementRef, 'value', normalizedValue);
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

  registerOnChange(fn: (_: any) => void): void { this.onChange = fn; }

  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
}
