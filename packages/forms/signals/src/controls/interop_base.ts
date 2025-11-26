/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FormControlStatus, type NgControl, ValidationErrors} from '@angular/forms';
import {FieldState} from '../api/types';

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
 * Base class for Interop controls.
 */
export abstract class InteropBase<T> implements Pick<NgControl, InteropSharedKeys> {
  constructor(protected field: () => FieldState<T>) {}

  get value(): T {
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
}
