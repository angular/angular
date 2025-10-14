/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ElementRef, Injector, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { BuiltInControlValueAccessor, ControlValueAccessor } from './control_value_accessor';
import { NgControl } from './ng_control';
/**
 * @description
 * Class used by Angular to track radio buttons. For internal use only.
 */
export declare class RadioControlRegistry {
    private _accessors;
    /**
     * @description
     * Adds a control to the internal registry. For internal use only.
     */
    add(control: NgControl, accessor: RadioControlValueAccessor): void;
    /**
     * @description
     * Removes a control from the internal registry. For internal use only.
     */
    remove(accessor: RadioControlValueAccessor): void;
    /**
     * @description
     * Selects a radio button. For internal use only.
     */
    select(accessor: RadioControlValueAccessor): void;
    private _isSameGroup;
}
/**
 * @description
 * The `ControlValueAccessor` for writing radio control values and listening to radio control
 * changes. The value accessor is used by the `FormControlDirective`, `FormControlName`, and
 * `NgModel` directives.
 *
 * @usageNotes
 *
 * ### Using radio buttons with reactive form directives
 *
 * The follow example shows how to use radio buttons in a reactive form. When using radio buttons in
 * a reactive form, radio buttons in the same group should have the same `formControlName`.
 * Providing a `name` attribute is optional.
 *
 * {@example forms/ts/reactiveRadioButtons/reactive_radio_button_example.ts region='Reactive'}
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
export declare class RadioControlValueAccessor extends BuiltInControlValueAccessor implements ControlValueAccessor, OnDestroy, OnInit {
    private _registry;
    private _injector;
    /** @internal */
    _state: boolean;
    /** @internal */
    _control: NgControl;
    /** @internal */
    _fn: Function;
    private setDisabledStateFired;
    /**
     * The registered callback function called when a change event occurs on the input element.
     * Note: we declare `onChange` here (also used as host listener) as a function with no arguments
     * to override the `onChange` function (which expects 1 argument) in the parent
     * `BaseControlValueAccessor` class.
     * @docs-private
     */
    onChange: () => void;
    /**
     * @description
     * Tracks the name of the radio input element.
     */
    name: string;
    /**
     * @description
     * Tracks the name of the `FormControl` bound to the directive. The name corresponds
     * to a key in the parent `FormGroup` or `FormArray`.
     */
    formControlName: string;
    /**
     * @description
     * Tracks the value of the radio input element
     */
    value: any;
    private callSetDisabledState;
    constructor(renderer: Renderer2, elementRef: ElementRef, _registry: RadioControlRegistry, _injector: Injector);
    /** @docs-private */
    ngOnInit(): void;
    /** @docs-private */
    ngOnDestroy(): void;
    /**
     * Sets the "checked" property value on the radio input element.
     * @docs-private
     */
    writeValue(value: any): void;
    /**
     * Registers a function called when the control value changes.
     * @docs-private
     */
    registerOnChange(fn: (_: any) => {}): void;
    /** @docs-private */
    setDisabledState(isDisabled: boolean): void;
    /**
     * Sets the "value" on the radio input element and unchecks it.
     *
     * @param value
     */
    fireUncheck(value: any): void;
    private _checkName;
}
