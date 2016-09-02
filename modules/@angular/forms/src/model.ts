/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {fromPromise} from 'rxjs/observable/fromPromise';

import {composeAsyncValidators, composeValidators} from './directives/shared';
import {AsyncValidatorFn, ValidatorFn} from './directives/validators';
import {EventEmitter, Observable} from './facade/async';
import {ListWrapper, StringMapWrapper} from './facade/collection';
import {isBlank, isPresent, isPromise, isStringMap, normalizeBool} from './facade/lang';



/**
 * Indicates that a FormControl is valid, i.e. that no errors exist in the input value.
 */
export const VALID = 'VALID';

/**
 * Indicates that a FormControl is invalid, i.e. that an error exists in the input value.
 */
export const INVALID = 'INVALID';

/**
 * Indicates that a FormControl is pending, i.e. that async validation is occurring and
 * errors are not yet available for the input value.
 */
export const PENDING = 'PENDING';

/**
 * Indicates that a FormControl is disabled, i.e. that the control is exempt from ancestor
 * calculations of validity or value.
 */
export const DISABLED = 'DISABLED';

export function isControl(control: Object): boolean {
  return control instanceof AbstractControl;
}

function _find(control: AbstractControl, path: Array<string|number>| string, delimiter: string) {
  if (isBlank(path)) return null;

  if (!(path instanceof Array)) {
    path = (<string>path).split(delimiter);
  }
  if (path instanceof Array && ListWrapper.isEmpty(path)) return null;

  return (<Array<string|number>>path).reduce((v, name) => {
    if (v instanceof FormGroup) {
      return isPresent(v.controls[name]) ? v.controls[name] : null;
    } else if (v instanceof FormArray) {
      var index = <number>name;
      return isPresent(v.at(index)) ? v.at(index) : null;
    } else {
      return null;
    }
  }, control);
}

function toObservable(r: any): Observable<any> {
  return isPromise(r) ? fromPromise(r) : r;
}

function coerceToValidator(validator: ValidatorFn | ValidatorFn[]): ValidatorFn {
  return Array.isArray(validator) ? composeValidators(validator) : validator;
}

function coerceToAsyncValidator(asyncValidator: AsyncValidatorFn | AsyncValidatorFn[]):
    AsyncValidatorFn {
  return Array.isArray(asyncValidator) ? composeAsyncValidators(asyncValidator) : asyncValidator;
}

/**
 * @stable
 */
export abstract class AbstractControl {
  /** @internal */
  _value: any;
  /** @internal */
  _onCollectionChange = () => {};

  private _valueChanges: EventEmitter<any>;
  private _statusChanges: EventEmitter<any>;
  private _status: string;
  private _errors: {[key: string]: any};
  private _pristine: boolean = true;
  private _touched: boolean = false;
  private _parent: FormGroup|FormArray;
  private _asyncValidationSubscription: any;

  constructor(public validator: ValidatorFn, public asyncValidator: AsyncValidatorFn) {}

  get value(): any { return this._value; }

  get status(): string { return this._status; }

  get valid(): boolean { return this._status === VALID; }

  get invalid(): boolean { return this._status === INVALID; }

  /**
   * Returns the errors of this control.
   */
  get errors(): {[key: string]: any} { return this._errors; }

  get pristine(): boolean { return this._pristine; }

  get dirty(): boolean { return !this.pristine; }

  get touched(): boolean { return this._touched; }

  get untouched(): boolean { return !this._touched; }

  get valueChanges(): Observable<any> { return this._valueChanges; }

  get statusChanges(): Observable<any> { return this._statusChanges; }

  get pending(): boolean { return this._status == PENDING; }

  get disabled(): boolean { return this._status === DISABLED; }

  get enabled(): boolean { return this._status !== DISABLED; }

  setAsyncValidators(newValidator: AsyncValidatorFn|AsyncValidatorFn[]): void {
    this.asyncValidator = coerceToAsyncValidator(newValidator);
  }

  clearAsyncValidators(): void { this.asyncValidator = null; }

  setValidators(newValidator: ValidatorFn|ValidatorFn[]): void {
    this.validator = coerceToValidator(newValidator);
  }

