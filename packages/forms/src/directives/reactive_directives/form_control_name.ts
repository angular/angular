/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, forwardRef, Host, Inject, Input, OnChanges, OnDestroy, Optional, Self, SimpleChanges, SkipSelf} from '@angular/core';

import {FormControl} from '../../model/form_control';
import {NG_ASYNC_VALIDATORS, NG_VALIDATORS} from '../../validators';
import {AbstractFormGroupDirective} from '../abstract_form_group_directive';
import {ControlContainer} from '../control_container';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '../control_value_accessor';
import {NgControl} from '../ng_control';
import {controlParentException, disabledAttrWarning, ngModelGroupException} from '../reactive_errors';
import {controlPath, selectValueAccessor} from '../shared';
import {AsyncValidator, AsyncValidatorFn, Validator, ValidatorFn} from '../validators';

import {FormGroupDirective} from './form_group_directive';
import {FormArrayName, FormGroupName} from './form_group_name';

export const controlNameBinding: any = {
  provide: NgControl,
  useExisting: forwardRef(() => FormControlName)
};

/**
 * @description
 * Syncs a `FormControl` in an existing `FormGroup` to a form control
 * element by name.
 *
 * @see [Reactive Forms Guide](guide/reactive-forms)
 * @see `FormControl`
 * @see `AbstractControl`
 *
 * @usageNotes
 *
 * ### Register `FormControl` within a group
 *
 * The following example shows how to register multiple form controls within a form group
 * and set their value.
 *
 * {@example forms/ts/simpleFormGroup/simple_form_group_example.ts region='Component'}
 *
 * To see `formControlName` examples with different form control types, see:
 *
 * * Radio buttons: `RadioControlValueAccessor`
 * * Selects: `SelectControlValueAccessor`
 *
 * @ngModule ReactiveFormsModule
 * @publicApi
 */
@Directive({selector: '[formControlName]', providers: [controlNameBinding]})
export class FormControlName extends NgControl implements OnChanges, OnDestroy {
  private _added = false;

  /**
   * @description
   * Tracks the `FormControl` instance bound to the directive.
   */
  // TODO(issue/24571): remove '!'.
  override readonly control!: FormControl;

  /**
   * @description
   * Tracks the name of the `FormControl` bound to the directive. The name corresponds
   * to a key in the parent `FormGroup` or `FormArray`.
   * Accepts a name as a string or a number.
   * The name in the form of a string is useful for individual forms,
   * while the numerical form allows for form controls to be bound
   * to indices when iterating over controls in a `FormArray`.
   */
  // TODO(issue/24571): remove '!'.
  @Input('formControlName') override name!: string|number|null;

  /**
   * @description
   * Triggers a warning in dev mode that this input should not be used with reactive forms.
   */
  @Input('disabled')
  set isDisabled(isDisabled: boolean) {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      console.warn(disabledAttrWarning);
    }
  }

  constructor(
      @Optional() @Host() @SkipSelf() parent: ControlContainer,
      @Optional() @Self() @Inject(NG_VALIDATORS) validators: (Validator|ValidatorFn)[],
      @Optional() @Self() @Inject(NG_ASYNC_VALIDATORS) asyncValidators:
          Array<AsyncValidator|AsyncValidatorFn>,
      @Optional() @Self() @Inject(NG_VALUE_ACCESSOR) valueAccessors: ControlValueAccessor[]) {
    super();
    this._parent = parent;
    this._setValidators(validators);
    this._setAsyncValidators(asyncValidators);
    this.valueAccessor = selectValueAccessor(this, valueAccessors);
  }

  /** @nodoc */
  ngOnChanges() {
    if (!this._added) this._setUpControl();
  }

  /** @nodoc */
  ngOnDestroy(): void {
    if (this.formDirective) {
      this.formDirective.removeControl(this);
    }
  }

  /**
   * @description
   * Noop function since reactive form directives don't need to emit ngModelChange.
   *
   * @param newValue The new value for the view model.
   */
  viewToModelUpdate(newValue: any): void {}

  /**
   * @description
   * Returns an array that represents the path from the top-level form to this control.
   * Each index is the string name of the control on that level.
   */
  override get path(): string[] {
    return controlPath(this.name == null ? this.name : this.name.toString(), this._parent!);
  }

  /**
   * @description
   * The top-level directive for this group if present, otherwise null.
   */
  get formDirective(): any {
    return this._parent ? this._parent.formDirective : null;
  }

  private _checkParentType(): void {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (!(this._parent instanceof FormGroupName) &&
          this._parent instanceof AbstractFormGroupDirective) {
        throw ngModelGroupException();
      } else if (
          !(this._parent instanceof FormGroupName) &&
          !(this._parent instanceof FormGroupDirective) &&
          !(this._parent instanceof FormArrayName)) {
        throw controlParentException();
      }
    }
  }

  private _setUpControl() {
    this._checkParentType();
    (this as {control: FormControl}).control = this.formDirective.addControl(this);
    this._added = true;
  }
}
