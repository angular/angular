/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, signal, Signal} from '@angular/core';
import {AbstractControl} from '@angular/forms';
import {getControlStatusSignal} from './compat_field_node';
import {CompatFieldNodeOptions} from './compat_structure';
import {calculateValidationSelfStatus, ValidationState} from '../validation';
import {reactiveErrorsToSignalErrors, ReactiveValidationError} from './compat_validation_error';
import {ValidationError} from '../../api/validation_errors';

/**
 * Compat version of a validation state that wraps a FormControl, and proxies it's validation state.
 */
export class CompatValidationState implements ValidationState {
  readonly syncValid: Signal<boolean>;
  /**
   * All validation errors for this field.
   */
  readonly errors: Signal<ReactiveValidationError[]>;
  readonly pending: Signal<boolean>;
  readonly invalid: Signal<boolean>;
  readonly valid: Signal<boolean>;

  constructor(options: CompatFieldNodeOptions) {
    this.syncValid = getControlStatusSignal(options, (c: AbstractControl) => c.status === 'VALID');
    this.errors = getControlStatusSignal(options, (c) => reactiveErrorsToSignalErrors(c.errors));
    this.pending = getControlStatusSignal(options, (c) => c.pending);

    this.valid = getControlStatusSignal(options, (c) => {
      return c.valid;
    });

    this.invalid = getControlStatusSignal(options, (c) => {
      return c.invalid;
    });
  }

  asyncErrors: Signal<(ValidationError | 'pending')[]> = signal([]);
  errorSummary: Signal<ValidationError[]> = signal([]);

  // Those are irrelevant for compat mode
  rawSyncTreeErrors = signal([]);
  syncErrors = signal([]);
  rawAsyncErrors = signal([]);
  shouldSkipValidation = signal(true);

  /**
   * The validation status of the field.
   * - The status is 'valid' if neither the field nor any of its children has any errors or pending
   *   validators.
   * - The status is 'invalid' if the field or any of its children has an error
   *   (regardless of pending validators)
   * - The status is 'pending' if neither the field nor any of its children has any errors,
   *   but the field or any of its children does have a pending validator.
   *
   * This field considers itself valid if *all* of the following are true:
   *  - it has no errors
   *  - all of its children consider themselves valid
   */
  readonly status: Signal<'valid' | 'invalid' | 'unknown'> = computed(() => {
    return calculateValidationSelfStatus(this);
  });
}
