/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken, ɵRuntimeError as RuntimeError} from '@angular/core';

import {RuntimeErrorCode} from '../errors';
import type {AbstractControl} from '../model/abstract_model';
import type {FormArray} from '../model/form_array';
import type {FormControl} from '../model/form_control';
import type {FormGroup} from '../model/form_group';
import {getControlAsyncValidators, getControlValidators, mergeValidators} from '../validators';

import type {AbstractControlDirective} from './abstract_control_directive';
import type {AbstractFormGroupDirective} from './abstract_form_group_directive';
import type {ControlContainer} from './control_container';
import {BuiltInControlValueAccessor, ControlValueAccessor} from './control_value_accessor';
import {DefaultValueAccessor} from './default_value_accessor';
import type {NgControl} from './ng_control';
import type {FormArrayName} from './reactive_directives/form_group_name';
import {ngModelWarning} from './reactive_errors';
import {AsyncValidatorFn, Validator, ValidatorFn} from './validators';

/**
 * Token to provide to allow SetDisabledState to always be called when a CVA is added, regardless of
 * whether the control is disabled or enabled.
 *
 * @see {@link FormsModule#withconfig}
 */
export const CALL_SET_DISABLED_STATE = new InjectionToken(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'CallSetDisabledState' : '',
  {
    providedIn: 'root',
    factory: () => setDisabledStateDefault,
  },
);

/**
 * The type for CALL_SET_DISABLED_STATE. If `always`, then ControlValueAccessor will always call
 * `setDisabledState` when attached, which is the most correct behavior. Otherwise, it will only be
 * called when disabled, which is the legacy behavior for compatibility.
 *
 * @publicApi
 * @see {@link FormsModule#withconfig}
 */
export type SetDisabledStateOption = 'whenDisabledForLegacyCode' | 'always';

/**
 * Whether to use the fixed setDisabledState behavior by default.
 */
export const setDisabledStateDefault: SetDisabledStateOption = 'always';

export function controlPath(name: string | null, parent: ControlContainer): string[] {
  return [...parent.path!, name!];
}

/**
 * Links a Form control and a Form directive by setting up callbacks (such as `onChange`) on both
 * instances. This function is typically invoked when form directive is being initialized.
 *
 * @param control Form control instance that should be linked.
 * @param dir Directive that should be linked with a given control.
 */
export function setUpControl(
  control: FormControl,
  dir: NgControl,
  callSetDisabledState: SetDisabledStateOption = setDisabledStateDefault,
): void {
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    if (!control) _throwError(dir, 'Cannot find control with');
    if (!dir.valueAccessor) _throwMissingValueAccessorError(dir);
  }

  setUpValidators(control, dir);

  dir.valueAccessor!.writeValue(control.value);

  // The legacy behavior only calls the CVA's `setDisabledState` if the control is disabled.
  // If the `callSetDisabledState` option is set to `always`, then this bug is fixed and
  // the method is always called.
  if (control.disabled || callSetDisabledState === 'always') {
    dir.valueAccessor!.setDisabledState?.(control.disabled);
  }

  setUpViewChangePipeline(control, dir);
  setUpModelChangePipeline(control, dir);

  setUpBlurPipeline(control, dir);

  setUpDisabledChangeHandler(control, dir);
}

/**
 * Reverts configuration performed by the `setUpControl` control function.
 * Effectively disconnects form control with a given form directive.
 * This function is typically invoked when corresponding form directive is being destroyed.
 *
 * @param control Form control which should be cleaned up.
 * @param dir Directive that should be disconnected from a given control.
 * @param validateControlPresenceOnChange Flag that indicates whether onChange handler should
 *     contain asserts to verify that it's not called once directive is destroyed. We need this flag
 *     to avoid potentially breaking changes caused by better control cleanup introduced in #39235.
 */
