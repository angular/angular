import {Directive, HostBinding, HostListener} from 'angular2/src/core/metadata';
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
      'input:not([type=checkbox])[ng-control],textarea[ng-control],input:not([type=checkbox])[ng-form-control],textarea[ng-form-control],input:not([type=checkbox])[ng-model],textarea[ng-model]'
})
export class DefaultValueAccessor implements ControlValueAccessor {
  private _cd: NgControl;
  @HostListener('change', ['$event.target.value'])
  @HostListener('input', ['$event.target.value'])
  onChange = (_) => {};
  @HostListener('blur') onTouched = () => {};

  constructor(@Self() cd: NgControl, private _renderer: Renderer, private _elementRef: ElementRef) {
    this._cd = cd;
    cd.valueAccessor = this;
  }

  writeValue(value: any): void {
    var normalizedValue = isBlank(value) ? '' : value;
    setProperty(this._renderer, this._elementRef, 'value', normalizedValue);
  }

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

  registerOnChange(fn: (_: any) => void): void { this.onChange = fn; }

  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
}
