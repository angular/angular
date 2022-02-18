/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵRuntimeError as RuntimeError} from '@angular/core';

import {missingControlError, missingControlValueError, noControlsError} from '../directives/reactive_errors';
import {AsyncValidatorFn, ValidatorFn} from '../directives/validators';
import {RuntimeErrorCode} from '../errors';

import {AbstractControl} from './abstract_control';
import {AbstractControlOptions, FormArray as IFormArray, FormGroup as IFormGroup} from './api';
import {getRawValue} from './form_control';
import {pickAsyncValidators, pickValidators} from './util';

const FormGroupImpl = class FormGroup extends AbstractControl implements IFormGroup {
  constructor(
      public controls: {[key: string]: AbstractControl},
      validatorOrOpts?: ValidatorFn|ValidatorFn[]|AbstractControlOptions|null,
      asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|null) {
    super(pickValidators(validatorOrOpts), pickAsyncValidators(asyncValidator, validatorOrOpts));
    this._initObservables();
    this._setUpdateStrategy(validatorOrOpts);
    this._setUpControls();
    this.updateValueAndValidity({
      onlySelf: true,
      // If `asyncValidator` is present, it will trigger control status change from `PENDING` to
      // `VALID` or `INVALID`. The status should be broadcasted via the `statusChanges` observable,
      // so we set `emitEvent` to `true` to allow that during the control creation process.
      emitEvent: !!this.asyncValidator
    });
  }

  registerControl(name: string, control: AbstractControl): AbstractControl {
    if (this.controls[name]) return this.controls[name];
    this.controls[name] = control;
    control.setParent(this);
    control._registerOnCollectionChange(this._onCollectionChange);
    return control;
  }

  addControl(name: string, control: AbstractControl, options: {emitEvent?: boolean} = {}): void {
    this.registerControl(name, control);
    this.updateValueAndValidity({emitEvent: options.emitEvent});
    this._onCollectionChange();
  }

  removeControl(name: string, options: {emitEvent?: boolean} = {}): void {
    if (this.controls[name]) this.controls[name]._registerOnCollectionChange(() => {});
    delete (this.controls[name]);
    this.updateValueAndValidity({emitEvent: options.emitEvent});
    this._onCollectionChange();
  }

  setControl(name: string, control: AbstractControl, options: {emitEvent?: boolean} = {}): void {
    if (this.controls[name]) this.controls[name]._registerOnCollectionChange(() => {});
    delete (this.controls[name]);
    if (control) this.registerControl(name, control);
    this.updateValueAndValidity({emitEvent: options.emitEvent});
    this._onCollectionChange();
  }

  contains(controlName: string): boolean {
    return this.controls.hasOwnProperty(controlName) && this.controls[controlName].enabled;
  }

  override setValue(
      value: {[key: string]: any}, options: {onlySelf?: boolean, emitEvent?: boolean} = {}): void {
    assertAllValuesPresent(this, value);
    Object.keys(value).forEach(name => {
      assertControlPresent(this, name);
      this.controls[name].setValue(value[name], {onlySelf: true, emitEvent: options.emitEvent});
    });
    this.updateValueAndValidity(options);
  }

  override patchValue(
      value: {[key: string]: any}, options: {onlySelf?: boolean, emitEvent?: boolean} = {}): void {
    // Even though the `value` argument type doesn't allow `null` and `undefined` values, the
    // `patchValue` can be called recursively and inner data structures might have these values, so
    // we just ignore such cases when a field containing FormGroup instance receives `null` or
    // `undefined` as a value.
    if (value == null /* both `null` and `undefined` */) return;

    Object.keys(value).forEach(name => {
      if (this.controls[name]) {
        this.controls[name].patchValue(value[name], {onlySelf: true, emitEvent: options.emitEvent});
      }
    });
    this.updateValueAndValidity(options);
  }

  override reset(value: any = {}, options: {onlySelf?: boolean, emitEvent?: boolean} = {}): void {
    this._forEachChild((control: AbstractControl, name: string) => {
      control.reset(value[name], {onlySelf: true, emitEvent: options.emitEvent});
    });
    this._updatePristine(options);
    this._updateTouched(options);
    this.updateValueAndValidity(options);
  }

  getRawValue(): any {
    return this._reduceChildren(
        {}, (acc: {[k: string]: AbstractControl}, control: AbstractControl, name: string) => {
          acc[name] = getRawValue(control);
          return acc;
        });
  }

  /** @internal */
  override _syncPendingControls(): boolean {
    let subtreeUpdated = this._reduceChildren(false, (updated: boolean, child: AbstractControl) => {
      return child._syncPendingControls() ? true : updated;
    });
    if (subtreeUpdated) this.updateValueAndValidity({onlySelf: true});
    return subtreeUpdated;
  }

  /** @internal */
  override _forEachChild(cb: (v: any, k: string) => void): void {
    Object.keys(this.controls).forEach(key => {
      // The list of controls can change (for ex. controls might be removed) while the loop
      // is running (as a result of invoking Forms API in `valueChanges` subscription), so we
      // have to null check before invoking the callback.
      const control = this.controls[key];
      control && cb(control, key);
    });
  }

  /** @internal */
  _setUpControls(): void {
    this._forEachChild((control: AbstractControl) => {
      control.setParent(this);
      control._registerOnCollectionChange(this._onCollectionChange);
    });
  }

  /** @internal */
  override _updateValue(): void {
    (this as {value: any}).value = this._reduceValue();
  }

  /** @internal */
  override _anyControls(condition: (c: AbstractControl) => boolean): boolean {
    for (const controlName of Object.keys(this.controls)) {
      const control = this.controls[controlName];
      if (this.contains(controlName) && condition(control)) {
        return true;
      }
    }
    return false;
  }

  _reduceValue() {
    return this._reduceChildren(
        {}, (acc: {[k: string]: any}, control: AbstractControl, name: string): any => {
          if (control.enabled || this.disabled) {
            acc[name] = control.value;
          }
          return acc;
        });
  }

  /** @internal */
  _reduceChildren<T>(initValue: T, fn: (acc: T, control: AbstractControl, name: string) => T): T {
    let res = initValue;
    this._forEachChild((control: AbstractControl, name: string) => {
      res = fn(res, control, name);
    });
    return res;
  }

  /** @internal */
  override _allControlsDisabled(): boolean {
    for (const controlName of Object.keys(this.controls)) {
      if (this.controls[controlName].enabled) {
        return false;
      }
    }
    return Object.keys(this.controls).length > 0 || this.disabled;
  }

  /** @internal */
  override _find(name: string|number): AbstractControl|null {
    return this.controls.hasOwnProperty(name as string) ? this.controls[name as string] : null;
  }
}