export function cleanUpControl(
  control: FormControl | null,
  dir: NgControl,
  validateControlPresenceOnChange: boolean = true,
): void {
  const noop = () => {
    if (validateControlPresenceOnChange && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      _noControlError(dir);
    }
  };

  // The `valueAccessor` field is typically defined on FromControl and FormControlName directive
  // instances and there is a logic in `selectValueAccessor` function that throws if it's not the
  // case. We still check the presence of `valueAccessor` before invoking its methods to make sure
  // that cleanup works correctly if app code or tests are setup to ignore the error thrown from
  // `selectValueAccessor`. See https://github.com/angular/angular/issues/40521.
  if (dir.valueAccessor) {
    dir.valueAccessor.registerOnChange(noop);
    dir.valueAccessor.registerOnTouched(noop);
  }

  cleanUpValidators(control, dir);

  if (control) {
    dir._invokeOnDestroyCallbacks();
    control._registerOnCollectionChange(() => {});
  }
}

function registerOnValidatorChange<V>(validators: (V | Validator)[], onChange: () => void): void {
  validators.forEach((validator: V | Validator) => {
    if ((<Validator>validator).registerOnValidatorChange)
      (<Validator>validator).registerOnValidatorChange!(onChange);
  });
}

/**
 * Sets up disabled change handler function on a given form control if ControlValueAccessor
 * associated with a given directive instance supports the `setDisabledState` call.
 *
 * @param control Form control where disabled change handler should be setup.
 * @param dir Corresponding directive instance associated with this control.
 */
export function setUpDisabledChangeHandler(control: FormControl, dir: NgControl): void {
  if (dir.valueAccessor!.setDisabledState) {
    const onDisabledChange = (isDisabled: boolean) => {
      dir.valueAccessor!.setDisabledState!(isDisabled);
    };
    control.registerOnDisabledChange(onDisabledChange);

    // Register a callback function to cleanup disabled change handler
    // from a control instance when a directive is destroyed.
    dir._registerOnDestroy(() => {
      control._unregisterOnDisabledChange(onDisabledChange);
    });
  }
}

/**
 * Sets up sync and async directive validators on provided form control.
 * This function merges validators from the directive into the validators of the control.
 *
 * @param control Form control where directive validators should be setup.
 * @param dir Directive instance that contains validators to be setup.
 */
export function setUpValidators(control: AbstractControl, dir: AbstractControlDirective): void {
  const validators = getControlValidators(control);
  if (dir.validator !== null) {
    control.setValidators(mergeValidators<ValidatorFn>(validators, dir.validator));
  } else if (typeof validators === 'function') {
    // If sync validators are represented by a single validator function, we force the
    // `Validators.compose` call to happen by executing the `setValidators` function with
    // an array that contains that function. We need this to avoid possible discrepancies in
    // validators behavior, so sync validators are always processed by the `Validators.compose`.
    // Note: we should consider moving this logic inside the `setValidators` function itself, so we
    // have consistent behavior on AbstractControl API level. The same applies to the async
    // validators logic below.
    control.setValidators([validators]);
  }

  const asyncValidators = getControlAsyncValidators(control);
  if (dir.asyncValidator !== null) {
    control.setAsyncValidators(
      mergeValidators<AsyncValidatorFn>(asyncValidators, dir.asyncValidator),
    );
  } else if (typeof asyncValidators === 'function') {
    control.setAsyncValidators([asyncValidators]);
  }

  // Re-run validation when validator binding changes, e.g. minlength=3 -> minlength=4
  const onValidatorChange = () => control.updateValueAndValidity();
  registerOnValidatorChange<ValidatorFn>(dir._rawValidators, onValidatorChange);
  registerOnValidatorChange<AsyncValidatorFn>(dir._rawAsyncValidators, onValidatorChange);
}

/**
 * Cleans up sync and async directive validators on provided form control.
 * This function reverts the setup performed by the `setUpValidators` function, i.e.
 * removes directive-specific validators from a given control instance.
 *
 * @param control Form control from where directive validators should be removed.
 * @param dir Directive instance that contains validators to be removed.
 * @returns true if a control was updated as a result of this action.
 */
