/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Inject, Input, OnChanges, Optional, Output, Self, SimpleChanges, forwardRef} from '@angular/core';

import {EventEmitter} from '../../facade/async';
import {FormControl} from '../../model';
import {NG_ASYNC_VALIDATORS, NG_VALIDATORS} from '../../validators';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '../control_value_accessor';
import {NgControl} from '../ng_control';
import {ReactiveErrors} from '../reactive_errors';
import {composeAsyncValidators, composeValidators, isPropertyUpdated, selectValueAccessor, setUpControl} from '../shared';
import {AsyncValidatorFn, Validator, ValidatorFn} from '../validators';

export const formControlBinding: any = {
  provide: NgControl,
  useExisting: forwardRef(() => FormControlDirective)
};

/**
 * @whatItDoes Syncs a standalone {@link FormControl} instance to a form control element.
 *
 * In other words, this directive ensures that any values written to the {@link FormControl}
 * instance programmatically will be written to the DOM element (model -> view). Conversely,
 * any values written to the DOM element through user input will be reflected in the
 * {@link FormControl} instance (view -> model).
 *
 * @howToUse
 *
 * Use this directive if you'd like to create and manage a {@link FormControl} instance directly.
 * Simply create a {@link FormControl}, save it to your component class, and pass it into the
 * {@link FormControlDirective}.
 *
 * This directive is designed to be used as a standalone control.  Unlike {@link FormControlName},
 * it does not require that your {@link FormControl} instance be part of any parent
 * {@link FormGroup}, and it won't be registered to any {@link FormGroupDirective} that
 * exists above it.
 *
 * **Get the value**: the `value` property is always synced and available on the
 * {@link FormControl} instance. See a full list of available properties in
 * {@link AbstractControl}.
 *
 * **Set the value**: You can pass in an initial value when instantiating the {@link FormControl},
 * or you can set it programmatically later using {@link AbstractControl.setValue} or
 * {@link AbstractControl.patchValue}.
 *
 * **Listen to value**: If you want to listen to changes in the value of the control, you can
 * subscribe to the {@link AbstractControl.valueChanges} event.  You can also listen to
 * {@link AbstractControl.statusChanges} to be notified when the validation status is
 * re-calculated.
 *
 * ### Example
 *
 * {@example forms/ts/simpleFormControl/simple_form_control_example.ts region='Component'}
 *
 * * **npm package**: `@angular/forms`
 *
 * * **NgModule**: `ReactiveFormsModule`
 *
 *  @stable
 */
@Directive({selector: '[formControl]', providers: [formControlBinding], exportAs: 'ngForm'})

export class FormControlDirective extends NgControl implements OnChanges {
  viewModel: any;

  @Input('formControl') form: FormControl;
  @Input('ngModel') model: any;
  @Output('ngModelChange') update = new EventEmitter();

  @Input('disabled')
  set isDisabled(isDisabled: boolean) { ReactiveErrors.disabledAttrWarning(); }

  constructor(@Optional() @Self() @Inject(NG_VALIDATORS) validators: Array<Validator|ValidatorFn>,
              @Optional() @Self() @Inject(NG_ASYNC_VALIDATORS) asyncValidators: Array<Validator|AsyncValidatorFn>,
              @Optional() @Self() @Inject(NG_VALUE_ACCESSOR)
              valueAccessors: ControlValueAccessor[]) {
                super();
                this._rawValidators = validators || [];
                this._rawAsyncValidators = asyncValidators || [];
                this.valueAccessor = selectValueAccessor(this, valueAccessors);
              }

              ngOnChanges(changes: SimpleChanges): void {
                if (this._isControlChanged(changes)) {
                  setUpControl(this.form, this);
                  if (this.control.disabled && this.valueAccessor.setDisabledState) {
                    this.valueAccessor.setDisabledState(true);
                  }
                  this.form.updateValueAndValidity({emitEvent: false});
                }
                if (isPropertyUpdated(changes, this.viewModel)) {
                  this.form.setValue(this.model);
                  this.viewModel = this.model;
                }
              }

              get path(): string[] { return []; }

              get validator(): ValidatorFn { return composeValidators(this._rawValidators); }

              get asyncValidator(): AsyncValidatorFn {
                return composeAsyncValidators(this._rawAsyncValidators);
              }

              get control(): FormControl { return this.form; }

              viewToModelUpdate(newValue: any): void {
                this.viewModel = newValue;
                this.update.emit(newValue);
              }

              private _isControlChanged(changes: {[key: string]: any}): boolean {
                return changes.hasOwnProperty('form');
              }
}