  clearValidators(): void { this.validator = null; }

  markAsTouched({onlySelf}: {onlySelf?: boolean} = {}): void {
    onlySelf = normalizeBool(onlySelf);
    this._touched = true;

    if (isPresent(this._parent) && !onlySelf) {
      this._parent.markAsTouched({onlySelf: onlySelf});
    }
  }

  markAsDirty({onlySelf}: {onlySelf?: boolean} = {}): void {
    onlySelf = normalizeBool(onlySelf);
    this._pristine = false;

    if (isPresent(this._parent) && !onlySelf) {
      this._parent.markAsDirty({onlySelf: onlySelf});
    }
  }

  markAsPristine({onlySelf}: {onlySelf?: boolean} = {}): void {
    this._pristine = true;

    this._forEachChild((control: AbstractControl) => { control.markAsPristine({onlySelf: true}); });

    if (isPresent(this._parent) && !onlySelf) {
      this._parent._updatePristine({onlySelf: onlySelf});
    }
  }

  markAsUntouched({onlySelf}: {onlySelf?: boolean} = {}): void {
    this._touched = false;

    this._forEachChild(
        (control: AbstractControl) => { control.markAsUntouched({onlySelf: true}); });

    if (isPresent(this._parent) && !onlySelf) {
      this._parent._updateTouched({onlySelf: onlySelf});
    }
  }

  markAsPending({onlySelf}: {onlySelf?: boolean} = {}): void {
    onlySelf = normalizeBool(onlySelf);
    this._status = PENDING;

    if (isPresent(this._parent) && !onlySelf) {
      this._parent.markAsPending({onlySelf: onlySelf});
    }
  }

  disable({onlySelf, emitEvent}: {onlySelf?: boolean, emitEvent?: boolean} = {}): void {
    emitEvent = isPresent(emitEvent) ? emitEvent : true;

    this._status = DISABLED;
    this._forEachChild((control: AbstractControl) => { control.disable({onlySelf: true}); });
    this._updateValue();

    if (emitEvent) {
      this._valueChanges.emit(this._value);
      this._statusChanges.emit(this._status);
    }

    this._updateAncestors(onlySelf);
    this._onDisabledChange(true);
  }

  enable({onlySelf, emitEvent}: {onlySelf?: boolean, emitEvent?: boolean} = {}): void {
    this._status = VALID;
    this._forEachChild((control: AbstractControl) => { control.enable({onlySelf: true}); });
    this.updateValueAndValidity({onlySelf: true, emitEvent: emitEvent});

    this._updateAncestors(onlySelf);
    this._onDisabledChange(false);
  }

  private _updateAncestors(onlySelf: boolean) {
    if (isPresent(this._parent) && !onlySelf) {
      this._parent.updateValueAndValidity();
      this._parent._updatePristine();
      this._parent._updateTouched();
    }
  }

  setParent(parent: FormGroup|FormArray): void { this._parent = parent; }

  abstract setValue(value: any, options?: Object): void;

  abstract patchValue(value: any, options?: Object): void;

  abstract reset(value?: any, options?: Object): void;

  updateValueAndValidity({onlySelf, emitEvent}: {onlySelf?: boolean, emitEvent?: boolean} = {}):
      void {
    onlySelf = normalizeBool(onlySelf);
    emitEvent = isPresent(emitEvent) ? emitEvent : true;

    this._updateValue();
    this._errors = this._runValidator();
    const originalStatus = this._status;
    this._status = this._calculateStatus();

    if (this._status == VALID || this._status == PENDING) {
      this._runAsyncValidator(emitEvent);
    }

    if (this._disabledChanged(originalStatus)) {
      this._updateValue();
    }

    if (emitEvent) {
      this._valueChanges.emit(this._value);
      this._statusChanges.emit(this._status);
    }

    if (isPresent(this._parent) && !onlySelf) {
      this._parent.updateValueAndValidity({onlySelf: onlySelf, emitEvent: emitEvent});
    }
  }