export function cleanUpValidators(
  control: AbstractControl | null,
  dir: AbstractControlDirective,
): boolean {
  let isControlUpdated = false;
  if (control !== null) {
    if (dir.validator !== null) {
      const validators = getControlValidators(control);
      if (Array.isArray(validators) && validators.length > 0) {
        // Filter out directive validator function.
        const updatedValidators = validators.filter((validator) => validator !== dir.validator);
        if (updatedValidators.length !== validators.length) {
          isControlUpdated = true;
          control.setValidators(updatedValidators);
        }
      }
    }

    if (dir.asyncValidator !== null) {
      const asyncValidators = getControlAsyncValidators(control);
      if (Array.isArray(asyncValidators) && asyncValidators.length > 0) {
        // Filter out directive async validator function.
        const updatedAsyncValidators = asyncValidators.filter(
          (asyncValidator) => asyncValidator !== dir.asyncValidator,
        );
        if (updatedAsyncValidators.length !== asyncValidators.length) {
          isControlUpdated = true;
          control.setAsyncValidators(updatedAsyncValidators);
        }
      }
    }
  }

  // Clear onValidatorChange callbacks by providing a noop function.
  const noop = () => {};
  registerOnValidatorChange<ValidatorFn>(dir._rawValidators, noop);
  registerOnValidatorChange<AsyncValidatorFn>(dir._rawAsyncValidators, noop);

  return isControlUpdated;
}

function setUpViewChangePipeline(control: FormControl, dir: NgControl): void {
  dir.valueAccessor!.registerOnChange((newValue: any) => {
    control._pendingValue = newValue;
    control._pendingChange = true;
    control._pendingDirty = true;

    if (control.updateOn === 'change') updateControl(control, dir);
  });
}

