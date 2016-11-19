/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, OnInit, Provider, Renderer, forwardRef} from '@angular/core';
import {getDOM} from '../private_import_platform-browser';

import {ControlValueAccessor, NG_VALUE_ACCESSOR} from './control_value_accessor';

export const DEFAULT_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DefaultValueAccessor),
  multi: true
};

/**
 * The default accessor for writing a value and listening to changes that is used by the
 * {@link NgModel}, {@link FormControlDirective}, and {@link FormControlName} directives.
 *
 *  ### Example
 *  ```
 *  <input type="text" name="searchQuery" ngModel>
 *  ```
 *
 *  @stable
 */
@Directive({
  selector:
      'input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]',
  // TODO: vsavkin replace the above selector with the one below it once
  // https://github.com/angular/angular/issues/3011 is implemented
  // selector: '[ngControl],[ngModel],[ngFormControl]',
  providers: [DEFAULT_VALUE_ACCESSOR]
})
export class DefaultValueAccessor implements ControlValueAccessor,
    OnInit {
  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(private _renderer: Renderer, private _elementRef: ElementRef) {}

  ngOnInit(): void {
    this._renderer.listen(this._elementRef.nativeElement, 'blur', () => this.onTouched());

    // On IE9 the input event is not fired when backspace or delete key are pressed or when
    // cut is performed. So it's better for us to use keydown/change events instead.
    if (getDOM().msie() === 9) {
      this._renderer.listen(this._elementRef.nativeElement, 'change', (event: KeyboardEvent) => {
        this.onChange((event.target as HTMLInputElement).value);
      });
      this._renderer.listen(this._elementRef.nativeElement, 'keydown', (event: KeyboardEvent) => {
        const key: number = event.keyCode;
        // ignore
        //    command            modifiers                   arrows
        if (key === 91 || (15 < key && key < 19) || (37 <= key && key <= 40)) return;

        this.onChange((event.target as HTMLInputElement).value);
      });
    } else {
      this._renderer.listen(this._elementRef.nativeElement, 'input', (event: KeyboardEvent) => {
        this.onChange((event.target as HTMLInputElement).value);
      });
    }
  }

  writeValue(value: any): void {
    const normalizedValue = value == null ? '' : value;
    this._renderer.setElementProperty(this._elementRef.nativeElement, 'value', normalizedValue);
  }

  registerOnChange(fn: (_: any) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }

  setDisabledState(isDisabled: boolean): void {
    this._renderer.setElementProperty(this._elementRef.nativeElement, 'disabled', isDisabled);
  }
}
