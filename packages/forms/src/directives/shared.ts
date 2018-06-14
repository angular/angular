/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isDevMode, ɵlooseIdentical as looseIdentical} from '@angular/core';

import {FormArray, FormControl, FormGroup} from '../model';
import {Validators} from '../validators';
import {AbstractControlDirective} from './abstract_control_directive';
import {AbstractFormGroupDirective} from './abstract_form_group_directive';
import {CheckboxControlValueAccessor} from './checkbox_value_accessor';
import {ControlContainer} from './control_container';
import {ControlValueAccessor} from './control_value_accessor';
import {DefaultValueAccessor} from './default_value_accessor';
import {NgControl} from './ng_control';
import {normalizeAsyncValidator, normalizeValidator} from './normalize_validator';
import {NumberValueAccessor} from './number_value_accessor';
import {RadioControlValueAccessor} from './radio_control_value_accessor';
import {RangeValueAccessor} from './range_value_accessor';
import {FormArrayName} from './reactive_directives/form_group_name';
import {ReactiveErrors} from './reactive_errors';
import {SelectControlValueAccessor} from './select_control_value_accessor';
import {SelectMultipleControlValueAccessor} from './select_multiple_control_value_accessor';
import {AsyncValidator, AsyncValidatorFn, Validator, ValidatorFn} from './validators';


export function controlPath(name: string, parent: ControlContainer): string[] {
  return [...parent.path !, name];
}

export function setUpControl(control: FormControl, dir: NgControl): void {
  if (!control) _throwError(dir, 'Cannot find control with');
  if (!dir.valueAccessor) _throwError(dir, 'No value accessor for form control with');

  control.validator = Validators.compose([control.validator !, dir.validator]);
  control.asyncValidator = Validators.composeAsync([control.asyncValidator !, dir.asyncValidator]);
  dir.valueAccessor !.writeValue(control.value);

  setUpViewChangePipeline(control, dir);
  setUpModelChangePipeline(control, dir);

  setUpBlurPipeline(control, dir);

  if (dir.valueAccessor !.setDisabledState) {
    control.registerOnDisabledChange(
        (isDisabled: boolean) => { dir.valueAccessor !.setDisabledState !(isDisabled); });
  }

  // re-run validation when validator binding changes, e.g. minlength=3 -> minlength=4
  dir._rawValidators.forEach((validator: Validator | ValidatorFn) => {
    if ((<Validator>validator).registerOnValidatorChange)
      (<Validator>validator).registerOnValidatorChange !(() => control.updateValueAndValidity());
  });

  dir._rawAsyncValidators.forEach((validator: AsyncValidator | AsyncValidatorFn) => {
    if ((<Validator>validator).registerOnValidatorChange)
      (<Validator>validator).registerOnValidatorChange !(() => control.updateValueAndValidity());
  });
}

export function cleanUpControl(control: FormControl, dir: NgControl) {
  dir.valueAccessor !.registerOnChange(() => _noControlError(dir));
  dir.valueAccessor !.registerOnTouched(() => _noControlError(dir));

  dir._rawValidators.forEach((validator: any) => {
    if (validator.registerOnValidatorChange) {
      validator.registerOnValidatorChange(null);
    }
  });

  dir._rawAsyncValidators.forEach((validator: any) => {
    if (validator.registerOnValidatorChange) {
      validator.registerOnValidatorChange(null);
    }
  });

  if (control) control._clearChangeFns();
}

function setUpViewChangePipeline(control: FormControl, dir: NgControl): void {
  dir.valueAccessor !.registerOnChange((newValue: any) => {
    control._pendingValue = newValue;
    control._pendingChange = true;
    control._pendingDirty = true;

    if (control.updateOn === 'change') updateControl(control, dir);
  });
}

function setUpBlurPipeline(control: FormControl, dir: NgControl): void {
  dir.valueAccessor !.registerOnTouched(() => {
    control._pendingTouched = true;

    if (control.updateOn === 'blur' && control._pendingChange) updateControl(control, dir);
    if (control.updateOn !== 'submit') control.markAsTouched();
  });
}

function updateControl(control: FormControl, dir: NgControl): void {
  if (control._pendingDirty) control.markAsDirty();
  control.setValue(control._pendingValue, {emitModelToViewChange: false});
  dir.viewToModelUpdate(control._pendingValue);
  control._pendingChange = false;
}

function setUpModelChangePipeline(control: FormControl, dir: NgControl): void {
  control.registerOnChange((newValue: any, emitModelEvent: boolean) => {
    // control -> view
    dir.valueAccessor !.writeValue(newValue);

    // control -> ngModel
    if (emitModelEvent) dir.viewToModelUpdate(newValue);
  });
}

