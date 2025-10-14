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
const CHECKBOX_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CheckboxControlValueAccessor),
  multi: true,
};
/**
 * @description
 * A `ControlValueAccessor` for writing a value and listening to changes on a checkbox input
 * element.
 *
 * @usageNotes
 *
 * ### Using a checkbox with a reactive form.
 *
 * The following example shows how to use a checkbox with a reactive form.
 *
 * ```ts
 * const rememberLoginControl = new FormControl();
 * ```
 *
 * ```html
 * <input type="checkbox" [formControl]="rememberLoginControl">
 * ```
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
let CheckboxControlValueAccessor = class CheckboxControlValueAccessor extends BuiltInControlValueAccessor {
  /**
   * Sets the "checked" property on the input element.
   * @docs-private
   */
  writeValue(value) {
    this.setProperty('checked', value);
  }
};
CheckboxControlValueAccessor = __decorate(
  [
    Directive({
      selector:
        'input[type=checkbox][formControlName],input[type=checkbox][formControl],input[type=checkbox][ngModel]',
      host: {'(change)': 'onChange($any($event.target).checked)', '(blur)': 'onTouched()'},
      providers: [CHECKBOX_VALUE_ACCESSOR],
      standalone: false,
    }),
  ],
  CheckboxControlValueAccessor,
);
export {CheckboxControlValueAccessor};
//# sourceMappingURL=checkbox_value_accessor.js.map
