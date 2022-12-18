/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, forwardRef, Inject, Input, OnChanges, OnDestroy, Optional, Self, SimpleChanges} from '@angular/core';

import {FormControl} from '../../model/form_control';
import {NG_ASYNC_VALIDATORS, NG_VALIDATORS} from '../../validators';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '../control_value_accessor';
import {NgControl} from '../ng_control';
import {disabledAttrWarning} from '../reactive_errors';
import {CALL_SET_DISABLED_STATE, cleanUpControl, selectValueAccessor, SetDisabledStateOption, setUpControl} from '../shared';
import {AsyncValidator, AsyncValidatorFn, Validator, ValidatorFn} from '../validators';


export const formControlBinding: any = {
  provide: NgControl,
  useExisting: forwardRef(() => FormControlDirective)
};

/**
 * @description
 * Synchronizes a standalone `FormControl` instance to a form control element.
 *
 * @see [Reactive Forms Guide](guide/reactive-forms)
 * @see `FormControl`
 * @see `AbstractControl`
 *
 * @usageNotes
 *
 * The following example shows how to register a standalone control and set its value.
 *
 * {@example forms/ts/simpleFormControl/simple_form_control_example.ts region='Component'}
 *
 * @ngModule ReactiveFormsModule
 * @publicApi
 */
@Directive({selector: '[formControl]', providers: [formControlBinding], exportAs: 'ngForm'})
export class FormControlDirective extends NgControl implements OnChanges, OnDestroy {
  /**
   * @description
   * Tracks the `FormControl` instance bound to the directive.
   */
  // TODO(issue/24571): remove '!'.
  @Input('formControl') form!: FormControl;

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
      @Optional() @Self() @Inject(NG_VALIDATORS) validators: (Validator|ValidatorFn)[],
      @Optional() @Self() @Inject(NG_ASYNC_VALIDATORS) asyncValidators:
          (AsyncValidator|AsyncValidatorFn)[],
      @Optional() @Self() @Inject(NG_VALUE_ACCESSOR) valueAccessors: ControlValueAccessor[],
      @Optional() @Inject(CALL_SET_DISABLED_STATE) private callSetDisabledState?:
          SetDisabledStateOption) {
    super();
    this._setValidators(validators);
    this._setAsyncValidators(asyncValidators);
    this.valueAccessor = selectValueAccessor(this, valueAccessors);
  }

  /** @nodoc */
  ngOnChanges(changes: SimpleChanges): void {
    if (this._isControlChanged(changes)) {
      const previousForm = changes['form'].previousValue;
      if (previousForm) {
        cleanUpControl(previousForm, this, /* validateControlPresenceOnChange */ false);
      }
      setUpControl(this.form, this, this.callSetDisabledState);
      this.form.updateValueAndValidity({emitEvent: false});
    }
  }

  /** @nodoc */
  ngOnDestroy() {
    if (this.form) {
      cleanUpControl(this.form, this, /* validateControlPresenceOnChange */ false);
    }
  }

  /**
   * @description
   * Returns an array that represents the path from the top-level form to this control.
   * Each index is the string name of the control on that level.
   */
  override get path(): string[] {
    return [];
  }

  /**
   * @description
   * The `FormControl` bound to this directive.
   */
  override get control(): FormControl {
    return this.form;
  }

  /**
   * @description
   * Noop function since reactive form directives don't need to emit `ngModelChange` event.
   *
   * @param newValue The new value for the view model.
   */
  viewToModelUpdate(newValue: any): void {}

  private _isControlChanged(changes: {[key: string]: any}): boolean {
    return changes.hasOwnProperty('form');
  }
}