  /** @internal */
  _updateTreeValidity({emitEvent}: {emitEvent?: boolean} = {emitEvent: true}) {
    this._forEachChild((ctrl: AbstractControl) => ctrl._updateTreeValidity({emitEvent}));
    this.updateValueAndValidity({onlySelf: true, emitEvent});
  }

  private _runValidator(): {[key: string]: any} {
    return isPresent(this.validator) ? this.validator(this) : null;
  }

  private _runAsyncValidator(emitEvent: boolean): void {
    if (isPresent(this.asyncValidator)) {
      this._status = PENDING;
      this._cancelExistingSubscription();
      var obs = toObservable(this.asyncValidator(this));
      this._asyncValidationSubscription = obs.subscribe(
          {next: (res: {[key: string]: any}) => this.setErrors(res, {emitEvent: emitEvent})});
    }
  }

  private _cancelExistingSubscription(): void {
    if (isPresent(this._asyncValidationSubscription)) {
      this._asyncValidationSubscription.unsubscribe();
    }
  }

  private _disabledChanged(originalStatus: string): boolean {
    return this._status !== originalStatus &&
        (this._status === DISABLED || originalStatus === DISABLED);
  }

  /**
   * Sets errors on a form control.
   *
   * This is used when validations are run not automatically, but manually by the user.
   *
   * Calling `setErrors` will also update the validity of the parent control.
   *
   * ## Usage
   *
   * ```
   * var login = new FormControl("someLogin");
   * login.setErrors({
   *   "notUnique": true
   * });
   *
   * expect(login.valid).toEqual(false);
   * expect(login.errors).toEqual({"notUnique": true});
   *
   * login.updateValue("someOtherLogin");
   *
   * expect(login.valid).toEqual(true);
   * ```
   */
  setErrors(errors: {[key: string]: any}, {emitEvent}: {emitEvent?: boolean} = {}): void {
    emitEvent = isPresent(emitEvent) ? emitEvent : true;

    this._errors = errors;
    this._updateControlsErrors(emitEvent);
  }

  get(path: Array<string|number>|string): AbstractControl { return _find(this, path, '.'); }

  getError(errorCode: string, path: string[] = null): any {
    var control = isPresent(path) && !ListWrapper.isEmpty(path) ? this.get(path) : this;
    if (isPresent(control) && isPresent(control._errors)) {
      return StringMapWrapper.get(control._errors, errorCode);
    } else {
      return null;
    }
  }

  hasError(errorCode: string, path: string[] = null): boolean {
    return isPresent(this.getError(errorCode, path));
  }

  get root(): AbstractControl {
    let x: AbstractControl = this;

    while (isPresent(x._parent)) {
      x = x._parent;
    }

    return x;
  }

  /** @internal */
  _updateControlsErrors(emitEvent: boolean): void {
    this._status = this._calculateStatus();

    if (emitEvent) {
      this._statusChanges.emit(this._status);
    }

    if (isPresent(this._parent)) {
      this._parent._updateControlsErrors(emitEvent);
    }
  }

  /** @internal */
  _initObservables() {
    this._valueChanges = new EventEmitter();
    this._statusChanges = new EventEmitter();
  }


  private _calculateStatus(): string {
    if (this._allControlsDisabled()) return DISABLED;
    if (isPresent(this._errors)) return INVALID;
    if (this._anyControlsHaveStatus(PENDING)) return PENDING;
    if (this._anyControlsHaveStatus(INVALID)) return INVALID;
    return VALID;
  }

  /** @internal */
  abstract _updateValue(): void;

  /** @internal */
  abstract _forEachChild(cb: Function): void;

  /** @internal */
  abstract _anyControls(condition: Function): boolean;

  /** @internal */
  abstract _allControlsDisabled(): boolean;

