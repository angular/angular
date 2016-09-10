/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Host, Inject, Input, OnChanges, OnDestroy, Optional, Output, Self, SimpleChanges, SkipSelf, forwardRef} from '@angular/core';

import {EventEmitter} from '../../facade/async';
import {FormControl} from '../../model';
import {NG_ASYNC_VALIDATORS, NG_VALIDATORS} from '../../validators';
import {AbstractFormGroupDirective} from '../abstract_form_group_directive';
import {ControlContainer} from '../control_container';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '../control_value_accessor';
import {NgControl} from '../ng_control';
import {ReactiveErrors} from '../reactive_errors';
import {composeAsyncValidators, composeValidators, controlPath, isPropertyUpdated, selectValueAccessor} from '../shared';
import {AsyncValidatorFn, Validator, ValidatorFn} from '../validators';

import {FormGroupDirective} from './form_group_directive';
import {FormArrayName, FormGroupName} from './form_group_name';

export const controlNameBinding: any = {
  provide: NgControl,
  useExisting: forwardRef(() => FormControlName)
};

/**
 * @whatItDoes  Syncs a form control element to an existing {@link FormControl} instance by name.
 *
 * In other words, this directive ensures that any values written to the {@link FormControl}
 * instance programmatically will be written to the DOM element (model -> view). Conversely,
 * any values written to the DOM element through user input will be reflected in the
 * {@link FormControl} instance (view -> model).
 *
 * @howToUse
 *
 * This directive must be used with a parent {@link FormGroupDirective} (selector: `[formGroup]`).
 *
 * Pass in the string name of the {@link FormControl} instance you want to link. It will look for a
 * control registered with that name in the {@link FormGroup} passed to the parent
 * {@link FormGroupDirective}.
 *
 *  You can initialize the value of the form when instantiating the {@link FormGroup}, or you can
 * set it programmatically later using {@link AbstractControl.setValue} or
 * {@link AbstractControl.patchValue}.
 *
 * If you want to listen to changes in the value of the form, you can subscribe to the
 * {@link AbstractControl.valueChanges} event.
 *
 * ### Example
 *
 * In this example, we create form controls for first name and last name.
 *
 * {@example forms/ts/formControlName/form_control_name_example.ts region='Component'}
 *
 *  * **npm package**: `@angular/forms`
 *
 *  * **NgModule**: {@link ReactiveFormsModule}
 *
 *  @stable
 */
@Directive({selector: '[formControlName]', providers: [controlNameBinding]})
export class FormControlName extends NgControl implements OnChanges, OnDestroy {
  private _added = false;
  /** @internal */
  viewModel: any;
  /** @internal */
  _control: FormControl;

  @Input('formControlName') name: string;

  // TODO(kara):  Replace ngModel with reactive API
  @Input('ngModel') model: any;
  @Output('ngModelChange') update = new EventEmitter();
  @Input('disabled')
  set isDisabled(isDisabled: boolean) { ReactiveErrors.disabledAttrWarning(); }

  constructor(
      @Optional() @Host() @SkipSelf() parent: ControlContainer,
      @Optional() @Self() @Inject(NG_VALIDATORS) validators: Array<Validator|ValidatorFn>,
      @Optional() @Self() @Inject(NG_ASYNC_VALIDATORS) asyncValidators:
          Array<Validator|AsyncValidatorFn>,
      @Optional() @Self() @Inject(NG_VALUE_ACCESSOR) valueAccessors: ControlValueAccessor[]) {
    super();
    this._parent = parent;
    this._rawValidators = validators || [];
    this._rawAsyncValidators = asyncValidators || [];
    this.valueAccessor = selectValueAccessor(this, valueAccessors);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this._added) this._setUpControl();
    if (isPropertyUpdated(changes, this.viewModel)) {
      this.viewModel = this.model;
      this.formDirective.updateModel(this, this.model);
    }
  }

  ngOnDestroy(): void {
    if (this.formDirective) {
      this.formDirective.removeControl(this);
    }
  }

  viewToModelUpdate(newValue: any): void {
    this.viewModel = newValue;
    this.update.emit(newValue);
  }

  get path(): string[] { return controlPath(this.name, this._parent); }

  get formDirective(): any { return this._parent ? this._parent.formDirective : null; }

  get validator(): ValidatorFn { return composeValidators(this._rawValidators); }

  get asyncValidator(): AsyncValidatorFn {
    return composeAsyncValidators(this._rawAsyncValidators);
  }

  get control(): FormControl { return this._control; }

  private _checkParentType(): void {
    if (!(this._parent instanceof FormGroupName) &&
        this._parent instanceof AbstractFormGroupDirective) {
      ReactiveErrors.ngModelGroupException();
    } else if (
        !(this._parent instanceof FormGroupName) && !(this._parent instanceof FormGroupDirective) &&
        !(this._parent instanceof FormArrayName)) {
      ReactiveErrors.controlParentException();
    }
  }

  private _setUpControl() {
    this._checkParentType();
    this._control = this.formDirective.addControl(this);
    if (this.control.disabled) this.valueAccessor.setDisabledState(true);
    this._added = true;
  }
}
