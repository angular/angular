import {Directive, HostListener, HostBinding} from 'angular2/src/core/metadata';
import {Renderer} from 'angular2/src/core/render';
import {ElementRef} from 'angular2/src/core/compiler';
import {Self} from 'angular2/src/core/di';

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
      'input[type=checkbox][ng-control],input[type=checkbox][ng-form-control],input[type=checkbox][ng-model]'
})
export class CheckboxControlValueAccessor implements ControlValueAccessor {
  private _cd: NgControl;
  @HostListener('change', ['$event.target.checked']) onChange = (_) => {};
  @HostListener('blur') onTouched = () => {};

  constructor(@Self() cd: NgControl, private _renderer: Renderer, private _elementRef: ElementRef) {
    this._cd = cd;
    cd.valueAccessor = this;
  }

  writeValue(value: any): void { setProperty(this._renderer, this._elementRef, "checked", value); }

  @HostBinding('class.ng-untouched')
  get ngClassUntouched(): boolean {
    return isPresent(this._cd.control) ? this._cd.control.untouched : false;
  }

  @HostBinding('class.ng-touched')
  get ngClassTouched(): boolean {
    return isPresent(this._cd.control) ? this._cd.control.touched : false;
  }

  @HostBinding('class.ng-pristine')
  get ngClassPristine(): boolean {
    return isPresent(this._cd.control) ? this._cd.control.pristine : false;
  }

  @HostBinding('class.ng-dirty')
  get ngClassDirty(): boolean {
    return isPresent(this._cd.control) ? this._cd.control.dirty : false;
  }

  @HostBinding('class.ng-valid')
  get ngClassValid(): boolean {
    return isPresent(this._cd.control) ? this._cd.control.valid : false;
  }

  @HostBinding('class.ng-invalid')
  get ngClassInvalid(): boolean {
    return isPresent(this._cd.control) ? !this._cd.control.valid : false;
  }

  registerOnChange(fn: (_: any) => {}): void { this.onChange = fn; }
  registerOnTouched(fn: () => {}): void { this.onTouched = fn; }
}
