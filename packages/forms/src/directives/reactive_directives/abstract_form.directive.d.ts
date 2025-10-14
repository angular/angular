/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { EventEmitter, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FormGroup } from '../../model/form_group';
import { FormArray } from '../../model/form_array';
import { AbstractControl } from '../../model/abstract_model';
import { FormControl } from '../../model/form_control';
import { ControlContainer } from '../control_container';
import type { Form } from '../form_interface';
import { SetDisabledStateOption } from '../shared';
import { AsyncValidator, AsyncValidatorFn, Validator, ValidatorFn } from '../validators';
import type { FormControlName } from './form_control_name';
import type { FormArrayName, FormGroupName } from './form_group_name';
/**
 * @description
 *
 * Abstract class for top-level form directives (FormArrayDirective, FormGroupDirective) who bind an
 * existing `Form` to a DOM element.
 *
 * @publicApi
 */
export declare abstract class AbstractFormDirective extends ControlContainer implements Form, OnChanges, OnDestroy {
    private callSetDisabledState?;
    /**
     * @description
     * Reports whether the form submission has been triggered.
     */
    get submitted(): boolean;
    private set submitted(value);
    /** @internal */
    readonly _submitted: import("@angular/core").Signal<boolean>;
    private readonly _submittedReactive;
    /**
     * Reference to an old form group input value, which is needed to cleanup
     * old instance in case it was replaced with a new one.
     */
    private _oldForm;
    /**
     * Callback that should be invoked when controls in FormGroup or FormArray collection change
     * (added or removed). This callback triggers corresponding DOM updates.
     */
    private readonly _onCollectionChange;
    /**
     * @description
     * Tracks the list of added `FormControlName` instances
     */
    directives: FormControlName[];
    /**
     * @description
     * Tracks the form bound to this directive.
     */
    abstract form: AbstractControl;
    /**
     * @description
     * Emits an event when the form submission has been triggered.
     */
    abstract ngSubmit: EventEmitter<any>;
    constructor(validators: (Validator | ValidatorFn)[], asyncValidators: (AsyncValidator | AsyncValidatorFn)[], callSetDisabledState?: SetDisabledStateOption | undefined);
    /** @nodoc */
    ngOnChanges(changes: SimpleChanges): void;
    /** @nodoc */
    ngOnDestroy(): void;
    /** @nodoc */
    protected onChanges(changes: SimpleChanges): void;
    /** @nodoc */
    protected onDestroy(): void;
    /**
     * @description
     * Returns this directive's instance.
     */
    get formDirective(): Form;
    /**
     * @description
     * Returns the Form bound to this directive.
     */
    abstract get control(): AbstractControl;
    /**
     * @description
     * Returns an array representing the path to this group. Because this directive
     * always lives at the top level of a form, it always an empty array.
     */
    get path(): string[];
    /**
     * @description
     * Method that sets up the control directive in this group, re-calculates its value
     * and validity, and adds the instance to the internal list of directives.
     *
     * @param dir The `FormControlName` directive instance.
     */
    addControl(dir: FormControlName): FormControl;
    /**
     * @description
     * Retrieves the `FormControl` instance from the provided `FormControlName` directive
     *
     * @param dir The `FormControlName` directive instance.
     */
    getControl(dir: FormControlName): FormControl;
    /**
     * @description
     * Removes the `FormControlName` instance from the internal list of directives
     *
     * @param dir The `FormControlName` directive instance.
     */
    removeControl(dir: FormControlName): void;
    /**
     * Adds a new `FormGroupName` directive instance to the form.
     *
     * @param dir The `FormGroupName` directive instance.
     */
    addFormGroup(dir: FormGroupName): void;
    /**
     * Performs the necessary cleanup when a `FormGroupName` directive instance is removed from the
     * view.
     *
     * @param dir The `FormGroupName` directive instance.
     */
    removeFormGroup(dir: FormGroupName): void;
    /**
     * @description
     * Retrieves the `FormGroup` for a provided `FormGroupName` directive instance
     *
     * @param dir The `FormGroupName` directive instance.
     */
    getFormGroup(dir: FormGroupName): FormGroup;
    /**
     * @description
     * Retrieves the `FormArray` for a provided `FormArrayName` directive instance.
     *
     * @param dir The `FormArrayName` directive instance.
     */
    getFormArray(dir: FormArrayName): FormArray;
    /**
     * Performs the necessary setup when a `FormArrayName` directive instance is added to the view.
     *
     * @param dir The `FormArrayName` directive instance.
     */
    addFormArray(dir: FormArrayName): void;
    /**
     * Performs the necessary cleanup when a `FormArrayName` directive instance is removed from the
     * view.
     *
     * @param dir The `FormArrayName` directive instance.
     */
    removeFormArray(dir: FormArrayName): void;
    /**
     * Sets the new value for the provided `FormControlName` directive.
     *
     * @param dir The `FormControlName` directive instance.
     * @param value The new value for the directive's control.
     */
    updateModel(dir: FormControlName, value: any): void;
    /**
     * @description
     * Method called when the "reset" event is triggered on the form.
     */
    onReset(): void;
    /**
     * @description
     * Resets the form to an initial value and resets its submitted status.
     *
     * @param value The new value for the form.
     */
    resetForm(value?: any, options?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
    /**
     * @description
     * Method called with the "submit" event is triggered on the form.
     * Triggers the `ngSubmit` emitter to emit the "submit" event as its payload.
     *
     * @param $event The "submit" event object
     */
    onSubmit($event: Event): boolean;
    /** @internal */
    _updateDomValue(): void;
    private _setUpFormContainer;
    private _cleanUpFormContainer;
    private _updateRegistrations;
    private _updateValidators;
    private _checkFormPresent;
}
