/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Host, Inject, Input, OnDestroy, OnInit, Optional, Self, SkipSelf, forwardRef} from '@angular/core';

import {FormArray} from '../../model';
import {NG_ASYNC_VALIDATORS, NG_VALIDATORS} from '../../validators';
import {AbstractFormGroupDirective} from '../abstract_form_group_directive';
import {ControlContainer} from '../control_container';
import {ReactiveErrors} from '../reactive_errors';
import {composeAsyncValidators, composeValidators, controlPath} from '../shared';
import {AsyncValidatorFn, ValidatorFn} from '../validators';

import {FormGroupDirective} from './form_group_directive';

export const formGroupNameProvider: any = {
  provide: ControlContainer,
  useExisting: forwardRef(() => FormGroupName)
};

/**
 * @description
 *
 * Syncs a nested `FormGroup` to a DOM element.
 *
 * This directive can only be used with a parent `FormGroupDirective` (selector:
 * `[formGroup]`).
 *
 * It accepts the string name of the nested `FormGroup` you want to link, and
 * will look for a `FormGroup` registered with that name in the parent
 * `FormGroup` instance you passed into `FormGroupDirective`.
 *
 * Nested form groups can come in handy when you want to validate a sub-group of a
 * form separately from the rest or when you'd like to group the values of certain
 * controls into their own nested object.
 *
 * **Access the group**: You can access the associated `FormGroup` using the
 * {@link AbstractControl#get get} method. Ex: `this.form.get('name')`.
 *
 * You can also access individual controls within the group using dot syntax.
 * Ex: `this.form.get('name.first')`
 *
 * **Get the value**: the `value` property is always synced and available on the
 * `FormGroup`. See a full list of available properties in `AbstractControl`.
 *
 * **Set the value**: You can set an initial value for each child control when instantiating
 * the `FormGroup`, or you can set it programmatically later using
 * {@link AbstractControl#setValue setValue} or {@link AbstractControl#patchValue patchValue}.
 *
 * **Listen to value**: If you want to listen to changes in the value of the group, you can
 * subscribe to the {@link AbstractControl#valueChanges valueChanges} event.  You can also listen to
 * {@link AbstractControl#statusChanges statusChanges} to be notified when the validation status is
 * re-calculated.
 *
 * ### Example
 *
 * {@example forms/ts/nestedFormGroup/nested_form_group_example.ts region='Component'}
 *
 * * **npm package**: `@angular/forms`
 *
 * * **NgModule**: `ReactiveFormsModule`
 *
 *
 */
@Directive({selector: '[formGroupName]', providers: [formGroupNameProvider]})
export class FormGroupName extends AbstractFormGroupDirective implements OnInit, OnDestroy {
  // TODO(issue/24571): remove '!'.
  @Input('formGroupName') name !: string;

  constructor(
      @Optional() @Host() @SkipSelf() parent: ControlContainer,
      @Optional() @Self() @Inject(NG_VALIDATORS) validators: any[],
      @Optional() @Self() @Inject(NG_ASYNC_VALIDATORS) asyncValidators: any[]) {
    super();
    this._parent = parent;
    this._validators = validators;
    this._asyncValidators = asyncValidators;
  }

  /** @internal */
  _checkParentType(): void {
    if (_hasInvalidParent(this._parent)) {
      ReactiveErrors.groupParentException();
    }
  }
}

export const formArrayNameProvider: any = {
  provide: ControlContainer,
  useExisting: forwardRef(() => FormArrayName)
};

/**
 * @description
 *
 * Syncs a nested `FormArray` to a DOM element.
 *
 * This directive is designed to be used with a parent `FormGroupDirective` (selector:
 * `[formGroup]`).
 *
 * It accepts the string name of the nested `FormArray` you want to link, and
 * will look for a `FormArray` registered with that name in the parent
 * `FormGroup` instance you passed into `FormGroupDirective`.
 *
 * Nested form arrays can come in handy when you have a group of form controls but
 * you're not sure how many there will be. Form arrays allow you to create new
 * form controls dynamically.
 *
 * **Access the array**: You can access the associated `FormArray` using the
 * {@link AbstractControl#get get} method on the parent `FormGroup`.
 * Ex: `this.form.get('cities')`.
 *
 * **Get the value**: the `value` property is always synced and available on the
 * `FormArray`. See a full list of available properties in `AbstractControl`.
 *
 * **Set the value**: You can set an initial value for each child control when instantiating
 * the `FormArray`, or you can set the value programmatically later using the
 * `FormArray`'s {@link AbstractControl#setValue setValue} or
 * {@link AbstractControl#patchValue patchValue} methods.
 *
 * **Listen to value**: If you want to listen to changes in the value of the array, you can
 * subscribe to the `FormArray`'s {@link AbstractControl#valueChanges valueChanges} event.
 * You can also listen to its {@link AbstractControl#statusChanges statusChanges} event to be
 * notified when the validation status is re-calculated.
 *
 * **Add new controls**: You can add new controls to the `FormArray` dynamically by calling
 * its {@link FormArray#push push} method.
 * Ex: `this.form.get('cities').push(new FormControl());`
 *
 * ### Example
 *
 * {@example forms/ts/nestedFormArray/nested_form_array_example.ts region='Component'}
 *
 * * **npm package**: `@angular/forms`
 *
 * * **NgModule**: `ReactiveFormsModule`
 *
 *
 */
@Directive({selector: '[formArrayName]', providers: [formArrayNameProvider]})
export class FormArrayName extends ControlContainer implements OnInit, OnDestroy {
  /** @internal */
  _parent: ControlContainer;

  /** @internal */
  _validators: any[];

  /** @internal */
  _asyncValidators: any[];

  // TODO(issue/24571): remove '!'.
  @Input('formArrayName') name !: string;

  constructor(
      @Optional() @Host() @SkipSelf() parent: ControlContainer,
      @Optional() @Self() @Inject(NG_VALIDATORS) validators: any[],
      @Optional() @Self() @Inject(NG_ASYNC_VALIDATORS) asyncValidators: any[]) {
    super();
    this._parent = parent;
    this._validators = validators;
    this._asyncValidators = asyncValidators;
  }

  ngOnInit(): void {
    this._checkParentType();
    this.formDirective !.addFormArray(this);
  }

  ngOnDestroy(): void {
    if (this.formDirective) {
      this.formDirective.removeFormArray(this);
    }
  }

  get control(): FormArray { return this.formDirective !.getFormArray(this); }

  get formDirective(): FormGroupDirective|null {
    return this._parent ? <FormGroupDirective>this._parent.formDirective : null;
  }

  get path(): string[] { return controlPath(this.name, this._parent); }

  get validator(): ValidatorFn|null { return composeValidators(this._validators); }

  get asyncValidator(): AsyncValidatorFn|null {
    return composeAsyncValidators(this._asyncValidators);
  }

  private _checkParentType(): void {
    if (_hasInvalidParent(this._parent)) {
      ReactiveErrors.arrayParentException();
    }
  }
}

function _hasInvalidParent(parent: ControlContainer): boolean {
  return !(parent instanceof FormGroupName) && !(parent instanceof FormGroupDirective) &&
      !(parent instanceof FormArrayName);
}