  /** @internal */
  _anyControlsHaveStatus(status: string): boolean {
    return this._anyControls((control: AbstractControl) => control.status == status);
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
  _updatePristine({onlySelf}: {onlySelf?: boolean} = {}): void {
    this._pristine = !this._anyControlsDirty();

    if (isPresent(this._parent) && !onlySelf) {
      this._parent._updatePristine({onlySelf: onlySelf});
    }
  }

  /** @internal */
  _updateTouched({onlySelf}: {onlySelf?: boolean} = {}): void {
    this._touched = this._anyControlsTouched();

    if (isPresent(this._parent) && !onlySelf) {
      this._parent._updateTouched({onlySelf: onlySelf});
    }
  }

  /** @internal */
  _onDisabledChange(isDisabled: boolean): void {}

  /** @internal */
  _isBoxedValue(formState: any): boolean {
    return isStringMap(formState) && Object.keys(formState).length === 2 && 'value' in formState &&
        'disabled' in formState;
  }

  /** @internal */
  _registerOnCollectionChange(fn: () => void): void { this._onCollectionChange = fn; }
}

/**
 * Defines a part of a form that cannot be divided into other controls. `FormControl`s have values
 * and
 * validation state, which is determined by an optional validation function.
 *
 * `FormControl` is one of the three fundamental building blocks used to define forms in Angular,
 * along
 * with {@link FormGroup} and {@link FormArray}.
 *
 * ## Usage
 *
 * By default, a `FormControl` is created for every `<input>` or other form component.
 * With {@link FormControlDirective} or {@link FormGroupDirective} an existing {@link FormControl}
 * can be bound to a DOM element instead. This `FormControl` can be configured with a custom
 * validation function.
 *
 * @stable
 */
export class FormControl extends AbstractControl {
  /** @internal */
  _onChange: Function[] = [];

  constructor(
      formState: any = null, validator: ValidatorFn|ValidatorFn[] = null,
      asyncValidator: AsyncValidatorFn|AsyncValidatorFn[] = null) {
    super(coerceToValidator(validator), coerceToAsyncValidator(asyncValidator));
    this._applyFormState(formState);
    this.updateValueAndValidity({onlySelf: true, emitEvent: false});
    this._initObservables();
  }

  /**
   * Set the value of the form control to `value`.
   *
   * If `onlySelf` is `true`, this change will only affect the validation of this `FormControl`
   * and not its parent component. If `emitEvent` is `true`, this change will cause a
   * `valueChanges` event on the `FormControl` to be emitted. Both of these options default to
   * `false`.
   *
   * If `emitModelToViewChange` is `true`, the view will be notified about the new value
   * via an `onChange` event. This is the default behavior if `emitModelToViewChange` is not
   * specified.
   *
   * If `emitViewToModelChange` is `true`, an ngModelChange event will be fired to update the
   * model.  This is the default behavior if `emitViewToModelChange` is not specified.
   */
  setValue(value: any, {onlySelf, emitEvent, emitModelToViewChange, emitViewToModelChange}: {
    onlySelf?: boolean,
    emitEvent?: boolean,
    emitModelToViewChange?: boolean,
    emitViewToModelChange?: boolean
  } = {}): void {
    emitModelToViewChange = isPresent(emitModelToViewChange) ? emitModelToViewChange : true;
    emitViewToModelChange = isPresent(emitViewToModelChange) ? emitViewToModelChange : true;

    this._value = value;
    if (this._onChange.length && emitModelToViewChange) {
      this._onChange.forEach((changeFn) => changeFn(this._value, emitViewToModelChange));
    }
    this.updateValueAndValidity({onlySelf: onlySelf, emitEvent: emitEvent});
  }

  /**
   * This function is functionally the same as updateValue() at this level.  It exists for
   * symmetry with patchValue() on FormGroups and FormArrays, where it does behave differently.
   */
  patchValue(value: any, options: {
    onlySelf?: boolean,
    emitEvent?: boolean,
    emitModelToViewChange?: boolean,
    emitViewToModelChange?: boolean
  } = {}): void {
    this.setValue(value, options);
  }

  reset(formState: any = null, {onlySelf}: {onlySelf?: boolean} = {}): void {
    this._applyFormState(formState);
    this.markAsPristine({onlySelf});
    this.markAsUntouched({onlySelf});
    this.setValue(this._value, {onlySelf});
  }

  /**
   * @internal
   */
  _updateValue() {}

  /**
   * @internal
   */
  _anyControls(condition: Function): boolean { return false; }

