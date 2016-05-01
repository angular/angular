import { ElementRef, Renderer, OnInit, OnDestroy, Injector } from 'angular2/core';
import { ControlValueAccessor } from 'angular2/src/common/forms/directives/control_value_accessor';
import { NgControl } from 'angular2/src/common/forms/directives/ng_control';
export declare const RADIO_VALUE_ACCESSOR: any;
/**
 * Internal class used by Angular to uncheck radio buttons with the matching name.
 */
export declare class RadioControlRegistry {
    private _accessors;
    add(control: NgControl, accessor: RadioControlValueAccessor): void;
    remove(accessor: RadioControlValueAccessor): void;
    select(accessor: RadioControlValueAccessor): void;
}
/**
 * The value provided by the forms API for radio buttons.
 */
export declare class RadioButtonState {
    checked: boolean;
    value: string;
    constructor(checked: boolean, value: string);
}
/**
 * The accessor for writing a radio control value and listening to changes that is used by the
 * {@link NgModel}, {@link NgFormControl}, and {@link NgControlName} directives.
 *
 *  ### Example
 *  ```
 *  @Component({
 *    template: `
 *      <input type="radio" name="food" [(ngModel)]="foodChicken">
 *      <input type="radio" name="food" [(ngModel)]="foodFish">
 *    `
 *  })
 *  class FoodCmp {
 *    foodChicken = new RadioButtonState(true, "chicken");
 *    foodFish = new RadioButtonState(false, "fish");
 *  }
 *  ```
 */
export declare class RadioControlValueAccessor implements ControlValueAccessor, OnDestroy, OnInit {
    private _renderer;
    private _elementRef;
    private _registry;
    private _injector;
    name: string;
    onChange: () => void;
    onTouched: () => void;
    constructor(_renderer: Renderer, _elementRef: ElementRef, _registry: RadioControlRegistry, _injector: Injector);
    ngOnInit(): void;
    ngOnDestroy(): void;
    writeValue(value: any): void;
    registerOnChange(fn: (_: any) => {}): void;
    fireUncheck(): void;
    registerOnTouched(fn: () => {}): void;
}
