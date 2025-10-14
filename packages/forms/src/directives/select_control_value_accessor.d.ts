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
 * The `ControlValueAccessor` for writing select control values and listening to select control
 * changes. The value accessor is used by the `FormControlDirective`, `FormControlName`, and
 * `NgModel` directives.
 *
 * @usageNotes
 *
 * ### Using select controls in a reactive form
 *
 * The following examples show how to use a select control in a reactive form.
 *
 * {@example forms/ts/reactiveSelectControl/reactive_select_control_example.ts region='Component'}
 *
 * ### Using select controls in a template-driven form
 *
 * To use a select in a template-driven form, simply add an `ngModel` and a `name`
 * attribute to the main `<select>` tag.
 *
 * {@example forms/ts/selectControl/select_control_example.ts region='Component'}
 *
 * ### Customizing option selection
 *
 * Angular uses object identity to select option. It's possible for the identities of items
 * to change while the data does not. This can happen, for example, if the items are produced
 * from an RPC to the server, and that RPC is re-run. Even if the data hasn't changed, the
 * second response will produce objects with different identities.
 *
 * To customize the default option comparison algorithm, `<select>` supports `compareWith` input.
 * `compareWith` takes a **function** which has two arguments: `option1` and `option2`.
 * If `compareWith` is given, Angular selects option by the return value of the function.
 *
 * ```ts
 * const selectedCountriesControl = new FormControl();
 * ```
 *
 * ```html
 * <select [compareWith]="compareFn"  [formControl]="selectedCountriesControl">
 *    @for(country of countries; track $index) {
 *        <option[ngValue]="country">{{country.name}}</option>
 *    }
 * </select>
 *
 * compareFn(c1: Country, c2: Country): boolean {
 *     return c1 && c2 ? c1.id === c2.id : c1 === c2;
 * }
 * ```
 *
 * **Note:** We listen to the 'change' event because 'input' events aren't fired
 * for selects in IE, see:
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/input_event#browser_compatibility
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
export declare class SelectControlValueAccessor extends BuiltInControlValueAccessor implements ControlValueAccessor {
    /** @docs-private */
    value: any;
    /** @internal */
    _optionMap: Map<string, any>;
    /** @internal */
    _idCounter: number;
    /**
     * @description
     * Tracks the option comparison algorithm for tracking identities when
     * checking for changes.
     */
    set compareWith(fn: (o1: any, o2: any) => boolean);
    private _compareWith;
    private readonly appRefInjector;
    private readonly destroyRef;
    private readonly cdr;
    private _queuedWrite;
    /**
     * This is needed to efficiently set the select value when adding/removing options. If
     * writeValue is instead called for every added/removed option, this results in exponentially
     * more _compareValue calls than the number of option elements (issue #41330).
     *
     * Secondly, calling writeValue when rendering individual option elements instead of after they
     * are all rendered caused an issue in Safari and IE 11 where the first option element failed
     * to be deselected when no option matched the select ngModel. This was because Angular would
     * set the select element's value property before appending the option's child text node to the
     * DOM (issue #14505).
     *
     * Finally, this approach is necessary to avoid an issue with delayed element removal when
     * using the animations module (in all browsers). Otherwise when a selected option is removed
     * (so no option matches the ngModel anymore), Angular would change the select element value
     * before actually removing the option from the DOM. Then when the option is finally removed
     * from the DOM, the browser would change the select value to that of the first option, even
     * though it doesn't match the ngModel (issue #18430).
     *
     * @internal
     */
    _writeValueAfterRender(): void;
    /**
     * Sets the "value" property on the select element.
     * @docs-private
     */
    writeValue(value: any): void;
    /**
     * Registers a function called when the control value changes.
     * @docs-private
     */
    registerOnChange(fn: (value: any) => any): void;
    /** @internal */
    _registerOption(): string;
    /** @internal */
    _getOptionId(value: any): string | null;
    /** @internal */
    _getOptionValue(valueString: string): any;
}
/**
 * @description
 * Marks `<option>` as dynamic, so Angular can be notified when options change.
 *
 * @see {@link SelectControlValueAccessor}
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
export declare class NgSelectOption implements OnDestroy {
    private _element;
    private _renderer;
    private _select;
    /**
     * @description
     * ID of the option element
     */
    id: string;
    constructor(_element: ElementRef, _renderer: Renderer2, _select: SelectControlValueAccessor);
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
    /** @docs-private */
    ngOnDestroy(): void;
}
