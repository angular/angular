/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ControlValueAccessor,
  Validators,
  type AbstractControl,
  type FormControlStatus,
  type NgControl,
  type ValidationErrors,
  type ValidatorFn,
} from '@angular/forms';
import {REQUIRED} from '../api/property';
import type {FieldState} from '../api/types';

// TODO: Also consider supporting (if possible):
// - hasError
// - getError
// - reset
// - name
// - path
// - markAs[Touched,Dirty,etc.]

/**
 * Properties of both NgControl & AbstractControl that are supported by the InteropNgControl.
 */
export type InteropSharedKeys =
  | 'value'
  | 'valid'
  | 'invalid'
  | 'touched'
  | 'untouched'
  | 'disabled'
  | 'enabled'
  | 'errors'
  | 'pristine'
  | 'dirty'
  | 'status';

/**
 * A fake version of `NgControl` provided by the `Control` directive. This allows interoperability
 * with a wider range of components designed to work with reactive forms, in particular ones that
 * inject the `NgControl`. The interop control does not implement *all* properties and methods of
 * the real `NgControl`, but does implement some of the most commonly used ones that have a clear
 * equivalent in signal forms.
 */
export class InteropNgControl
  implements
    Pick<NgControl, InteropSharedKeys | 'control' | 'valueAccessor'>,
    Pick<AbstractControl<unknown>, InteropSharedKeys | 'hasValidator'>
{
  constructor(protected field: () => FieldState<unknown>) {}

  readonly control: AbstractControl<any, any> = this as unknown as AbstractControl<any, any>;

  get value(): any {
    return this.field().value();
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
    const errors = this.field().errors();
    if (errors.length === 0) {
      return null;
    }
    const errObj: ValidationErrors = {};
    for (const error of errors) {
      errObj[error.kind] = error;
    }
    return errObj;
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
    throw Error('AssertionError: unknown form control status');
  }

  valueAccessor: ControlValueAccessor | null = null;

  hasValidator(validator: ValidatorFn): boolean {
    // This addresses a common case where users look for the presence of `Validators.required` to
    // determine whether or not to show a required "*" indicator in the UI.
    if (validator === Validators.required) {
      return this.field().property(REQUIRED)();
    }
    return false;
  }

  updateValueAndValidity() {
    // No-op since value and validity are always up to date in signal forms.
    // We offer this method so that reactive forms code attempting to call it doesn't error.
  }
}
