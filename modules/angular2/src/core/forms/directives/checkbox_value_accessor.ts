import {Directive} from 'angular2/src/core/metadata';
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
      'input[type=checkbox][ng-control],input[type=checkbox][ng-form-control],input[type=checkbox][ng-model]',
  host: {
    '(change)': 'onChange($event.target.checked)',
    '(blur)': 'onTouched()'
  }
})
export class CheckboxControlValueAccessor implements ControlValueAccessor {
  onChange = (_) => {};
  onTouched = () => {};

  constructor(@Self() cd: NgControl, private _renderer: Renderer, private _elementRef: ElementRef) {
    cd.valueAccessor = this;
  }

  writeValue(value: any): void { setProperty(this._renderer, this._elementRef, "checked", value); }

  registerOnChange(fn: (_: any) => {}): void { this.onChange = fn; }
  registerOnTouched(fn: () => {}): void { this.onTouched = fn; }
}
