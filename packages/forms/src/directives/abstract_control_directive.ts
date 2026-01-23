/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Observable} from 'rxjs';

import {AbstractControl} from '../model/abstract_model';
import {composeAsyncValidators, composeValidators} from '../validators';

import {
  AsyncValidator,
  AsyncValidatorFn,
  ValidationErrors,
  Validator,
  ValidatorFn,
} from './validators';

/**
 * @description
 * Base class for control directives.
 *
 * This class is only used internally in the `ReactiveFormsModule` and the `FormsModule`.
 *
 * @publicApi
 */
export abstract class AbstractControlDirective {
  /**
   * @description
   * A reference to the underlying control.
   *
   * @returns the control that backs this directive. Most properties fall through to that instance.
   */
  abstract get control(): AbstractControl | null;

  /**
   * @description
   * Reports the value of the control if it is present, otherwise null.
   */
  get value(): any {
    return this.control ? this.control.value : null;
  }

  /**
   * @description
   * Reports whether the control is valid. A control is considered valid if no
   * validation errors exist with the current value.
   * If the control is not present, null is returned.
   */
  get valid(): boolean | null {
    return this.control ? this.control.valid : null;
  }

  /**
   * @description
   * Reports whether the control is invalid, meaning that an error exists in the input value.
   * If the control is not present, null is returned.
   */
  get invalid(): boolean | null {
    return this.control ? this.control.invalid : null;
  }

  /**
   * @description
   * Reports whether a control is pending, meaning that async validation is occurring and
   * errors are not yet available for the input value. If the control is not present, null is
   * returned.
   */
  get pending(): boolean | null {
    return this.control ? this.control.pending : null;
  }

  /**
   * @description
   * Reports whether the control is disabled, meaning that the control is disabled
   * in the UI and is exempt from validation checks and excluded from aggregate
   * values of ancestor controls. If the control is not present, null is returned.
   */
  get disabled(): boolean | null {
    return this.control ? this.control.disabled : null;
  }

  /**
   * @description
   * Reports whether the control is enabled, meaning that the control is included in ancestor
   * calculations of validity or value. If the control is not present, null is returned.
   */
  get enabled(): boolean | null {
    return this.control ? this.control.enabled : null;
  }

  /**
   * @description
   * Reports the control's validation errors. If the control is not present, null is returned.
   */
  get errors(): ValidationErrors | null {
    return this.control ? this.control.errors : null;
  }

  /**
   * @description
   * Reports whether the control is pristine, meaning that the user has not yet changed
   * the value in the UI. If the control is not present, null is returned.
   */
  get pristine(): boolean | null {
    return this.control ? this.control.pristine : null;
  }

  /**
   * @description
   * Reports whether the control is dirty, meaning that the user has changed
   * the value in the UI. If the control is not present, null is returned.
   */
  get dirty(): boolean | null {
    return this.control ? this.control.dirty : null;
  }

  /**
   * @description
   * Reports whether the control is touched, meaning that the user has triggered
   * a `blur` event on it. If the control is not present, null is returned.
   */
  get touched(): boolean | null {
    return this.control ? this.control.touched : null;
  }

  /**
   * @description
   * Reports the validation status of the control. Possible values include:
   * 'VALID', 'INVALID', 'DISABLED', and 'PENDING'.
   * If the control is not present, null is returned.
   */
  get status(): string | null {
    return this.control ? this.control.status : null;
  }

  /**
   * @description
   * Reports whether the control is untouched, meaning that the user has not yet triggered
   * a `blur` event on it. If the control is not present, null is returned.
   */
  get untouched(): boolean | null {
    return this.control ? this.control.untouched : null;
  }

  /**
   * @description
   * Returns a multicasting observable that emits a validation status whenever it is
   * calculated for the control. If the control is not present, null is returned.
   */
  get statusChanges(): Observable<any> | null {
    return this.control ? this.control.statusChanges : null;
  }

  /**
   * @description
   * Returns a multicasting observable of value changes for the control that emits every time the
   * value of the control changes in the UI or programmatically.
   * If the control is not present, null is returned.
   */
  get valueChanges(): Observable<any> | null {
    return this.control ? this.control.valueChanges : null;
  }

  /**
   * @description
   * Returns an array that represents the path from the top-level form to this control.
   * Each index is the string name of the control on that level.
   */
  get path(): string[] | null {
    return null;
  }

  /**
   * Contains the result of merging synchronous validators into a single validator function
   * (combined using `Validators.compose`).
   */
  private _composedValidatorFn: ValidatorFn | null | undefined;