  /**
   * @internal
   */
  _allControlsDisabled(): boolean { return this.disabled; }

  /**
   * Register a listener for change events.
   */
  registerOnChange(fn: Function): void { this._onChange.push(fn); }

  /**
   * @internal
   */
  _clearChangeFns(): void {
    this._onChange = [];
    this._onDisabledChange = null;
    this._onCollectionChange = () => {};
  }

  /**
   * Register a listener for disabled events.
   */
  registerOnDisabledChange(fn: (isDisabled: boolean) => void): void { this._onDisabledChange = fn; }

  /**
   * @internal
   */
  _forEachChild(cb: Function): void {}

  private _applyFormState(formState: any) {
    if (this._isBoxedValue(formState)) {
      this._value = formState.value;
      formState.disabled ? this.disable({onlySelf: true, emitEvent: false}) :
                           this.enable({onlySelf: true, emitEvent: false});
    } else {
      this._value = formState;
    }
  }
}

/**
 * Defines a part of a form, of fixed length, that can contain other controls.
 *
 * A `FormGroup` aggregates the values of each {@link FormControl} in the group.
 * The status of a `FormGroup` depends on the status of its children.
 * If one of the controls in a group is invalid, the entire group is invalid.
 * Similarly, if a control changes its value, the entire group changes as well.
 *
 * `FormGroup` is one of the three fundamental building blocks used to define forms in Angular,
 * along with {@link FormControl} and {@link FormArray}. {@link FormArray} can also contain other
 * controls, but is of variable length.
 *
 *
 * @stable
 */
export class FormGroup extends AbstractControl {
  constructor(
      public controls: {[key: string]: AbstractControl}, validator: ValidatorFn = null,
      asyncValidator: AsyncValidatorFn = null) {
    super(validator, asyncValidator);
    this._initObservables();
    this._setUpControls();
    this.updateValueAndValidity({onlySelf: true, emitEvent: false});
  }

  /**
   * Register a control with the group's list of controls.
   */
  registerControl(name: string, control: AbstractControl): AbstractControl {
    if (this.controls[name]) return this.controls[name];
    this.controls[name] = control;
    control.setParent(this);
    control._registerOnCollectionChange(this._onCollectionChange);
    return control;
  }

  /**
   * Add a control to this group.
   */
  addControl(name: string, control: AbstractControl): void {
    this.registerControl(name, control);
    this.updateValueAndValidity();
    this._onCollectionChange();
  }

  /**
   * Remove a control from this group.
   */
  removeControl(name: string): void {
    if (this.controls[name]) this.controls[name]._registerOnCollectionChange(() => {});
    StringMapWrapper.delete(this.controls, name);
    this.updateValueAndValidity();
    this._onCollectionChange();
  }

  /**
   * Replace an existing control.
   */
  setControl(name: string, control: AbstractControl): void {
    if (this.controls[name]) this.controls[name]._registerOnCollectionChange(() => {});
    StringMapWrapper.delete(this.controls, name);
    if (control) this.registerControl(name, control);
    this.updateValueAndValidity();
    this._onCollectionChange();
  }

  /**
   * Check whether there is a control with the given name in the group.
   */
  contains(controlName: string): boolean {
    const c = StringMapWrapper.contains(this.controls, controlName);
    return c && this.get(controlName).enabled;
  }

  setValue(value: {[key: string]: any}, {onlySelf}: {onlySelf?: boolean} = {}): void {
    this._checkAllValuesPresent(value);
    StringMapWrapper.forEach(value, (newValue: any, name: string) => {
      this._throwIfControlMissing(name);
      this.controls[name].setValue(newValue, {onlySelf: true});
    });
    this.updateValueAndValidity({onlySelf: onlySelf});
  }

  patchValue(value: {[key: string]: any}, {onlySelf}: {onlySelf?: boolean} = {}): void {
    StringMapWrapper.forEach(value, (newValue: any, name: string) => {
      if (this.controls[name]) {
        this.controls[name].patchValue(newValue, {onlySelf: true});
      }
    });
    this.updateValueAndValidity({onlySelf: onlySelf});
  }