export function setUpFormContainer(
    control: FormGroup | FormArray, dir: AbstractFormGroupDirective | FormArrayName) {
  if (control == null) _throwError(dir, 'Cannot find control with');
  control.validator = Validators.compose([control.validator, dir.validator]);
  control.asyncValidator = Validators.composeAsync([control.asyncValidator, dir.asyncValidator]);
}

function _noControlError(dir: NgControl) {
  return _throwError(dir, 'There is no FormControl instance attached to form control element with');
}

function _throwError(dir: AbstractControlDirective, message: string): void {
  let messageEnd: string;
  if (dir.path !.length > 1) {
    messageEnd = `path: '${dir.path!.join(' -> ')}'`;
  } else if (dir.path ![0]) {
    messageEnd = `name: '${dir.path}'`;
  } else {
    messageEnd = 'unspecified name attribute';
  }
  throw new Error(`${message} ${messageEnd}`);
}

export function composeValidators(validators: Array<Validator|Function>): ValidatorFn|null {
  return validators != null ? Validators.compose(validators.map(normalizeValidator)) : null;
}

export function composeAsyncValidators(validators: Array<Validator|Function>): AsyncValidatorFn|
    null {
  return validators != null ? Validators.composeAsync(validators.map(normalizeAsyncValidator)) :
                              null;
}

export function isPropertyUpdated(changes: {[key: string]: any}, viewModel: any): boolean {
  if (!changes.hasOwnProperty('model')) return false;
  const change = changes['model'];

  if (change.isFirstChange()) return true;
  return !looseIdentical(viewModel, change.currentValue);
}

const BUILTIN_ACCESSORS = [
  CheckboxControlValueAccessor,
  RangeValueAccessor,
  NumberValueAccessor,
  SelectControlValueAccessor,
  SelectMultipleControlValueAccessor,
  RadioControlValueAccessor,
];

export function isBuiltInAccessor(valueAccessor: ControlValueAccessor): boolean {
  return BUILTIN_ACCESSORS.some(a => valueAccessor.constructor === a);
}

export function syncPendingControls(form: FormGroup, directives: NgControl[]): void {
  form._syncPendingControls();
  directives.forEach(dir => {
    const control = dir.control as FormControl;
    if (control.updateOn === 'submit' && control._pendingChange) {
      dir.viewToModelUpdate(control._pendingValue);
      control._pendingChange = false;
    }
  });
}

// TODO: vsavkin remove it once https://github.com/angular/angular/issues/3011 is implemented
export function selectValueAccessor(
    dir: NgControl, valueAccessors: ControlValueAccessor[]): ControlValueAccessor|null {
  if (!valueAccessors) return null;

  if (!Array.isArray(valueAccessors))
    _throwError(dir, 'Value accessor was not provided as an array for form control with');

  let defaultAccessor: ControlValueAccessor|undefined = undefined;
  let builtinAccessor: ControlValueAccessor|undefined = undefined;
  let customAccessor: ControlValueAccessor|undefined = undefined;

  valueAccessors.forEach((v: ControlValueAccessor) => {
    if (v.constructor === DefaultValueAccessor) {
      defaultAccessor = v;

    } else if (isBuiltInAccessor(v)) {
      if (builtinAccessor)
        _throwError(dir, 'More than one built-in value accessor matches form control with');
      builtinAccessor = v;

    } else {
      if (customAccessor)
        _throwError(dir, 'More than one custom value accessor matches form control with');
      customAccessor = v;
    }
  });

  if (customAccessor) return customAccessor;
  if (builtinAccessor) return builtinAccessor;
  if (defaultAccessor) return defaultAccessor;

  _throwError(dir, 'No valid value accessor for form control with');
  return null;
}

export function removeDir<T>(list: T[], el: T): void {
  const index = list.indexOf(el);
  if (index > -1) list.splice(index, 1);
}

// TODO(kara): remove after deprecation period
export function _ngModelWarning(
    name: string, type: {_ngModelWarningSentOnce: boolean},
    instance: {_ngModelWarningSent: boolean}, warningConfig: string | null) {
  if (!isDevMode() || warningConfig === 'never') return;

  if (((warningConfig === null || warningConfig === 'once') && !type._ngModelWarningSentOnce) ||
      (warningConfig === 'always' && !instance._ngModelWarningSent)) {
    ReactiveErrors.ngModelWarning(name);
    type._ngModelWarningSentOnce = true;
    instance._ngModelWarningSent = true;
  }
}
