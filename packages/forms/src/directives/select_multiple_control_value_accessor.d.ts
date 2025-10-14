/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ElementRef, OnDestroy, Renderer2 } from '@angular/core';
import { BuiltInControlValueAccessor, ControlValueAccessor } from './control_value_accessor';
/**
 * @description
 * The `ControlValueAccessor` for writing multi-select control values and listening to multi-select
 * control changes. The value accessor is used by the `FormControlDirective`, `FormControlName`, and
 * `NgModel` directives.
 *
 * @see {@link SelectControlValueAccessor}
 *
 * @usageNotes
 *
 * ### Using a multi-select control
 *
 * The follow example shows you how to use a multi-select control with a reactive form.
 *
 * ```ts
 * const countryControl = new FormControl();
 * ```
 *
 * ```html
 * <select multiple name="countries" [formControl]="countryControl">
 *   @for(country of countries; track $index) {
 *      <option [ngValue]="country">{{ country.name }}</option>
 *   }
 * </select>
 * ```
 *
 * ### Customizing option selection
 *
 * To customize the default option comparison algorithm, `<select>` supports `compareWith` input.
 * See the `SelectControlValueAccessor` for usage.
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
export declare class SelectMultipleControlValueAccessor extends BuiltInControlValueAccessor implements ControlValueAccessor {
    /**
     * The current value.
     * @docs-private
     */
    value: any;
    /** @internal */
    _optionMap: Map<string, ɵNgSelectMultipleOption>;
    /** @internal */
    _idCounter: number;
    /**
     * @description
     * Tracks the option comparison algorithm for tracking identities when
     * checking for changes.
     */
    set compareWith(fn: (o1: any, o2: any) => boolean);
    private _compareWith;
    /**
     * Sets the "value" property on one or of more of the select's options.
     * @docs-private
     */
    writeValue(value: any): void;
    /**
     * Registers a function called when the control value changes
     * and writes an array of the selected options.
     * @docs-private
     */
    registerOnChange(fn: (value: any) => any): void;
    /** @internal */
    _registerOption(value: ɵNgSelectMultipleOption): string;
    /** @internal */
    _getOptionId(value: any): string | null;
    /** @internal */
    _getOptionValue(valueString: string): any;
}
/**
 * @description
 * Marks `<option>` as dynamic, so Angular can be notified when options change.
 *
 * @see {@link SelectMultipleControlValueAccessor}
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
export declare class ɵNgSelectMultipleOption implements OnDestroy {
    private _element;
    private _renderer;
    private _select;
    id: string;
    /** @internal */
    _value: any;
    constructor(_element: ElementRef, _renderer: Renderer2, _select: SelectMultipleControlValueAccessor);
    /**
     * @description
     * Tracks the value bound to the option element. Unlike the value binding,
     * ngValue supports binding to objects.
     */
    set ngValue(value: any);
    /**
     * @description
     * Tracks simple string values bound to the option element.
     * For objects, use the `ngValue` input binding.
     */
    set value(value: any);
    /** @internal */
    _setElementValue(value: string): void;
    /** @internal */
    _setSelected(selected: boolean): void;
    /** @docs-private */
    ngOnDestroy(): void;
}
export { ɵNgSelectMultipleOption as NgSelectMultipleOption };
