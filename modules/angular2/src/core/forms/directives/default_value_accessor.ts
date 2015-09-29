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
    '(blur)': 'onTouched()'
  }
})
export class DefaultValueAccessor implements ControlValueAccessor {
  onChange = (_) => {};
  onTouched = () => {};

  constructor(@Self() cd: NgControl, private _renderer: Renderer, private _elementRef: ElementRef) {
    cd.valueAccessor = this;
  }

  writeValue(value: any): void {
    var normalizedValue = isBlank(value) ? '' : value;
    setProperty(this._renderer, this._elementRef, 'value', normalizedValue);
  }

  registerOnChange(fn: (_: any) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
}
