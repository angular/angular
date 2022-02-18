/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventEmitter} from '@angular/core';
import {Observable} from 'rxjs';

import {AsyncValidatorFn, ValidationErrors, ValidatorFn} from '../directives/validators';
import {addValidators, hasValidator, removeValidators, toObservable} from '../validators';

import {AbstractControl as IAbstractControl, AbstractControlOptions, DISABLED, FormArray, FormControlStatus, FormGroup, FormHooks, INVALID, PENDING, VALID} from './api';
import {_find, coerceToAsyncValidator, coerceToValidator, isOptionsObj} from './util';

const AbstractControlImpl = function() {
  // We use an IIFE for the initialization here because class expressions cannot be abstract.

  abstract class AbstractControl implements IAbstractControl {
    /** @internal */
    _pendingDirty = false;

    /** @internal */
    _hasOwnPendingAsyncValidator = false;

    /** @internal */
    _pendingTouched = false;

    /** @internal */
    _onCollectionChange = () => {};

    /** @internal */
    _updateOn?: FormHooks;

    private _parent: FormGroup|FormArray|null = null;
    private _asyncValidationSubscription: any;

    private _composedValidatorFn: ValidatorFn|null;

    private _composedAsyncValidatorFn: AsyncValidatorFn|null;

    private _rawValidators: ValidatorFn|ValidatorFn[]|null;

    private _rawAsyncValidators: AsyncValidatorFn|AsyncValidatorFn[]|null;

    public readonly value: any;

    constructor(
        validators: ValidatorFn|ValidatorFn[]|null,
        asyncValidators: AsyncValidatorFn|AsyncValidatorFn[]|null) {
      this._rawValidators = validators;
      this._rawAsyncValidators = asyncValidators;
      this._composedValidatorFn = coerceToValidator(this._rawValidators);
      this._composedAsyncValidatorFn = coerceToAsyncValidator(this._rawAsyncValidators);
    }


    get validator(): ValidatorFn|null {
      return this._composedValidatorFn;
    }

    set validator(validatorFn: ValidatorFn|null) {
      this._rawValidators = this._composedValidatorFn = validatorFn;
    }

    get asyncValidator(): AsyncValidatorFn|null {
      return this._composedAsyncValidatorFn;
    }

    set asyncValidator(asyncValidatorFn: AsyncValidatorFn|null) {
      this._rawAsyncValidators = this._composedAsyncValidatorFn = asyncValidatorFn;
    }

    get parent(): FormGroup|FormArray|null {
      return this._parent;
    }

    public readonly status!: FormControlStatus;

    get valid(): boolean {
      return this.status === VALID;
    }

    get invalid(): boolean {
      return this.status === INVALID;
    }

    get pending(): boolean {
      return this.status == PENDING;
    }

    get disabled(): boolean {
      return this.status === DISABLED;
    }

    get enabled(): boolean {
      return this.status !== DISABLED;
    }

    public readonly errors!: ValidationErrors|null;

    public readonly pristine: boolean = true;

    get dirty(): boolean {
      return !this.pristine;
    }

    public readonly touched: boolean = false;

    get untouched(): boolean {
      return !this.touched;
    }

    public readonly valueChanges!: Observable<any>;

    public readonly statusChanges!: Observable<FormControlStatus>;

    get updateOn(): FormHooks {
      return this._updateOn ? this._updateOn : (this.parent ? this.parent.updateOn : 'change');
    }

    setValidators(validators: ValidatorFn|ValidatorFn[]|null): void {
      this._rawValidators = validators;
      this._composedValidatorFn = coerceToValidator(validators);
    }

    setAsyncValidators(validators: AsyncValidatorFn|AsyncValidatorFn[]|null): void {
      this._rawAsyncValidators = validators;
      this._composedAsyncValidatorFn = coerceToAsyncValidator(validators);
    }

    addValidators(validators: ValidatorFn|ValidatorFn[]): void {
      this.setValidators(addValidators(validators, this._rawValidators));
    }

    addAsyncValidators(validators: AsyncValidatorFn|AsyncValidatorFn[]): void {
      this.setAsyncValidators(addValidators(validators, this._rawAsyncValidators));
    }

    removeValidators(validators: ValidatorFn|ValidatorFn[]): void {
      this.setValidators(removeValidators(validators, this._rawValidators));
    }

    removeAsyncValidators(validators: AsyncValidatorFn|AsyncValidatorFn[]): void {
      this.setAsyncValidators(removeValidators(validators, this._rawAsyncValidators));
    }

    hasValidator(validator: ValidatorFn): boolean {
      return hasValidator(this._rawValidators, validator);
    }

    hasAsyncValidator(validator: AsyncValidatorFn): boolean {
      return hasValidator(this._rawAsyncValidators, validator);
    }

    clearValidators(): void {
      this.validator = null;
    }

    clearAsyncValidators(): void {
      this.asyncValidator = null;
    }

    markAsTouched(opts: {onlySelf?: boolean} = {}): void {
      (this as {touched: boolean}).touched = true;

      if (this._parent && !opts.onlySelf) {
        this._parent.markAsTouched(opts);
      }
    }

    markAllAsTouched(): void {
      this.markAsTouched({onlySelf: true});

      this._forEachChild((control: AbstractControl) => control.markAllAsTouched());
    }

    markAsUntouched(opts: {onlySelf?: boolean} = {}): void {
      (this as {touched: boolean}).touched = false;
      this._pendingTouched = false;

      this._forEachChild((control: AbstractControl) => {
        control.markAsUntouched({onlySelf: true});
      });

      if (this._parent && !opts.onlySelf) {
        this._parent._updateTouched(opts);
      }
    }

    markAsDirty(opts: {onlySelf?: boolean} = {}): void {
      (this as {pristine: boolean}).pristine = false;

      if (this._parent && !opts.onlySelf) {
        this._parent.markAsDirty(opts);
      }
    }

    markAsPristine(opts: {onlySelf?: boolean} = {}): void {
      (this as {pristine: boolean}).pristine = true;
      this._pendingDirty = false;

      this._forEachChild((control: AbstractControl) => {
        control.markAsPristine({onlySelf: true});
      });

      if (this._parent && !opts.onlySelf) {
        this._parent._updatePristine(opts);
      }
    }

    markAsPending(opts: {onlySelf?: boolean, emitEvent?: boolean} = {}): void {
      (this as {status: FormControlStatus}).status = PENDING;

      if (opts.emitEvent !== false) {
        (this.statusChanges as EventEmitter<FormControlStatus>).emit(this.status);
      }

      if (this._parent && !opts.onlySelf) {
        this._parent.markAsPending(opts);
      }
    }

    disable(opts: {onlySelf?: boolean, emitEvent?: boolean} = {}): void {
      // If parent has been marked artificially dirty we don't want to re-calculate the
      // parent's dirtiness based on the children.
      const skipPristineCheck = this._parentMarkedDirty(opts.onlySelf);

      (this as {status: FormControlStatus}).status = DISABLED;
      (this as {errors: ValidationErrors | null}).errors = null;
      this._forEachChild((control: AbstractControl) => {
        control.disable({...opts, onlySelf: true});
      });
      this._updateValue();

      if (opts.emitEvent !== false) {
        (this.valueChanges as EventEmitter<any>).emit(this.value);
        (this.statusChanges as EventEmitter<FormControlStatus>).emit(this.status);
      }

      this._updateAncestors({...opts, skipPristineCheck});
      this._onDisabledChange.forEach((changeFn) => changeFn(true));
    }

    enable(opts: {onlySelf?: boolean, emitEvent?: boolean} = {}): void {
      // If parent has been marked artificially dirty we don't want to re-calculate the
      // parent's dirtiness based on the children.
      const skipPristineCheck = this._parentMarkedDirty(opts.onlySelf);

      (this as {status: FormControlStatus}).status = VALID;
      this._forEachChild((control: AbstractControl) => {
        control.enable({...opts, onlySelf: true});
      });
      this.updateValueAndValidity({onlySelf: true, emitEvent: opts.emitEvent});

      this._updateAncestors({...opts, skipPristineCheck});
      this._onDisabledChange.forEach((changeFn) => changeFn(false));
    }

    private _updateAncestors(
        opts: {onlySelf?: boolean, emitEvent?: boolean, skipPristineCheck?: boolean}) {
      if (this._parent && !opts.onlySelf) {
        this._parent.updateValueAndValidity(opts);
        if (!opts.skipPristineCheck) {
          this._parent._updatePristine();
        }
        this._parent._updateTouched();
      }
    }

    setParent(parent: FormGroup|FormArray): void {
      this._parent = parent;
    }

    abstract setValue(value: any, options?: Object): void;

    abstract patchValue(value: any, options?: Object): void;

    abstract reset(value?: any, options?: Object): void;

    updateValueAndValidity(opts: {onlySelf?: boolean, emitEvent?: boolean} = {}): void {
      this._setInitialStatus();
      this._updateValue();

      if (this.enabled) {
        this._cancelExistingSubscription();
        (this as {errors: ValidationErrors | null}).errors = this._runValidator();
        (this as {status: FormControlStatus}).status = this._calculateStatus();

        if (this.status === VALID || this.status === PENDING) {
          this._runAsyncValidator(opts.emitEvent);
        }
      }

      if (opts.emitEvent !== false) {
        (this.valueChanges as EventEmitter<any>).emit(this.value);
        (this.statusChanges as EventEmitter<FormControlStatus>).emit(this.status);
      }

      if (this._parent && !opts.onlySelf) {
        this._parent.updateValueAndValidity(opts);
      }
    }

    /** @internal */
    _updateTreeValidity(opts: {emitEvent?: boolean} = {emitEvent: true}) {
      this._forEachChild((ctrl: AbstractControl) => ctrl._updateTreeValidity(opts));
      this.updateValueAndValidity({onlySelf: true, emitEvent: opts.emitEvent});
    }

    private _setInitialStatus() {
      (this as {status: FormControlStatus}).status = this._allControlsDisabled() ? DISABLED : VALID;
    }

    private _runValidator(): ValidationErrors|null {
      return this.validator ? this.validator(this) : null;
    }

    private _runAsyncValidator(emitEvent?: boolean): void {
      if (this.asyncValidator) {
        (this as {status: FormControlStatus}).status = PENDING;
        this._hasOwnPendingAsyncValidator = true;
        const obs = toObservable(this.asyncValidator(this));
        this._asyncValidationSubscription = obs.subscribe((errors: ValidationErrors|null) => {
          this._hasOwnPendingAsyncValidator = false;
          // This will trigger the recalculation of the validation status, which depends on
          // the state of the asynchronous validation (whether it is in progress or not). So, it is
          // necessary that we have updated the `_hasOwnPendingAsyncValidator` boolean flag first.
          this.setErrors(errors, {emitEvent});
        });
      }
    }

    private _cancelExistingSubscription(): void {
      if (this._asyncValidationSubscription) {
        this._asyncValidationSubscription.unsubscribe();
        this._hasOwnPendingAsyncValidator = false;
      }
    }

    setErrors(errors: ValidationErrors|null, opts: {emitEvent?: boolean} = {}): void {
      (this as {errors: ValidationErrors | null}).errors = errors;
      this._updateControlsErrors(opts.emitEvent !== false);
    }

    get(path: Array<string|number>|string): IAbstractControl|null {
      return _find(this, path, '.');
    }

    getError(errorCode: string, path?: Array<string|number>|string): any {
      const control = path ? this.get(path) : this;
      return control && control.errors ? control.errors[errorCode] : null;
    }

    hasError(errorCode: string, path?: Array<string|number>|string): boolean {
      return !!this.getError(errorCode, path);
    }

    get root(): IAbstractControl {
      let x: IAbstractControl = this;

      while (x.parent) {
        x = x.parent;
      }

      return x;
    }

    /** @internal */
    _updateControlsErrors(emitEvent: boolean): void {
      (this as {status: FormControlStatus}).status = this._calculateStatus();

      if (emitEvent) {
        (this.statusChanges as EventEmitter<FormControlStatus>).emit(this.status);
      }

      if (this._parent) {
        this._parent._updateControlsErrors(emitEvent);
      }
    }

    /** @internal */
    _initObservables() {
      (this as {valueChanges: Observable<any>}).valueChanges = new EventEmitter();
      (this as {statusChanges: Observable<FormControlStatus>}).statusChanges = new EventEmitter();
    }

    private _calculateStatus(): FormControlStatus {
      if (this._allControlsDisabled()) return DISABLED;
      if (this.errors) return INVALID;
      if (this._hasOwnPendingAsyncValidator || this._anyControlsHaveStatus(PENDING)) return PENDING;
      if (this._anyControlsHaveStatus(INVALID)) return INVALID;
      return VALID;
    }

    /** @internal */
    abstract _updateValue(): void;

    /** @internal */
    abstract _forEachChild(cb: (c: AbstractControl) => void): void;

    /** @internal */
    abstract _anyControls(condition: (c: AbstractControl) => boolean): boolean;

    /** @internal */
    abstract _allControlsDisabled(): boolean;

    /** @internal */
    abstract _syncPendingControls(): boolean;

    /** @internal */
    _anyControlsHaveStatus(status: FormControlStatus): boolean {
      return this._anyControls((control: AbstractControl) => control.status === status);
    }

    /** @internal */
    _anyControlsDirty(): boolean {
      return this._anyControls((control: AbstractControl) => control.dirty);
    }

    /** @internal */
    _anyControlsTouched(): boolean {
      return this._anyControls((control: AbstractControl) => control.touched);
    }

    /** @internal */
    _updatePristine(opts: {onlySelf?: boolean} = {}): void {
      (this as {pristine: boolean}).pristine = !this._anyControlsDirty();

      if (this._parent && !opts.onlySelf) {
        this._parent._updatePristine(opts);
      }
    }

    /** @internal */
    _updateTouched(opts: {onlySelf?: boolean} = {}): void {
      (this as {touched: boolean}).touched = this._anyControlsTouched();

      if (this._parent && !opts.onlySelf) {
        this._parent._updateTouched(opts);
      }
    }

    /** @internal */
    _onDisabledChange: Array<(isDisabled: boolean) => void> = [];

    /** @internal */
    _isBoxedValue(formState: any): boolean {
      return typeof formState === 'object' && formState !== null &&
          Object.keys(formState).length === 2 && 'value' in formState && 'disabled' in formState;
    }

    /** @internal */
    _registerOnCollectionChange(fn: () => void): void {
      this._onCollectionChange = fn;
    }

    /** @internal */
    _setUpdateStrategy(opts?: ValidatorFn|ValidatorFn[]|AbstractControlOptions|null): void {
      if (isOptionsObj(opts) && opts.updateOn != null) {
        this._updateOn = opts.updateOn!;
      }
    }

    /** @internal */
    _find(name: string|number): AbstractControl|null {
      return null;
    }

    private _parentMarkedDirty(onlySelf?: boolean): boolean {
      const parentDirty = this._parent && this._parent.dirty;
      return !onlySelf && !!parentDirty && !this._parent!._anyControlsDirty();
    }
  }

  return AbstractControl;
}();

type AbstractControlCtor = abstract new (
    validators: ValidatorFn|ValidatorFn[]|null,
    asyncValidators: AsyncValidatorFn|AsyncValidatorFn[]|null) => IAbstractControl;

export const AbstractControl: AbstractControlCtor = AbstractControlImpl as AbstractControlCtor;
export type AbstractControl = IAbstractControl;