function setUpBlurPipeline(control: FormControl, dir: NgControl): void {
  dir.valueAccessor!.registerOnTouched(() => {
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
  const onChange = (newValue?: any, emitModelEvent?: boolean) => {
    // control -> view
    dir.valueAccessor!.writeValue(newValue);

    // control -> ngModel
    if (emitModelEvent) dir.viewToModelUpdate(newValue);
  };
  control.registerOnChange(onChange);

  // Register a callback function to cleanup onChange handler
  // from a control instance when a directive is destroyed.
  dir._registerOnDestroy(() => {
    control._unregisterOnChange(onChange);
  });
}

/**
 * Links a FormGroup or FormArray instance and corresponding Form directive by setting up validators
 * present in the view.
 *
 * @param control FormGroup or FormArray instance that should be linked.
 * @param dir Directive that provides view validators.
 */
export function setUpFormContainer(
  control: FormGroup | FormArray,
  dir: AbstractFormGroupDirective | FormArrayName,
) {
  if (control == null && (typeof ngDevMode === 'undefined' || ngDevMode))
    _throwError(dir, 'Cannot find control with');
  setUpValidators(control, dir);
}

/**
 * Reverts the setup performed by the `setUpFormContainer` function.
 *
 * @param control FormGroup or FormArray instance that should be cleaned up.
 * @param dir Directive that provided view validators.
 * @returns true if a control was updated as a result of this action.
 */
export function cleanUpFormContainer(
  control: FormGroup | FormArray,
  dir: AbstractFormGroupDirective | FormArrayName,
): boolean {
  return cleanUpValidators(control, dir);
}

function _noControlError(dir: NgControl) {
  return _throwError(dir, 'There is no FormControl instance attached to form control element with');
}

function _throwError(dir: AbstractControlDirective, message: string): void {
  const messageEnd = _describeControlLocation(dir);
  throw new Error(`${message} ${messageEnd}`);
}

function _describeControlLocation(dir: AbstractControlDirective): string {
  const path = dir.path;
  if (path && path.length > 1) return `path: '${path.join(' -> ')}'`;
  if (path?.[0]) return `name: '${path}'`;
  return 'unspecified name attribute';
}

function _throwMissingValueAccessorError(dir: AbstractControlDirective) {
  const loc = _describeControlLocation(dir);
  throw new RuntimeError(
    RuntimeErrorCode.NG_MISSING_VALUE_ACCESSOR,
    `No value accessor for form control ${loc}.`,
  );
}

function _throwInvalidValueAccessorError(dir: AbstractControlDirective) {
  const loc = _describeControlLocation(dir);
  throw new RuntimeError(
    RuntimeErrorCode.NG_VALUE_ACCESSOR_NOT_PROVIDED,
    `Value accessor was not provided as an array for form control with ${loc}. ` +
      `Check that the \`NG_VALUE_ACCESSOR\` token is configured as a \`multi: true\` provider.`,
  );
}

export function isPropertyUpdated(changes: {[key: string]: any}, viewModel: any): boolean {
  if (!changes.hasOwnProperty('model')) return false;
  const change = changes['model'];

  if (change.isFirstChange()) return true;
  return !Object.is(viewModel, change.currentValue);
}

export function isBuiltInAccessor(valueAccessor: ControlValueAccessor): boolean {
  // Check if a given value accessor is an instance of a class that directly extends
  // `BuiltInControlValueAccessor` one.
  return Object.getPrototypeOf(valueAccessor.constructor) === BuiltInControlValueAccessor;
}

export function syncPendingControls(
  form: AbstractControl,
  directives: Set<NgControl> | NgControl[],
): void {
  form._syncPendingControls();
  directives.forEach((dir: NgControl) => {
    const control = dir.control as FormControl;
    if (control.updateOn === 'submit' && control._pendingChange) {
      dir.viewToModelUpdate(control._pendingValue);
      control._pendingChange = false;
    }
  });
}

// TODO: vsavkin remove it once https://github.com/angular/angular/issues/3011 is implemented
export function selectValueAccessor(
  dir: NgControl,
  valueAccessors: ControlValueAccessor[],
): ControlValueAccessor | null {
  if (!valueAccessors) return null;

  if (!Array.isArray(valueAccessors) && (typeof ngDevMode === 'undefined' || ngDevMode))
    _throwInvalidValueAccessorError(dir);

  let defaultAccessor: ControlValueAccessor | undefined = undefined;
  let builtinAccessor: ControlValueAccessor | undefined = undefined;
  let customAccessor: ControlValueAccessor | undefined = undefined;

  valueAccessors.forEach((v: ControlValueAccessor) => {
    if (v.constructor === DefaultValueAccessor) {
      defaultAccessor = v;
    } else if (isBuiltInAccessor(v)) {
      if (builtinAccessor && (typeof ngDevMode === 'undefined' || ngDevMode))
        _throwError(dir, 'More than one built-in value accessor matches form control with');
      builtinAccessor = v;
    } else {
      if (customAccessor && (typeof ngDevMode === 'undefined' || ngDevMode))
        _throwError(dir, 'More than one custom value accessor matches form control with');
      customAccessor = v;
    }
  });

  if (customAccessor) return customAccessor;
  if (builtinAccessor) return builtinAccessor;
  if (defaultAccessor) return defaultAccessor;

  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    _throwError(dir, 'No valid value accessor for form control with');
  }
  return null;
}

export function removeListItem<T>(list: T[], el: T): void {
  const index = list.indexOf(el);
  if (index > -1) list.splice(index, 1);
}

// TODO(kara): remove after deprecation period
export function _ngModelWarning(
  name: string,
  type: {_ngModelWarningSentOnce: boolean},
  instance: {_ngModelWarningSent: boolean},
  warningConfig: string | null,
) {
  if (warningConfig === 'never') return;

  if (
    ((warningConfig === null || warningConfig === 'once') && !type._ngModelWarningSentOnce) ||
    (warningConfig === 'always' && !instance._ngModelWarningSent)
  ) {
    console.warn(ngModelWarning(name));
    type._ngModelWarningSentOnce = true;
    instance._ngModelWarningSent = true;
  }
}