  /**
   * Contains the result of merging asynchronous validators into a single validator function
   * (combined using `Validators.composeAsync`).
   */
  private _composedAsyncValidatorFn: AsyncValidatorFn | null | undefined;

  /**
   * Set of synchronous validators as they were provided while calling `setValidators` function.
   * @internal
   */
  _rawValidators: Array<Validator | ValidatorFn> = [];

  /**
   * Set of asynchronous validators as they were provided while calling `setAsyncValidators`
   * function.
   * @internal
   */
  _rawAsyncValidators: Array<AsyncValidator | AsyncValidatorFn> = [];

  /**
   * Sets synchronous validators for this directive.
   * @internal
   */
  _setValidators(validators: Array<Validator | ValidatorFn> | undefined): void {
    this._rawValidators = validators || [];
    this._composedValidatorFn = composeValidators(this._rawValidators);
  }

  /**
   * Sets asynchronous validators for this directive.
   * @internal
   */
  _setAsyncValidators(validators: Array<AsyncValidator | AsyncValidatorFn> | undefined): void {
    this._rawAsyncValidators = validators || [];
    this._composedAsyncValidatorFn = composeAsyncValidators(this._rawAsyncValidators);
  }

  /**
   * @description
   * Synchronous validator function composed of all the synchronous validators registered with this
   * directive.
   */
  get validator(): ValidatorFn | null {
    return this._composedValidatorFn || null;
  }

  /**
   * @description
   * Asynchronous validator function composed of all the asynchronous validators registered with
   * this directive.
   */
  get asyncValidator(): AsyncValidatorFn | null {
    return this._composedAsyncValidatorFn || null;
  }

  /*
   * The set of callbacks to be invoked when directive instance is being destroyed.
   */
  private _onDestroyCallbacks: (() => void)[] = [];

  /**
   * Internal function to register callbacks that should be invoked
   * when directive instance is being destroyed.
   * @internal
   */
  _registerOnDestroy(fn: () => void): void {
    this._onDestroyCallbacks.push(fn);
  }

  /**
   * Internal function to invoke all registered "on destroy" callbacks.
   * Note: calling this function also clears the list of callbacks.
   * @internal
   */
  _invokeOnDestroyCallbacks(): void {
    this._onDestroyCallbacks.forEach((fn) => fn());
    this._onDestroyCallbacks = [];
  }

  /**
   * @description
   * Resets the control with the provided value if the control is present.
   */
  reset(value: any = undefined): void {
    if (this.control) this.control.reset(value);
  }

  /**
   * @description
   * Reports whether the control with the given path has the error specified.
   *
   * @param errorCode The code of the error to check
   * @param path A list of control names that designates how to move from the current control
   * to the control that should be queried for errors.
   *
   * @usageNotes
   * For example, for the following `FormGroup`:
   *
   * ```ts
   * form = new FormGroup({
   *   address: new FormGroup({ street: new FormControl() })
   * });
   * ```
   *
   * The path to the 'street' control from the root form would be 'address' -> 'street'.
   *
   * It can be provided to this method in one of two formats:
   *
   * 1. An array of string control names, e.g. `['address', 'street']`
   * 1. A period-delimited list of control names in one string, e.g. `'address.street'`
   *
   * If no path is given, this method checks for the error on the current control.
   *
   * @returns whether the given error is present in the control at the given path.
   *
   * If the control is not present, false is returned.
   */
  hasError(errorCode: string, path?: Array<string | number> | string): boolean {
    return this.control ? this.control.hasError(errorCode, path) : false;
  }

  /**
   * @description
   * Reports error data for the control with the given path.
   *
   * @param errorCode The code of the error to check
   * @param path A list of control names that designates how to move from the current control
   * to the control that should be queried for errors.
   *
   * @usageNotes
   * For example, for the following `FormGroup`:
   *
   * ```ts
   * form = new FormGroup({
   *   address: new FormGroup({ street: new FormControl() })
   * });
   * ```
   *
   * The path to the 'street' control from the root form would be 'address' -> 'street'.
   *
   * It can be provided to this method in one of two formats:
   *
   * 1. An array of string control names, e.g. `['address', 'street']`
   * 1. A period-delimited list of control names in one string, e.g. `'address.street'`
   *
   * @returns error data for that particular error. If the control or error is not present,
   * null is returned.
   */
  getError(errorCode: string, path?: Array<string | number> | string): any {
    return this.control ? this.control.getError(errorCode, path) : null;
  }
}
