/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {Directive, forwardRef} from '@angular/core';
import {BuiltInControlValueAccessor, NG_VALUE_ACCESSOR} from './control_value_accessor';
const RANGE_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => RangeValueAccessor),
  multi: true,
};
/**
 * @description
 * The `ControlValueAccessor` for writing a range value and listening to range input changes.
 * The value accessor is used by the `FormControlDirective`, `FormControlName`, and  `NgModel`
 * directives.
 *
 * @usageNotes
 *
 * ### Using a range input with a reactive form
 *
 * The following example shows how to use a range input with a reactive form.
 *
 * ```ts
 * const ageControl = new FormControl();
 * ```
 *
 * ```html
 * <input type="range" [formControl]="ageControl">
 * ```
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
let RangeValueAccessor = class RangeValueAccessor extends BuiltInControlValueAccessor {
  /**
   * Sets the "value" property on the input element.
   * @docs-private
   */
  writeValue(value) {
    this.setProperty('value', parseFloat(value));
  }
  /**
   * Registers a function called when the control value changes.
   * @docs-private
   */
  registerOnChange(fn) {
    this.onChange = (value) => {
      fn(value == '' ? null : parseFloat(value));
    };
  }
};
RangeValueAccessor = __decorate(
  [
    Directive({
      selector:
        'input[type=range][formControlName],input[type=range][formControl],input[type=range][ngModel]',
      host: {
        '(change)': 'onChange($any($event.target).value)',
        '(input)': 'onChange($any($event.target).value)',
        '(blur)': 'onTouched()',
      },
      providers: [RANGE_VALUE_ACCESSOR],
      standalone: false,
    }),
  ],
  RangeValueAccessor,
);
export {RangeValueAccessor};
//# sourceMappingURL=range_value_accessor.js.map
