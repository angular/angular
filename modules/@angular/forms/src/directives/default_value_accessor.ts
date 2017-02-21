/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, NgZone, OnDestroy, Renderer, forwardRef} from '@angular/core';

import {ControlValueAccessor, NG_VALUE_ACCESSOR} from './control_value_accessor';

export const DEFAULT_VALUE_ACCESSOR: any = {
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
  host: {'(input)': 'onChange($event.target.value)', '(blur)': 'onTouched()'},
  providers: [DEFAULT_VALUE_ACCESSOR]
})
export class DefaultValueAccessor implements ControlValueAccessor,
    OnDestroy {
  onChange = (_: any) => {};
  onTouched = () => {};
  private _prevValue: any;
  private _intervalId: any;

  constructor(private _renderer: Renderer, private _elementRef: ElementRef, private _zone: NgZone) {
  }

  writeValue(value: any): void {
    const normalizedValue = value == null ? '' : value;
    this._renderer.setElementProperty(this._elementRef.nativeElement, 'value', normalizedValue);
  }

  registerOnChange(fn: (_: any) => void): void {
    this.onChange = (value: any) => {
      if (value !== this._prevValue) {
        this._prevValue = value;
        fn(value);
      }
    };
    this._zone.runOutsideAngular(() => {
      this._intervalId = setInterval(() => {
        const value: any = this._elementRef.nativeElement.value;
        if (value !== this._prevValue) {
          this._zone.run(() => {
            this._prevValue = value;
            fn(value);
          });
        }
      }, 20);
    });
  }

  registerOnTouched(fn: () => void): void { this.onTouched = fn; }

  setDisabledState(isDisabled: boolean): void {
    this._renderer.setElementProperty(this._elementRef.nativeElement, 'disabled', isDisabled);
  }

  ngOnDestroy(): void {
    if (this._intervalId != null) {
      clearInterval(this._intervalId);
    }
  }
}
