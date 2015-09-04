import {Renderer} from 'angular2/render';
import {Directive} from 'angular2/metadata';
import {ElementRef} from 'angular2/core';
import {Self} from 'angular2/di';

import {NgControl} from './ng_control';
import {ControlValueAccessor} from './control_value_accessor';
import {isPresent} from 'angular2/src/core/facade/lang';
import {setProperty} from './shared';

/**
 * The accessor for writing a value and listening to changes on a checkbox input element.
 *
 *  # Example
 *  ```
 *  <input type="checkbox" [ng-control]="rememberLogin">
 *  ```
 */
@Directive({
  selector:
      'input[type=checkbox][ng-control],input[type=checkbox][ng-form-control],input[type=checkbox][ng-model]',
  host: {
    '(change)': 'onChange($event.target.checked)',
    '(blur)': 'onTouched()',
    '[class.ng-untouched]': 'ngClassUntouched',
    '[class.ng-touched]': 'ngClassTouched',
    '[class.ng-pristine]': 'ngClassPristine',
    '[class.ng-dirty]': 'ngClassDirty',
    '[class.ng-valid]': 'ngClassValid',
    '[class.ng-invalid]': 'ngClassInvalid'
  }
})
export class CheckboxControlValueAccessor implements ControlValueAccessor {
  private _cd: NgControl;
  onChange = (_) => {};
  onTouched = () => {};

  constructor(@Self() cd: NgControl, private _renderer: Renderer, private _elementRef: ElementRef) {
    this._cd = cd;
    cd.valueAccessor = this;
  }

  writeValue(value: any) { setProperty(this._renderer, this._elementRef, "checked", value); }

  get ngClassUntouched(): boolean {
    return isPresent(this._cd.control) ? this._cd.control.untouched : false;
  }
  get ngClassTouched(): boolean {
    return isPresent(this._cd.control) ? this._cd.control.touched : false;
  }
  get ngClassPristine(): boolean {
    return isPresent(this._cd.control) ? this._cd.control.pristine : false;
  }
  get ngClassDirty(): boolean {
    return isPresent(this._cd.control) ? this._cd.control.dirty : false;
  }
  get ngClassValid(): boolean {
    return isPresent(this._cd.control) ? this._cd.control.valid : false;
  }
  get ngClassInvalid(): boolean {
    return isPresent(this._cd.control) ? !this._cd.control.valid : false;
  }

  registerOnChange(fn: (_: any) => {}): void { this.onChange = fn; }
  registerOnTouched(fn: () => {}): void { this.onTouched = fn; }
}
