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
import {isBlank, isPresent, isStringMap, normalizeBool} from './facade/lang';
import {isPromise} from './private_import_core';


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
 * @whatItDoes This is the base class for {@link FormControl}, {@link FormGroup}, and
 * {@link FormArray}.
 *
 * It provides some of the shared behavior that all controls and groups of controls have, like
 * running validators, calculating status, and resetting state. It also defines the properties
 * that are shared between all sub-classes, like `value`, `valid`, and `dirty`. It shouldn't be
 * instantiated directly.
 *
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

  /**
   * The value of the control.
   */
  get value(): any { return this._value; }

  /**
   * The validation status of the control. There are four possible
   * validation statuses:
   *
   * * **VALID**:  control has passed all validation checks
   * * **INVALID**: control has failed at least one validation check
   * * **PENDING**: control is in the midst of conducting a validation check
   * * **DISABLED**: control is exempt from validation checks
   *
   * These statuses are mutually exclusive, so a control cannot be
   * both valid AND invalid or invalid AND disabled.
   */
  get status(): string { return this._status; }

  /**
   * A control is `valid` when its `status === VALID`.
   *
   * In order to have this status, the control must have passed all its
   * validation checks.
   */
  get valid(): boolean { return this._status === VALID; }

  /**
   * A control is `invalid` when its `status === INVALID`.
   *
   * In order to have this status, the control must have failed
   * at least one of its validation checks.
   */
  get invalid(): boolean { return this._status === INVALID; }

  /**
   * A control is `pending` when its `status === PENDING`.
   *
   * In order to have this status, the control must be in the
   * middle of conducting a validation check.
   */
  get pending(): boolean { return this._status == PENDING; }

  /**
   * A control is `disabled` when its `status === DISABLED`.
   *
   * Disabled controls are exempt from validation checks and
   * are not included in the aggregate value of their ancestor
   * controls.
   */
  get disabled(): boolean { return this._status === DISABLED; }

  /**
   * A control is `enabled` as long as its `status !== DISABLED`.
   *
   * In other words, it has a status of `VALID`, `INVALID`, or
   * `PENDING`.
   */
  get enabled(): boolean { return this._status !== DISABLED; }

  /**
   * Returns any errors generated by failing validation. If there
   * are no errors, it will return null.
   */
  get errors(): {[key: string]: any} { return this._errors; }

  /**
   * A control is `pristine` if the user has not yet changed
   * the value in the UI.
   *
   * Note that programmatic changes to a control's value will
   * *not* mark it dirty.
   */
  get pristine(): boolean { return this._pristine; }

  /**
   * A control is `dirty` if the user has changed the value
   * in the UI.
   *
   * Note that programmatic changes to a control's value will
   * *not* mark it dirty.
   */
  get dirty(): boolean { return !this.pristine; }

  /**
  * A control is marked `touched` once the user has triggered
  * a `blur` event on it.
  */
  get touched(): boolean { return this._touched; }

  /**
   * A control is `untouched` if the user has not yet triggered
   * a `blur` event on it.
   */
  get untouched(): boolean { return !this._touched; }

  /**
   * Emits an event every time the value of the control changes, in
   * the UI or programmatically.
   */
  get valueChanges(): Observable<any> { return this._valueChanges; }

  /**
   * Emits an event every time the validation status of the control
   * is re-calculated.
   */
  get statusChanges(): Observable<any> { return this._statusChanges; }

  /**
   * Sets the synchronous validators that are active on this control.  Calling
   * this will overwrite any existing sync validators.
   */
  setValidators(newValidator: ValidatorFn|ValidatorFn[]): void {
    this.validator = coerceToValidator(newValidator);
  }

  /**
   * Sets the async validators that are active on this control. Calling this
   * will overwrite any existing async validators.
   */
  setAsyncValidators(newValidator: AsyncValidatorFn|AsyncValidatorFn[]): void {
    this.asyncValidator = coerceToAsyncValidator(newValidator);
  }

  /**
   * Empties out the sync validator list.
   */
  clearValidators(): void { this.validator = null; }

  /**
   * Empties out the async validator list.
   */
  clearAsyncValidators(): void { this.asyncValidator = null; }

  /**
   * Marks the control as `touched`.
   *
   * This will also mark all direct ancestors as `touched` to maintain
   * the model.
   */
  markAsTouched({onlySelf}: {onlySelf?: boolean} = {}): void {
    onlySelf = normalizeBool(onlySelf);
    this._touched = true;

    if (isPresent(this._parent) && !onlySelf) {
      this._parent.markAsTouched({onlySelf: onlySelf});
    }
  }

  /**
   * Marks the control as `untouched`.
   *
   * If the control has any children, it will also mark all children as `untouched`
   * to maintain the model, and re-calculate the `touched` status of all parent
   * controls.
   */
  markAsUntouched({onlySelf}: {onlySelf?: boolean} = {}): void {
    this._touched = false;

    this._forEachChild(
        (control: AbstractControl) => { control.markAsUntouched({onlySelf: true}); });

    if (isPresent(this._parent) && !onlySelf) {
      this._parent._updateTouched({onlySelf: onlySelf});
    }
  }

  /**
   * Marks the control as `dirty`.
   *
   * This will also mark all direct ancestors as `dirty` to maintain
   * the model.
   */
  markAsDirty({onlySelf}: {onlySelf?: boolean} = {}): void {
    onlySelf = normalizeBool(onlySelf);
    this._pristine = false;

    if (isPresent(this._parent) && !onlySelf) {
      this._parent.markAsDirty({onlySelf: onlySelf});
    }
  }

  /**
   * Marks the control as `pristine`.
   *
   * If the control has any children, it will also mark all children as `pristine`
   * to maintain the model, and re-calculate the `pristine` status of all parent
   * controls.
   */
  markAsPristine({onlySelf}: {onlySelf?: boolean} = {}): void {
    this._pristine = true;

    this._forEachChild((control: AbstractControl) => { control.markAsPristine({onlySelf: true}); });

    if (isPresent(this._parent) && !onlySelf) {
      this._parent._updatePristine({onlySelf: onlySelf});
    }
  }

  /**
   * Marks the control as `pending`.
   */
  markAsPending({onlySelf}: {onlySelf?: boolean} = {}): void {
    onlySelf = normalizeBool(onlySelf);
    this._status = PENDING;

    if (isPresent(this._parent) && !onlySelf) {
      this._parent.markAsPending({onlySelf: onlySelf});
    }
  }

  /**
   * Disables the control. This means the control will be exempt from validation checks and
   * excluded from the aggregate value of any parent. Its status is `DISABLED`.
   *
   * If the control has children, all children will be disabled to maintain the model.
   */
  disable({onlySelf, emitEvent}: {onlySelf?: boolean, emitEvent?: boolean} = {}): void {
    emitEvent = isPresent(emitEvent) ? emitEvent : true;

    this._status = DISABLED;
    this._errors = null;
    this._forEachChild((control: AbstractControl) => { control.disable({onlySelf: true}); });
    this._updateValue();

    if (emitEvent) {
      this._valueChanges.emit(this._value);
      this._statusChanges.emit(this._status);
    }

    this._updateAncestors(onlySelf);
    this._onDisabledChange.forEach((changeFn) => changeFn(true));
  }

  /**
   * Enables the control. This means the control will be included in validation checks and
   * the aggregate value of its parent. Its status is re-calculated based on its value and
   * its validators.
   *
   * If the control has children, all children will be enabled.
   */
  enable({onlySelf, emitEvent}: {onlySelf?: boolean, emitEvent?: boolean} = {}): void {
    this._status = VALID;
    this._forEachChild((control: AbstractControl) => { control.enable({onlySelf: true}); });
    this.updateValueAndValidity({onlySelf: true, emitEvent: emitEvent});

    this._updateAncestors(onlySelf);
    this._onDisabledChange.forEach((changeFn) => changeFn(false));
  }

  private _updateAncestors(onlySelf: boolean) {
    if (isPresent(this._parent) && !onlySelf) {
      this._parent.updateValueAndValidity();
      this._parent._updatePristine();
      this._parent._updateTouched();
    }
  }

  setParent(parent: FormGroup|FormArray): void { this._parent = parent; }

  /**
   * Sets the value of the control. Abstract method (implemented in sub-classes).
   */
  abstract setValue(value: any, options?: Object): void;

  /**
   * Patches the value of the control. Abstract method (implemented in sub-classes).
   */
  abstract patchValue(value: any, options?: Object): void;

  /**
   * Resets the control. Abstract method (implemented in sub-classes).
   */
  abstract reset(value?: any, options?: Object): void;

  /**
   * Re-calculates the value and validation status of the control.
   *
   * By default, it will also update the value and validity of its ancestors.
   */
  updateValueAndValidity({onlySelf, emitEvent}: {onlySelf?: boolean, emitEvent?: boolean} = {}):
      void {
    onlySelf = normalizeBool(onlySelf);
    emitEvent = isPresent(emitEvent) ? emitEvent : true;

    this._setInitialStatus();
    this._updateValue();

    if (this.enabled) {
      this._errors = this._runValidator();
      this._status = this._calculateStatus();

      if (this._status === VALID || this._status === PENDING) {
        this._runAsyncValidator(emitEvent);
      }
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

  private _setInitialStatus() { this._status = this._allControlsDisabled() ? DISABLED : VALID; }

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

  /**
   * Sets errors on a form control.
   *
   * This is used when validations are run manually by the user, rather than automatically.
   *
   * Calling `setErrors` will also update the validity of the parent control.
   *
   * ### Example
   *
   * ```
   * const login = new FormControl("someLogin");
   * login.setErrors({
   *   "notUnique": true
   * });
   *
   * expect(login.valid).toEqual(false);
   * expect(login.errors).toEqual({"notUnique": true});
   *
   * login.setValue("someOtherLogin");
   *
   * expect(login.valid).toEqual(true);
   * ```
   */
  setErrors(errors: {[key: string]: any}, {emitEvent}: {emitEvent?: boolean} = {}): void {
    emitEvent = isPresent(emitEvent) ? emitEvent : true;

    this._errors = errors;
    this._updateControlsErrors(emitEvent);
  }

  /**
   * Retrieves a child control given the control's name or path.
   *
   * Paths can be passed in as an array or a string delimited by a dot.
   *
   * To get a control nested within a `person` sub-group:
   *
   * * `this.form.get('person.name');`
   *
   * -OR-
   *
   * * `this.form.get(['person', 'name']);`
   */
  get(path: Array<string|number>|string): AbstractControl { return _find(this, path, '.'); }

  /**
   * Returns true if the control with the given path has the error specified. Otherwise
   * returns null or undefined.
   *
   * If no path is given, it checks for the error on the present control.
   */
  getError(errorCode: string, path: string[] = null): any {
    var control = isPresent(path) && !ListWrapper.isEmpty(path) ? this.get(path) : this;
    if (isPresent(control) && isPresent(control._errors)) {
      return control._errors[errorCode];
    } else {
      return null;
    }
  }

  /**
   * Returns true if the control with the given path has the error specified. Otherwise
   * returns false.
   *
   * If no path is given, it checks for the error on the present control.
   */
  hasError(errorCode: string, path: string[] = null): boolean {
    return isPresent(this.getError(errorCode, path));
  }

  /**
   * Retrieves the top-level ancestor of this control.
   */
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
  _onDisabledChange: Function[] = [];

  /** @internal */
  _isBoxedValue(formState: any): boolean {
    return isStringMap(formState) && Object.keys(formState).length === 2 && 'value' in formState &&
        'disabled' in formState;
  }

  /** @internal */
  _registerOnCollectionChange(fn: () => void): void { this._onCollectionChange = fn; }
}

/**
 * @whatItDoes Tracks the value and validation status of an individual form control.
 *
 * It is one of the three fundamental building blocks of Angular forms, along with
 * {@link FormGroup} and {@link FormArray}.
 *
 * @howToUse
 *
 * When instantiating a {@link FormControl}, you can pass in an initial value as the
 * first argument. Example:
 *
 * ```ts
 * const ctrl = new FormControl('some value');
 * console.log(ctrl.value);     // 'some value'
 *```
 *
 * You can also initialize the control with a form state object on instantiation,
 * which includes both the value and whether or not the control is disabled.
 * You can't use the value key without the disabled key; both are required
 * to use this way of initialization.
 *
 * ```ts
 * const ctrl = new FormControl({value: 'n/a', disabled: true});
 * console.log(ctrl.value);     // 'n/a'
 * console.log(ctrl.status);   // 'DISABLED'
 * ```
 *
 * To include a sync validator (or an array of sync validators) with the control,
 * pass it in as the second argument. Async validators are also supported, but
 * have to be passed in separately as the third arg.
 *
 * ```ts
 * const ctrl = new FormControl('', Validators.required);
 * console.log(ctrl.value);     // ''
 * console.log(ctrl.status);   // 'INVALID'
 * ```
 *
 * See its superclass, {@link AbstractControl}, for more properties and methods.
 *
 * * **npm package**: `@angular/forms`
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
   * and not its parent component. This defaults to false.
   *
   * If `emitEvent` is `true`, this
   * change will cause a `valueChanges` event on the `FormControl` to be emitted. This defaults
   * to true (as it falls through to `updateValueAndValidity`).
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
   * Patches the value of a control.
   *
   * This function is functionally the same as {@link FormControl.setValue} at this level.
   * It exists for symmetry with {@link FormGroup.patchValue} on `FormGroups` and `FormArrays`,
   * where it does behave differently.
   */
  patchValue(value: any, options: {
    onlySelf?: boolean,
    emitEvent?: boolean,
    emitModelToViewChange?: boolean,
    emitViewToModelChange?: boolean
  } = {}): void {
    this.setValue(value, options);
  }

  /**
   * Resets the form control. This means by default:
   *
   * * it is marked as `pristine`
   * * it is marked as `untouched`
   * * value is set to null
   *
   * You can also reset to a specific form state by passing through a standalone
   * value or a form state object that contains both a value and a disabled state
   * (these are the only two properties that cannot be calculated).
   *
   * Ex:
   *
   * ```ts
   * this.control.reset('Nancy');
   *
   * console.log(this.control.value);  // 'Nancy'
   * ```
   *
   * OR
   *
   * ```
   * this.control.reset({value: 'Nancy', disabled: true});
   *
   * console.log(this.control.value);  // 'Nancy'
   * console.log(this.control.status);  // 'DISABLED'
   * ```
   */
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
    this._onDisabledChange = [];
    this._onCollectionChange = () => {};
  }

  /**
   * Register a listener for disabled events.
   */
  registerOnDisabledChange(fn: (isDisabled: boolean) => void): void {
    this._onDisabledChange.push(fn);
  }

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
 * @whatItDoes Tracks the value and validity state of a group of {@link FormControl}
 * instances.
 *
 * A `FormGroup` aggregates the values of each child {@link FormControl} into one object,
 * with each control name as the key.  It calculates its status by reducing the statuses
 * of its children. For example, if one of the controls in a group is invalid, the entire
 * group becomes invalid.
 *
 * `FormGroup` is one of the three fundamental building blocks used to define forms in Angular,
 * along with {@link FormControl} and {@link FormArray}.
 *
 * @howToUse
 *
 * When instantiating a {@link FormGroup}, pass in a collection of child controls as the first
 * argument. The key for each child will be the name under which it is registered.
 *
 * ### Example
 *
 * ```
 * const form = new FormGroup({
 *   first: new FormControl('Nancy', Validators.minLength(2)),
 *   last: new FormControl('Drew'),
 * });
 *
 * console.log(form.value);   // {first: 'Nancy', last; 'Drew'}
 * console.log(form.status);  // 'VALID'
 * ```
 *
 * You can also include group-level validators as the second arg, or group-level async
 * validators as the third arg. These come in handy when you want to perform validation
 * that considers the value of more than one child control.
 *
 * ### Example
 *
 * ```
 * const form = new FormGroup({
 *   password: new FormControl('', Validators.minLength(2)),
 *   passwordConfirm: new FormControl('', Validators.minLength(2)),
 * }, passwordMatchValidator);
 *
 *
 * function passwordMatchValidator(g: FormGroup) {
 *    return g.get('password').value === g.get('passwordConfirm').value
 *       ? null : {'mismatch': true};
 * }
 * ```
 *
 * * **npm package**: `@angular/forms`
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
   * Registers a control with the group's list of controls.
   *
   * This method does not update value or validity of the control, so for
   * most cases you'll want to use {@link FormGroup.addControl} instead.
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
    delete (this.controls[name]);
    this.updateValueAndValidity();
    this._onCollectionChange();
  }

  /**
   * Replace an existing control.
   */
  setControl(name: string, control: AbstractControl): void {
    if (this.controls[name]) this.controls[name]._registerOnCollectionChange(() => {});
    delete (this.controls[name]);
    if (control) this.registerControl(name, control);
    this.updateValueAndValidity();
    this._onCollectionChange();
  }

  /**
   * Check whether there is an enabled control with the given name in the group.
   *
   * It will return false for disabled controls. If you'd like to check for
   * existence in the group only, use {@link AbstractControl.get} instead.
   */
  contains(controlName: string): boolean {
    return this.controls.hasOwnProperty(controlName) && this.controls[controlName].enabled;
  }

  /**
   *  Sets the value of the {@link FormGroup}. It accepts an object that matches
   *  the structure of the group, with control names as keys.
   *
   * This method performs strict checks, so it will throw an error if you try
   * to set the value of a control that doesn't exist or if you exclude the
   * value of a control.
   *
   *  ### Example
   *
   *  ```
   *  const form = new FormGroup({
   *     first: new FormControl(),
   *     last: new FormControl()
   *  });
   *  console.log(form.value);   // {first: null, last: null}
   *
   *  form.setValue({first: 'Nancy', last: 'Drew'});
   *  console.log(form.value);   // {first: 'Nancy', last: 'Drew'}
   *
   *  ```
   */
  setValue(value: {[key: string]: any}, {onlySelf}: {onlySelf?: boolean} = {}): void {
    this._checkAllValuesPresent(value);
    StringMapWrapper.forEach(value, (newValue: any, name: string) => {
      this._throwIfControlMissing(name);
      this.controls[name].setValue(newValue, {onlySelf: true});
    });
    this.updateValueAndValidity({onlySelf: onlySelf});
  }

  /**
   *  Patches the value of the {@link FormGroup}. It accepts an object with control
   *  names as keys, and will do its best to match the values to the correct controls
   *  in the group.
   *
   *  It accepts both super-sets and sub-sets of the group without throwing an error.
   *
   *  ### Example
   *
   *  ```
   *  const form = new FormGroup({
   *     first: new FormControl(),
   *     last: new FormControl()
   *  });
   *  console.log(form.value);   // {first: null, last: null}
   *
   *  form.patchValue({first: 'Nancy'});
   *  console.log(form.value);   // {first: 'Nancy', last: null}
   *
   *  ```
   */
  patchValue(value: {[key: string]: any}, {onlySelf}: {onlySelf?: boolean} = {}): void {
    StringMapWrapper.forEach(value, (newValue: any, name: string) => {
      if (this.controls[name]) {
        this.controls[name].patchValue(newValue, {onlySelf: true});
      }
    });
    this.updateValueAndValidity({onlySelf: onlySelf});
  }

  /**
   * Resets the {@link FormGroup}. This means by default:
   *
   * * The group and all descendants are marked `pristine`
   * * The group and all descendants are marked `untouched`
   * * The value of all descendants will be null or null maps
   *
   * You can also reset to a specific form state by passing in a map of states
   * that matches the structure of your form, with control names as keys. The state
   * can be a standalone value or a form state object with both a value and a disabled
   * status.
   *
   * ### Example
   *
   * ```ts
   * this.form.reset({first: 'name', last; 'last name'});
   *
   * console.log(this.form.value);  // {first: 'name', last: 'last name'}
   * ```
   *
   * - OR -
   *
   * ```
   * this.form.reset({
   *   first: {value: 'name', disabled: true},
   *   last: 'last'
   * });
   *
   * console.log(this.form.value);  // {first: 'name', last: 'last name'}
   * console.log(this.form.get('first').status);  // 'DISABLED'
   * ```
   */
  reset(value: any = {}, {onlySelf}: {onlySelf?: boolean} = {}): void {
    this._forEachChild((control: AbstractControl, name: string) => {
      control.reset(value[name], {onlySelf: true});
    });
    this.updateValueAndValidity({onlySelf: onlySelf});
    this._updatePristine({onlySelf: onlySelf});
    this._updateTouched({onlySelf: onlySelf});
  }

  /**
   * The aggregate value of the {@link FormGroup}, including any disabled controls.
   *
   * If you'd like to include all values regardless of disabled status, use this method.
   * Otherwise, the `value` property is the best way to get the value of the group.
   */
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
    return Object.keys(this.controls).length > 0 || this.disabled;
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
 * @whatItDoes Tracks the value and validity state of an array of {@link FormControl}
 * instances.
 *
 * A `FormArray` aggregates the values of each child {@link FormControl} into an array.
 * It calculates its status by reducing the statuses of its children. For example, if one of
 * the controls in a `FormArray` is invalid, the entire array becomes invalid.
 *
 * `FormArray` is one of the three fundamental building blocks used to define forms in Angular,
 * along with {@link FormControl} and {@link FormGroup}.
 *
 * @howToUse
 *
 * When instantiating a {@link FormArray}, pass in an array of child controls as the first
 * argument.
 *
 * ### Example
 *
 * ```
 * const arr = new FormArray([
 *   new FormControl('Nancy', Validators.minLength(2)),
 *   new FormControl('Drew'),
 * ]);
 *
 * console.log(arr.value);   // ['Nancy', 'Drew']
 * console.log(arr.status);  // 'VALID'
 * ```
 *
 * You can also include array-level validators as the second arg, or array-level async
 * validators as the third arg. These come in handy when you want to perform validation
 * that considers the value of more than one child control.
 *
 * ### Adding or removing controls
 *
 * To change the controls in the array, use the `push`, `insert`, or `removeAt` methods
 * in `FormArray` itself. These methods ensure the controls are properly tracked in the
 * form's hierarchy. Do not modify the array of `AbstractControl`s used to instantiate
 * the `FormArray` directly, as that will result in strange and unexpected behavior such
 * as broken change detection.
 *
 * * **npm package**: `@angular/forms`
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

  /**
   *  Sets the value of the {@link FormArray}. It accepts an array that matches
   *  the structure of the control.
   *
   * This method performs strict checks, so it will throw an error if you try
   * to set the value of a control that doesn't exist or if you exclude the
   * value of a control.
   *
   *  ### Example
   *
   *  ```
   *  const arr = new FormArray([
   *     new FormControl(),
   *     new FormControl()
   *  ]);
   *  console.log(arr.value);   // [null, null]
   *
   *  arr.setValue(['Nancy', 'Drew']);
   *  console.log(arr.value);   // ['Nancy', 'Drew']
   *  ```
   */
  setValue(value: any[], {onlySelf}: {onlySelf?: boolean} = {}): void {
    this._checkAllValuesPresent(value);
    value.forEach((newValue: any, index: number) => {
      this._throwIfControlMissing(index);
      this.at(index).setValue(newValue, {onlySelf: true});
    });
    this.updateValueAndValidity({onlySelf: onlySelf});
  }

  /**
   *  Patches the value of the {@link FormArray}. It accepts an array that matches the
   *  structure of the control, and will do its best to match the values to the correct
   *  controls in the group.
   *
   *  It accepts both super-sets and sub-sets of the array without throwing an error.
   *
   *  ### Example
   *
   *  ```
   *  const arr = new FormArray([
   *     new FormControl(),
   *     new FormControl()
   *  ]);
   *  console.log(arr.value);   // [null, null]
   *
   *  arr.patchValue(['Nancy']);
   *  console.log(arr.value);   // ['Nancy', null]
   *  ```
   */
  patchValue(value: any[], {onlySelf}: {onlySelf?: boolean} = {}): void {
    value.forEach((newValue: any, index: number) => {
      if (this.at(index)) {
        this.at(index).patchValue(newValue, {onlySelf: true});
      }
    });
    this.updateValueAndValidity({onlySelf: onlySelf});
  }

  /**
   * Resets the {@link FormArray}. This means by default:
   *
   * * The array and all descendants are marked `pristine`
   * * The array and all descendants are marked `untouched`
   * * The value of all descendants will be null or null maps
   *
   * You can also reset to a specific form state by passing in an array of states
   * that matches the structure of the control. The state can be a standalone value
   * or a form state object with both a value and a disabled status.
   *
   * ### Example
   *
   * ```ts
   * this.arr.reset(['name', 'last name']);
   *
   * console.log(this.arr.value);  // ['name', 'last name']
   * ```
   *
   * - OR -
   *
   * ```
   * this.arr.reset([
   *   {value: 'name', disabled: true},
   *   'last'
   * ]);
   *
   * console.log(this.arr.value);  // ['name', 'last name']
   * console.log(this.arr.get(0).status);  // 'DISABLED'
   * ```
   */
  reset(value: any = [], {onlySelf}: {onlySelf?: boolean} = {}): void {
    this._forEachChild((control: AbstractControl, index: number) => {
      control.reset(value[index], {onlySelf: true});
    });
    this.updateValueAndValidity({onlySelf: onlySelf});
    this._updatePristine({onlySelf: onlySelf});
    this._updateTouched({onlySelf: onlySelf});
  }

  /**
   * The aggregate value of the array, including any disabled controls.
   *
   * If you'd like to include all values regardless of disabled status, use this method.
   * Otherwise, the `value` property is the best way to get the value of the array.
   */
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
    return this.controls.length > 0 || this.disabled;
  }

  private _registerControl(control: AbstractControl) {
    control.setParent(this);
    control._registerOnCollectionChange(this._onCollectionChange);
  }
}
