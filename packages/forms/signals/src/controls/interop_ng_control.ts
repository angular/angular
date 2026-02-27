/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  effect,
  EventEmitter,
  type Injector,
  untracked,
  ɵRuntimeError as RuntimeError,
} from '@angular/core';
import {RuntimeErrorCode} from '../errors';
import {signalErrorsToValidationErrors} from '../compat/validation_errors';

import {
  ControlValueAccessor,
  Validators,
  type AbstractControl,
  type FormControlStatus,
  type ValidationErrors,
  type ValidatorFn,
  ValueChangeEvent,
  TouchedChangeEvent,
  PristineChangeEvent,
  ControlEvent,
  StatusChangeEvent,
} from '@angular/forms';
import type {FieldState} from '../api/types';

// TODO: Also consider supporting (if possible):
// - hasError
// - getError
// - reset
// - name
// - path
// - markAs[Touched,Dirty,etc.]

/**
 * Represents a combination of `NgControl` and `AbstractControl`.
 *
 * Note: We have this separate interface, rather than implementing the relevant parts of the two
 * controls with something like `InteropNgControl implements Pick<NgControl, ...>, Pick<AbstractControl, ...>`
 * because it confuses the internal JS minifier which can cause collisions in field names.
 */
interface CombinedControl {
  value: any;
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
  events: AbstractControl['events'];
  statusChanges: AbstractControl['statusChanges'];
  valueChanges: AbstractControl['valueChanges'];
  control: AbstractControl<any, any>;
  valueAccessor: ControlValueAccessor | null;
  hasValidator(validator: ValidatorFn): boolean;
  updateValueAndValidity(): void;
}

/**
 * A fake version of `NgControl` provided by the `Field` directive. This allows interoperability
 * with a wider range of components designed to work with reactive forms, in particular ones that
 * inject the `NgControl`. The interop control does not implement *all* properties and methods of
 * the real `NgControl`, but does implement some of the most commonly used ones that have a clear
 * equivalent in signal forms.
 */
export class InteropNgControl implements CombinedControl {
  /**
   * @internal
   */
  readonly _events = new EventEmitter<ControlEvent>();

  readonly valueChanges = new EventEmitter<any>();
  readonly statusChanges = new EventEmitter<FormControlStatus>();
  readonly events = this._events.asObservable();
  readonly control: AbstractControl<any, any> = this as unknown as AbstractControl<any, any>;

  constructor(
    protected field: () => FieldState<unknown>,
    readonly injector: Injector,
  ) {
    const self = this as unknown as AbstractControl;

    effect(
      () => {
        const value = this.value;
        untracked(() => {
          this.valueChanges.emit(value);
          this._events.emit(new ValueChangeEvent(value, self));
        });
      },
      {injector},
    );

    effect(
      () => {
        const status = this.status;
        untracked(() => {
          this.statusChanges.emit(status);
          this._events.emit(new StatusChangeEvent(status, self));
        });
      },
      {injector},
    );

    effect(
      () => {
        const isTouched = this.touched;
        untracked(() => this._events.emit(new TouchedChangeEvent(isTouched, self)));
      },
      {injector},
    );

    effect(
      () => {
        const isDirty = this.dirty;
        untracked(() => this._events.emit(new PristineChangeEvent(isDirty, self)));
      },
      {injector},
    );
  }

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
}
