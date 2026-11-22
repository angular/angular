/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵRuntimeError as RuntimeError} from '@angular/core';
import {signalErrorsToValidationErrors} from '../compat/validation_errors';
import {RuntimeErrorCode} from '../errors';

import {
  ControlValueAccessor,
  Validators,
  type AbstractControl,
  type FormControlStatus,
  type NgControl,
  type ValidationErrors,
  type ValidatorFn,
} from '@angular/forms';
import type {ReadonlyFieldState} from '../api/types';

/**
 * Represents a combination of `NgControl` and `AbstractControl`.
 *
 * Note: We have this separate interface, rather than implementing the relevant parts of the two
 * controls with something like `InteropNgControl implements Pick<NgControl, ...>, Pick<AbstractControl, ...>`
 * because it confuses the internal JS minifier which can cause collisions in field names.
 */
interface CombinedControl {
  value: unknown;
  valid: boolean;
  invalid: boolean;
  touched: boolean;
  untouched: boolean;
  disabled: boolean;
  enabled: boolean;
  errors: ValidationErrors | null;
  pristine: boolean;
  dirty: boolean;
  status: FormControlStatus;
  control: AbstractControl<any, any>;
  valueAccessor: ControlValueAccessor | null;
  hasValidator(validator: ValidatorFn): boolean;
  updateValueAndValidity(): void;

  // NgControl / AbstractControlDirective members
  name: NgControl['name'];
  path: NgControl['path'];
  validator: NgControl['validator'];
  asyncValidator: NgControl['asyncValidator'];
  statusChanges: AbstractControl['statusChanges'];
  valueChanges: AbstractControl['valueChanges'];
  reset: AbstractControl['reset'];
  hasError: AbstractControl['hasError'];
  getError: AbstractControl['getError'];
  viewToModelUpdate: NgControl['viewToModelUpdate'];
}

// Compile-time checks to ensure CombinedControl covers all public properties of NgControl.
type _AssertAllNgControlCovered =
  Exclude<keyof NgControl, keyof CombinedControl> extends never ? true : never;

function unsupportedFeature(feature: string): never {
  throw new RuntimeError(
    RuntimeErrorCode.UNSUPPORTED_FEATURE,
    ngDevMode &&
      `'${feature}' is not supported by the fake NgControl provided by Signal Forms ([formField]).`,
  );
}

/**
 * A fake version of `NgControl` provided by the `Field` directive. This allows interoperability
 * with a wider range of components designed to work with reactive forms, in particular ones that
 * inject the `NgControl`. The interop control does not implement *all* properties and methods of
 * the real `NgControl`, but does implement some of the most commonly used ones that have a clear
 * equivalent in signal forms.
 */
export class InteropNgControl implements CombinedControl {
  constructor(protected field: () => ReadonlyFieldState<unknown>) {}

  readonly control: AbstractControl<any, any> = this as unknown as AbstractControl<any, any>;

  get value(): unknown {
    // CVA controls are not aware of user debouncing and will expect `NgControl.value` to reflect their latest writes.
    return this.field().controlValue();
  }

  get valid(): boolean {
    return this.field().valid();
  }

  get invalid(): boolean {
    return this.field().invalid();
  }

  get pending(): boolean | null {
    return this.field().pending();
  }

  get disabled(): boolean {
    return this.field().disabled();
  }

  get enabled(): boolean {
    return !this.field().disabled();
  }

  get errors(): ValidationErrors | null {
    return signalErrorsToValidationErrors(this.field().errors());
  }

  get pristine(): boolean {
    return !this.field().dirty();
  }

  get dirty(): boolean {
    return this.field().dirty();
  }

  get touched(): boolean {
    return this.field().touched();
  }

  get untouched(): boolean {
    return !this.field().touched();
  }

  get status(): FormControlStatus {
    if (this.field().disabled()) {
      return 'DISABLED';
    }
    if (this.field().valid()) {
      return 'VALID';
    }
    if (this.field().invalid()) {
      return 'INVALID';
    }
    if (this.field().pending()) {
      return 'PENDING';
    }
    throw new RuntimeError(
      RuntimeErrorCode.UNKNOWN_STATUS,
      ngDevMode && 'Unknown form control status',
    );
  }

  valueAccessor: ControlValueAccessor | null = null;

  hasValidator(validator: ValidatorFn): boolean {
    // This addresses a common case where users look for the presence of `Validators.required` to
    // determine whether or not to show a required "*" indicator in the UI.
    if (validator === Validators.required) {
      return this.field().required();
    }
    return false;
  }

  updateValueAndValidity() {
    // No-op since value and validity are always up to date in signal forms.
    // We offer this method so that reactive forms code attempting to call it doesn't error.
  }

  get name(): NgControl['name'] {
    return unsupportedFeature('name');
  }

  get path(): NgControl['path'] {
    return unsupportedFeature('path');
  }

  get validator(): NgControl['validator'] {
    return unsupportedFeature('validator');
  }

  get asyncValidator(): NgControl['asyncValidator'] {
    return unsupportedFeature('asyncValidator');
  }

  get statusChanges(): AbstractControl['statusChanges'] {
    return unsupportedFeature('statusChanges');
  }

  get valueChanges(): AbstractControl['valueChanges'] {
    return unsupportedFeature('valueChanges');
  }

  viewToModelUpdate(newValue: any): void {
    unsupportedFeature('viewToModelUpdate');
  }

  reset(value?: any, options?: Object): void {
    unsupportedFeature('reset');
  }

  hasError(errorCode: string, path?: Array<string | number> | string): boolean {
    return unsupportedFeature('hasError');
  }

  getError(errorCode: string, path?: Array<string | number> | string): any {
    return unsupportedFeature('getError');
  }
}