  reset(value: any = {}, {onlySelf}: {onlySelf?: boolean} = {}): void {
    this._forEachChild((control: AbstractControl, name: string) => {
      control.reset(value[name], {onlySelf: true});
    });
    this.updateValueAndValidity({onlySelf: onlySelf});
    this._updatePristine({onlySelf: onlySelf});
    this._updateTouched({onlySelf: onlySelf});
  }

  getRawValue(): Object {
    return this._reduceChildren(
        {}, (acc: {[k: string]: AbstractControl}, control: AbstractControl, name: string) => {
          acc[name] = control.value;
          return acc;
        });
  }

  /** @internal */
  _throwIfControlMissing(name: string): void {
    if (!Object.keys(this.controls).length) {
      throw new Error(`
        There are no form controls registered with this group yet.  If you're using ngModel,
        you may want to check next tick (e.g. use setTimeout).
      `);
    }
    if (!this.controls[name]) {
      throw new Error(`Cannot find form control with name: ${name}.`);
    }
  }

  /** @internal */
  _forEachChild(cb: (v: any, k: string) => void): void {
    StringMapWrapper.forEach(this.controls, cb);
  }

  /** @internal */
  _setUpControls() {
    this._forEachChild((control: AbstractControl) => {
      control.setParent(this);
      control._registerOnCollectionChange(this._onCollectionChange);
    });
  }

  /** @internal */
  _updateValue() { this._value = this._reduceValue(); }

  /** @internal */
  _anyControls(condition: Function): boolean {
    var res = false;
    this._forEachChild((control: AbstractControl, name: string) => {
      res = res || (this.contains(name) && condition(control));
    });
    return res;
  }

  /** @internal */
  _reduceValue() {
    return this._reduceChildren(
        {}, (acc: {[k: string]: AbstractControl}, control: AbstractControl, name: string) => {
          if (control.enabled || this.disabled) {
            acc[name] = control.value;
          }
          return acc;
        });
  }

  /** @internal */
  _reduceChildren(initValue: any, fn: Function) {
    var res = initValue;
    this._forEachChild(
        (control: AbstractControl, name: string) => { res = fn(res, control, name); });
    return res;
  }

  /** @internal */
  _allControlsDisabled(): boolean {
    for (let controlName of Object.keys(this.controls)) {
      if (this.controls[controlName].enabled) {
        return false;
      }
    }
    return !StringMapWrapper.isEmpty(this.controls);
  }

  /** @internal */
  _checkAllValuesPresent(value: any): void {
    this._forEachChild((control: AbstractControl, name: string) => {
      if (value[name] === undefined) {
        throw new Error(`Must supply a value for form control with name: '${name}'.`);
      }
    });
  }
}

/**
 * Defines a part of a form, of variable length, that can contain other controls.
 *
 * A `FormArray` aggregates the values of each {@link FormControl} in the group.
 * The status of a `FormArray` depends on the status of its children.
 * If one of the controls in a group is invalid, the entire array is invalid.
 * Similarly, if a control changes its value, the entire array changes as well.
 *
 * `FormArray` is one of the three fundamental building blocks used to define forms in Angular,
 * along with {@link FormControl} and {@link FormGroup}. {@link FormGroup} can also contain
 * other controls, but is of fixed length.
 *
 * ## Adding or removing controls
 *
 * To change the controls in the array, use the `push`, `insert`, or `removeAt` methods
 * in `FormArray` itself. These methods ensure the controls are properly tracked in the
 * form's hierarchy. Do not modify the array of `AbstractControl`s used to instantiate
 * the `FormArray` directly, as that will result in strange and unexpected behavior such
 * as broken change detection.
 *
 *
 * @stable
 */
export class FormArray extends AbstractControl {
  constructor(
      public controls: AbstractControl[], validator: ValidatorFn = null,
      asyncValidator: AsyncValidatorFn = null) {
    super(validator, asyncValidator);
    this._initObservables();
    this._setUpControls();
    this.updateValueAndValidity({onlySelf: true, emitEvent: false});
  }

  /**
   * Get the {@link AbstractControl} at the given `index` in the array.
   */
  at(index: number): AbstractControl { return this.controls[index]; }

