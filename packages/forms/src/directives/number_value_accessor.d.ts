/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { BuiltInControlValueAccessor, ControlValueAccessor } from './control_value_accessor';
/**
 * @description
 * The `ControlValueAccessor` for writing a number value and listening to number input changes.
 * The value accessor is used by the `FormControlDirective`, `FormControlName`, and `NgModel`
 * directives.
 *
 * @usageNotes
 *
 * ### Using a number input with a reactive form.
 *
 * The following example shows how to use a number input with a reactive form.
 *
 * ```ts
 * const totalCountControl = new FormControl();
 * ```
 *
 * ```html
 * <input type="number" [formControl]="totalCountControl">
 * ```
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
export declare class NumberValueAccessor extends BuiltInControlValueAccessor implements ControlValueAccessor {
    /**
     * Sets the "value" property on the input element.
     * @docs-private
     */
    writeValue(value: number): void;
    /**
     * Registers a function called when the control value changes.
     * @docs-private
     */
    registerOnChange(fn: (_: number | null) => void): void;
}
