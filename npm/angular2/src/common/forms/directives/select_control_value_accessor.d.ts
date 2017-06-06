import { Renderer, ElementRef, OnDestroy } from 'angular2/core';
import { ControlValueAccessor } from './control_value_accessor';
export declare const SELECT_VALUE_ACCESSOR: any;
/**
 * The accessor for writing a value and listening to changes on a select element.
 *
 * Note: We have to listen to the 'change' event because 'input' events aren't fired
 * for selects in Firefox and IE:
 * https://bugzilla.mozilla.org/show_bug.cgi?id=1024350
 * https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/4660045/
 *
 */
export declare class SelectControlValueAccessor implements ControlValueAccessor {
    private _renderer;
    private _elementRef;
    value: any;
    onChange: (_: any) => void;
    onTouched: () => void;
    constructor(_renderer: Renderer, _elementRef: ElementRef);
    writeValue(value: any): void;
    registerOnChange(fn: (value: any) => any): void;
    registerOnTouched(fn: () => any): void;
}
/**
 * Marks `<option>` as dynamic, so Angular can be notified when options change.
 *
 * ### Example
 *
 * ```
 * <select ngControl="city">
 *   <option *ngFor="let c of cities" [value]="c"></option>
 * </select>
 * ```
 */
export declare class NgSelectOption implements OnDestroy {
    private _element;
    private _renderer;
    private _select;
    id: string;
    constructor(_element: ElementRef, _renderer: Renderer, _select: SelectControlValueAccessor);
    ngValue: any;
    value: any;
    ngOnDestroy(): void;
}