  /**
   * Insert a new {@link AbstractControl} at the end of the array.
   */
  push(control: AbstractControl): void {
    this.controls.push(control);
    this._registerControl(control);
    this.updateValueAndValidity();
    this._onCollectionChange();
  }

  /**
   * Insert a new {@link AbstractControl} at the given `index` in the array.
   */
  insert(index: number, control: AbstractControl): void {
    ListWrapper.insert(this.controls, index, control);
    this._registerControl(control);
    this.updateValueAndValidity();
    this._onCollectionChange();
  }

  /**
   * Remove the control at the given `index` in the array.
   */
  removeAt(index: number): void {
    if (this.controls[index]) this.controls[index]._registerOnCollectionChange(() => {});
    ListWrapper.removeAt(this.controls, index);
    this.updateValueAndValidity();
    this._onCollectionChange();
  }

  /**
   * Replace an existing control.
   */
  setControl(index: number, control: AbstractControl): void {
    if (this.controls[index]) this.controls[index]._registerOnCollectionChange(() => {});
    ListWrapper.removeAt(this.controls, index);

    if (control) {
      ListWrapper.insert(this.controls, index, control);
      this._registerControl(control);
    }

    this.updateValueAndValidity();
    this._onCollectionChange();
  }

  /**
   * Length of the control array.
   */
  get length(): number { return this.controls.length; }

  setValue(value: any[], {onlySelf}: {onlySelf?: boolean} = {}): void {
    this._checkAllValuesPresent(value);
    value.forEach((newValue: any, index: number) => {
      this._throwIfControlMissing(index);
      this.at(index).setValue(newValue, {onlySelf: true});
    });
    this.updateValueAndValidity({onlySelf: onlySelf});
  }

  patchValue(value: any[], {onlySelf}: {onlySelf?: boolean} = {}): void {
    value.forEach((newValue: any, index: number) => {
      if (this.at(index)) {
        this.at(index).patchValue(newValue, {onlySelf: true});
      }
    });
    this.updateValueAndValidity({onlySelf: onlySelf});
  }

  reset(value: any = [], {onlySelf}: {onlySelf?: boolean} = {}): void {
    this._forEachChild((control: AbstractControl, index: number) => {
      control.reset(value[index], {onlySelf: true});
    });
    this.updateValueAndValidity({onlySelf: onlySelf});
    this._updatePristine({onlySelf: onlySelf});
    this._updateTouched({onlySelf: onlySelf});
  }

  getRawValue(): any[] { return this.controls.map((control) => control.value); }

  /** @internal */
  _throwIfControlMissing(index: number): void {
    if (!this.controls.length) {
      throw new Error(`
        There are no form controls registered with this array yet.  If you're using ngModel,
        you may want to check next tick (e.g. use setTimeout).
      `);
    }
    if (!this.at(index)) {
      throw new Error(`Cannot find form control at index ${index}`);
    }
  }

  /** @internal */
  _forEachChild(cb: Function): void {
    this.controls.forEach((control: AbstractControl, index: number) => { cb(control, index); });
  }

  /** @internal */
  _updateValue(): void {
    this._value = this.controls.filter((control) => control.enabled || this.disabled)
                      .map((control) => control.value);
  }

  /** @internal */
  _anyControls(condition: Function): boolean {
    return this.controls.some((control: AbstractControl) => control.enabled && condition(control));
  }

  /** @internal */
  _setUpControls(): void {
    this._forEachChild((control: AbstractControl) => this._registerControl(control));
  }

  /** @internal */
  _checkAllValuesPresent(value: any): void {
    this._forEachChild((control: AbstractControl, i: number) => {
      if (value[i] === undefined) {
        throw new Error(`Must supply a value for form control at index: ${i}.`);
      }
    });
  }

  /** @internal */
  _allControlsDisabled(): boolean {
    for (let control of this.controls) {
      if (control.enabled) return false;
    }
    return !!this.controls.length;
  }

  private _registerControl(control: AbstractControl) {
    control.setParent(this);
    control._registerOnCollectionChange(this._onCollectionChange);
  }
}
