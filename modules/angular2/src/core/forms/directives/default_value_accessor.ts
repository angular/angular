import {Directive} from 'angular2/src/core/metadata';
import {ElementRef} from 'angular2/src/core/compiler';
import {Renderer} from 'angular2/src/core/render';
import {Self} from 'angular2/src/core/di';
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
  private _cd: NgControl;
  onChange = (_) => {};
  onTouched = () => {};

  constructor(@Self() cd: NgControl, private _renderer: Renderer, private _elementRef: ElementRef) {
    this._cd = cd;
    cd.valueAccessor = this;
  }

  writeValue(value: any): void {
    var normalizedValue = isBlank(value) ? '' : value;
    setProperty(this._renderer, this._elementRef, 'value', normalizedValue);
  }

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

  registerOnChange(fn: (_: any) => void): void { this.onChange = fn; }

  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
}