export interface ɵFormGroupCtor {
  new(controls: {[key: string]: AbstractControl},
      validatorOrOpts?: ValidatorFn|ValidatorFn[]|AbstractControlOptions|null,
      asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|null): IFormGroup;
}

export const FormGroup: ɵFormGroupCtor = FormGroupImpl;
export type FormGroup = IFormGroup;

const NG_DEV_MODE = typeof ngDevMode === 'undefined' || !!ngDevMode;

export function assertAllValuesPresent(control: IFormGroup|IFormArray, value: any): void {
  const isGroup = control instanceof FormGroupImpl;
  control._forEachChild((_: unknown, key: string|number) => {
    if (value[key] === undefined) {
      throw new RuntimeError(
          RuntimeErrorCode.MISSING_CONTROL_VALUE,
          NG_DEV_MODE ? missingControlValueError(isGroup, key) : '');
    }
  });
}

export function assertControlPresent(parent: IFormGroup|IFormArray, key: string|number): void {
  const isGroup = parent instanceof FormGroupImpl;
  const controls = parent.controls as {[key: string|number]: unknown};
  const collection = isGroup ? Object.keys(controls) : controls;
  if (!collection.length) {
    throw new RuntimeError(
        RuntimeErrorCode.NO_CONTROLS, NG_DEV_MODE ? noControlsError(isGroup) : '');
  }
  if (!controls[key]) {
    throw new RuntimeError(
        RuntimeErrorCode.MISSING_CONTROL, NG_DEV_MODE ? missingControlError(isGroup, key) : '');
  }
}
