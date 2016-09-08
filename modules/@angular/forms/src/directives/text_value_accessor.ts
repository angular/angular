/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, Renderer, forwardRef} from '@angular/core';

import {NumberWrapper, isBlank} from '../facade/lang';

import {ControlValueAccessor, NG_VALUE_ACCESSOR} from './control_value_accessor';

export const TEXT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => TextValueAccessor),
  multi: true
};

/**
 * The accessor for writing a text value and listening to changes that is used by the
 * {@link NgModel}, {@link FormControlDirective}, and {@link FormControlName} directives.
 *
 *  ### Example
 *  ```
 *  <input type="text" [(ngModel)]="age">
 *  ```
 */
@Directive({
  selector:
      'input[type=text][formControlName],input[type=text][formControl],input[type=text][ngModel]',
  host: {
    '(change)': 'onChange($event.target.value)',
    '(input)': 'onChange($event.target.value)',
    '(blur)': 'onTouched()'
  },
  providers: [TEXT_VALUE_ACCESSOR]
})
export class TextValueAccessor implements ControlValueAccessor {
  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(private _renderer: Renderer, private _elementRef: ElementRef) {}

  writeValue(value: number): void {
    // The value needs to be normalized for IE9, otherwise it is set to 'undefined' when undefined
    const normalizedValue = isBlank(value) ? '' : value;
    this._renderer.setElementProperty(this._elementRef.nativeElement, 'value', normalizedValue);
  }

  registerOnChange(fn: (_: number) => void): void {
    this.onChange = (value) => { fn(value == '' ? null : NumberWrapper.parseFloat(value)); };
  }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }

  setDisabledState(isDisabled: boolean): void {
    this._renderer.setElementProperty(this._elementRef.nativeElement, 'disabled', isDisabled);
  }
}
